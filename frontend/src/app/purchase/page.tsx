'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import './PurchasePage.css';

type CartItem = {
  portfolio: string;
  stockName: string;
  stockSymbol: string;
  stockPrice: number;
  quantity: number;
  total: number;
  date: string;
  stock_id?: number;
  portfolio_id?: number;
};

export default function PurchasePage() {
  const router = useRouter();
  const { getAccessTokenSilently } = useAuth0();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('shoppingCart');
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      setCart(parsed);
    }
  }, []);

  const portfolios = [...new Set(cart.map((item) => item.portfolio))];
  const filteredCart = selectedPortfolio
    ? cart.filter((item) => item.portfolio === selectedPortfolio)
    : cart;

  const total = filteredCart.reduce((acc, p) => acc + p.total, 0);

  const removeItem = (symbol: string, portfolio: string, date: string) => {
    const updated = cart.filter(
      (i) =>
        !(
          i.stockSymbol === symbol &&
          i.portfolio === portfolio &&
          i.date === date
        )
    );
    setCart(updated);
    localStorage.setItem('shoppingCart', JSON.stringify(updated));
  };

  const updateQuantity = (
    symbol: string,
    portfolio: string,
    date: string,
    qty: number
  ) => {
    const updated = cart.map((i) =>
      i.stockSymbol === symbol &&
      i.portfolio === portfolio &&
      i.date === date
        ? { ...i, quantity: qty, total: qty * i.stockPrice }
        : i
    );
    setCart(updated);
    localStorage.setItem('shoppingCart', JSON.stringify(updated));
  };

  const handleCheckout = async () => {
    if (filteredCart.length === 0) {
      alert('⚠️ No stocks to purchase in this portfolio.');
      return;
    }

    try {
      setLoading(true);

      const token = await getAccessTokenSilently();
      const currentUser = JSON.parse(localStorage.getItem('auth') || '{}');

      if (!currentUser.id) {
        alert('User not found in localStorage. Please log in again.');
        return;
      }

      // ✅ 1️⃣ Obtener client profile id
      const userRes = await fetch(
        `http://localhost:8000/api/users/${currentUser.id}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      );

      if (!userRes.ok) {
        const txt = await userRes.text();
        console.error('❌ Error fetching user:', txt);
        throw new Error('Failed to get user profile');
      }

      const userData = await userRes.json();
      const clientProfileId = userData.client_profile?.id;

      if (!clientProfileId) {
        alert('⚠️ No client profile found for this user.');
        return;
      }

      // ✅ 2️⃣ Obtener los IDs de cada acción y portafolio antes de enviar
      const enrichedDetails = await Promise.all(
        filteredCart.map(async (item) => {
          let stock_id = null;
          let portfolio_id = null;

          try {
            // Buscar el stock por nombre o símbolo
            const stockRes = await fetch(
              `http://localhost:8000/api/stocks/by-name/?name=${encodeURIComponent(
                item.stockName
              )}`
            );
            if (stockRes.ok) {
              const stockData = await stockRes.json();
              stock_id = stockData?.id || null;
            }
          } catch (err) {
            console.error(`⚠️ Could not fetch stock id for ${item.stockName}`);
          }

          try {
            // Buscar el portafolio
            const portfolioRes = await fetch(
              `http://localhost:8000/api/portfolio/portfolios/?search=${encodeURIComponent(
                item.portfolio
              )}`
            );
            if (portfolioRes.ok) {
              const portfolioData = await portfolioRes.json();
              portfolio_id = portfolioData?.[0]?.id || null;
            }
          } catch (err) {
            console.error(`⚠️ Could not fetch portfolio id for ${item.portfolio}`);
          }

          if (!stock_id || !portfolio_id) {
            console.warn(`Missing IDs for ${item.stockName} / ${item.portfolio}`);
          }

          return {
            stock_id,
            portfolio_id,
            quantity: item.quantity,
            unit_price: item.stockPrice,
          };
        })
      );

      // ✅ 3️⃣ Armar el payload final
      const transactionPayload = {
        client_id: clientProfileId,
        total_amount: total,
        details: enrichedDetails,
      };

      console.log('📦 Payload to send:', transactionPayload);

      // ✅ 4️⃣ Enviar la transacción al backend
      const res = await fetch('http://localhost:8000/api/transactions/buy/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('❌ Backend error:', errText);
        throw new Error(`Error ${res.status}`);
      }

      const result = await res.json();
      console.log('✅ Transaction success:', result);

      // ✅ 5️⃣ Limpiar el carrito
      const remaining = cart.filter(
        (item) =>
          !filteredCart.some(
            (f) =>
              f.stockSymbol === item.stockSymbol &&
              f.portfolio === item.portfolio
          )
      );
      localStorage.setItem('shoppingCart', JSON.stringify(remaining));

      // ✅ 6️⃣ Mostrar modal de éxito
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/dashboard-user');
      }, 2500);
    } catch (err) {
      console.error('❌ Error creating transaction:', err);
      alert('There was a problem processing the purchase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="purchase-container">
      <h1>Confirm Purchase</h1>

      <div className="portfolio-select">
        <label>Select Portfolio:</label>
        <select
          value={selectedPortfolio}
          onChange={(e) => setSelectedPortfolio(e.target.value)}
        >
          <option value="">All</option>
          {portfolios.map((p, idx) => (
            <option key={idx} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {filteredCart.length > 0 && (
        <div className="cart-header">
          <span className="col-stock">Stock</span>
          <span className="col-quantity">Quantity</span>
          <span className="col-unit">Unit Price</span>
          <span className="col-total">Total Price</span>
          <span className="col-action"></span>
        </div>
      )}

      <div className="cart-list">
        {filteredCart.length === 0 ? (
          <p>No stocks in this portfolio.</p>
        ) : (
          filteredCart.map((item, idx) => (
            <div className="cart-item" key={idx}>
              <div className="cart-stock-info">
                <h3>{item.stockName}</h3>
                <p className="symbol">{item.stockSymbol}</p>
                <p className="portfolio">Portfolio: {item.portfolio}</p>
              </div>

              <div className="cart-quantity">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      item.stockSymbol,
                      item.portfolio,
                      item.date,
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <div className="cart-unit">Q.{item.stockPrice.toFixed(2)}</div>
              <div className="cart-total">Q.{item.total.toFixed(2)}</div>

              <button
                className="remove-btn"
                onClick={() =>
                  removeItem(item.stockSymbol, item.portfolio, item.date)
                }
              >
                ✖
              </button>
            </div>
          ))
        )}
      </div>

      <div className="checkout-section">
        <h2>Total: Q.{total.toFixed(2)}</h2>
        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={filteredCart.length === 0 || loading}
        >
          {loading ? 'Processing...' : 'Confirm Purchase'}
        </button>
      </div>

      {showModal && (
        <div className="portfolioOverlay">
          <div className="portfolioModal">
            <h3>✅ Your transaction has been completed</h3>
            <p>You will be redirected to your dashboard shortly...</p>
          </div>
        </div>
      )}
    </div>
  );
}
