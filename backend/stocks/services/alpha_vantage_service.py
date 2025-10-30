import requests
from django.conf import settings
import time
import logging

logger = logging.getLogger(__name__)

class AlphaVantageService:
    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.base_url = "https://www.alphavantage.co/query"
        self.last_call_time = 0
        self.min_interval = 12  # 5 llamadas por minuto
        
        if not self.api_key:
            raise ValueError("ALPHA_VANTAGE_API_KEY no está configurada")
    
    def _rate_limit(self):
        """Manejar límite de rate limiting"""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        if time_since_last_call < self.min_interval:
            sleep_time = self.min_interval - time_since_last_call
            logger.debug(f"Rate limiting: esperando {sleep_time:.2f} segundos")
            time.sleep(sleep_time)
        
        self.last_call_time = time.time()
    
    def _make_request(self, params):
        """Método genérico para hacer requests a la API"""
        self._rate_limit()
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error en request a Alpha Vantage: {e}")
            return {'error': f'Error de conexión: {str(e)}'}
        except ValueError as e:
            logger.error(f"Error parseando JSON: {e}")
            return {'error': 'Error procesando respuesta de la API'}
    
    def get_stock_quote(self, symbol):
        """Obtener cotización actual de una acción"""
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol.upper(),
            'apikey': self.api_key
        }
        
        data = self._make_request(params)
        
        if 'error' in data:
            return data
        
        if 'Global Quote' in data and data['Global Quote']:
            quote = data['Global Quote']
            return {
                'symbol': symbol.upper(),
                'price': float(quote['05. price']),
                'change': float(quote['09. change']),
                'change_percent': float(quote['10. change percent'].rstrip('%')),
                'volume': int(quote['06. volume']),
                'last_updated': quote['07. latest trading day']
            }
        elif 'Error Message' in data:
            return {'error': f"Symbol {symbol} no encontrado"}
        else:
            return {'error': data.get('Note', 'Error desconocido en Alpha Vantage')}
    
    def get_historical_data(self, symbol, days=30):
        """Obtener datos históricos"""
        params = {
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol.upper(),
            'apikey': self.api_key,
            'outputsize': 'compact' if days <= 100 else 'full'
        }
        
        data = self._make_request(params)
        
        if 'error' in data:
            return []
        
        if 'Time Series (Daily)' in data:
            time_series = data['Time Series (Daily)']
            historical_prices = []
            
            # Obtener los últimos 'days' días
            for date_str, values in list(time_series.items())[:days]:
                historical_prices.append({
                    'date': date_str,
                    'open': float(values['1. open']),
                    'high': float(values['2. high']),
                    'low': float(values['3. low']),
                    'close': float(values['4. close']),
                    'volume': int(values['5. volume'])
                })
            
            # Ordenar por fecha (más antiguo primero)
            historical_prices.sort(key=lambda x: x['date'])
            return historical_prices
        else:
            return []
    
    def get_stock_search(self, keywords):
        """Buscar stocks por keywords"""
        params = {
            'function': 'SYMBOL_SEARCH',
            'keywords': keywords,
            'apikey': self.api_key
        }
        
        data = self._make_request(params)
        
        if 'error' in data:
            return []
        
        if 'bestMatches' in data:
            return [
                {
                    'symbol': match['1. symbol'],
                    'name': match['2. name'],
                    'type': match['3. type'],
                    'region': match['4. region']
                }
                for match in data['bestMatches']
            ]
        else:
            return []