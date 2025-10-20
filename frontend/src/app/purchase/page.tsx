"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./PurchasePage.css";

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("shoppingCart");
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
    localStorage.setItem("shoppingCart", JSON.stringify(updated));
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
    localStorage.setItem("shoppingCart", JSON.stringify(updated));
  };

// AQUI ES DONDE SE ESTA ARMANDO EL JSON PARA MANDARLE AL BACK
// FIJOOO SE LE TIENE QUE MANDAR ESTOS DATOS
// LOS DATOS QUE SE ESTA MANDANDO AHORA ESTA INCORRECTOS YA QUE NO SE OBTIENE EL ID CORRECTO DE USER, AL IGUAL QUE EL DE LA STOCK Y LA DEL PORTAFOLIO
//  {
//      "client_id": number,             // required → ID of the logged-in client (must come from auth)
//      "total_amount": number,          // required → total amount of this purchase
//      "details": [                     // required → list of all stock purchases in this transaction
//        {
//          "stock_id": number,          // required → ID of the stock being purchased
//          "quantity": number,          // required → number of shares purchased
//          "unit_price": number,        // required → price per share at the time of purchase
//          "portfolio_id": number       // required → ID of the portfolio where this stock is being stored
//        },
//        ...
//      ]
//    }

// OTRA COSA CUANDO YA ESTE CONECTADO EL BACK ASEGURARSE DE MANEJAR EL ESCENARIO SI ALGO SALIO MAL YA QUE AQUI SIEMPRE EL RESULTADO ES CORRECTO

  const handleCheckout = async () => {
    if (filteredCart.length === 0) {
      alert("⚠️ No stocks to purchase in this portfolio.");
      return;
    }

    const transactionPayload = {
      client_id: 1,
      total_amount: total,
      details: filteredCart.map((item) => ({
        stock_id: item.stock_id ?? Math.floor(Math.random() * 1000),
        quantity: item.quantity,
        unit_price: item.stockPrice,
        portfolio_id:
          item.portfolio_id ?? portfolios.indexOf(item.portfolio) + 1,
      })),
    };

    console.log("📦 Payload to send (filtered):", transactionPayload);


    const remaining = cart.filter(
      (item) =>
        !filteredCart.some(
          (f) =>
            f.stockSymbol === item.stockSymbol && f.portfolio === item.portfolio
        )
    );
    localStorage.setItem("shoppingCart", JSON.stringify(remaining));

    setShowModal(true);
    setTimeout(() => {
      router.push("/dashboard-user");
    }, 2500);
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
          disabled={filteredCart.length === 0}
        >
          Confirm Purchase
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
