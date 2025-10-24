import requests
from django.conf import settings
from datetime import datetime, timedelta
import time

class AlphaVantageService:
    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.base_url = "https://www.alphavantage.co/query"
        self.last_call_time = 0
        self.min_interval = 12  # Para respetar el límite de 5 llamadas por minuto
    
    def _rate_limit(self):
        """Manejar límite de rate limiting"""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        if time_since_last_call < self.min_interval:
            time.sleep(self.min_interval - time_since_last_call)
        
        self.last_call_time = time.time()
    
    def get_stock_quote(self, symbol):
        """Obtener cotización actual de una acción"""
        self._rate_limit()
        
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            data = response.json()
            
            if 'Global Quote' in data:
                quote = data['Global Quote']
                return {
                    'symbol': symbol,
                    'price': float(quote['05. price']),
                    'change': float(quote['09. change']),
                    'change_percent': float(quote['10. change percent'].rstrip('%')),
                    'volume': int(quote['06. volume'])
                }
            else:
                return {'error': data.get('Note', 'Error en Alpha Vantage')}
                
        except Exception as e:
            return {'error': str(e)}
    
    def get_historical_data(self, symbol, days=30):
        """Obtener datos históricos de los últimos 30 días"""
        self._rate_limit()
        
        params = {
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol,
            'apikey': self.api_key,
            'outputsize': 'compact'
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            data = response.json()
            
            if 'Time Series (Daily)' in data:
                time_series = data['Time Series (Daily)']
                historical_prices = []
                
                # Obtener los últimos 'days' días
                for date_str, values in list(time_series.items())[:days]:
                    historical_prices.append({
                        'date': date_str,
                        'price': float(values['4. close'])
                    })
                
                # Ordenar por fecha (más antiguo primero) y extraer solo precios
                historical_prices.sort(key=lambda x: x['date'])
                prices_only = [item['price'] for item in historical_prices]
                
                return prices_only
            else:
                return []
                
        except Exception as e:
            return []
    
    def get_stock_search(self, keywords):
        """Buscar stocks por keywords"""
        self._rate_limit()
        
        params = {
            'function': 'SYMBOL_SEARCH',
            'keywords': keywords,
            'apikey': self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            data = response.json()
            
            if 'bestMatches' in data:
                return data['bestMatches']
            else:
                return []
        except Exception as e:
            return []