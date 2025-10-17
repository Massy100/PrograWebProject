"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "../styles/CartSidebar.css";

// Tipo actualizado para que coincida con los datos guardados en localStorage
type CartItem = {
  portfolio: string;
  stockName: string;
  stockSymbol: string;
  stockPrice: number;
  quantity: number;
  total: number;
  date: string;
};

type Props = {
  onClose: () => void;
  show?: boolean;
};

export default function CartSidebar({ onClose, show = false }: Props) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    const storedCart = localStorage.getItem("shoppingCart");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
        console.log("🛒 Datos cargados desde localStorage:", parsedCart);
      } catch (error) {
        console.error("Error leyendo localStorage:", error);
      }
    }
  }, []);

  // Incrementar cantidad
  const incrementQuantity = (stockSymbol: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.stockSymbol === stockSymbol
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrementar cantidad
  const decrementQuantity = (stockSymbol: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.stockSymbol === stockSymbol && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Actualizar cantidad manualmente
  const updateQuantity = (itemToUpdate: CartItem, newQty: number) => {
    if (newQty < 1) return;

    const updatedCart = cart.map((item) =>
      item.stockSymbol === itemToUpdate.stockSymbol &&
      item.portfolio === itemToUpdate.portfolio &&
      item.date === itemToUpdate.date
        ? { ...item, quantity: newQty, total: item.stockPrice * newQty }
        : item
    );

    setCart(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart)); 
  };


  // Eliminar item
  const removeItem = (itemToRemove: CartItem) => {
    const updatedCart = cart.filter(
      (item) =>
        !(
          item.stockSymbol === itemToRemove.stockSymbol &&
          item.portfolio === itemToRemove.portfolio &&
          item.date === itemToRemove.date
        )
    );

    setCart(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    setSelectedItem(null);
  };

  // Calcular total general
  const total = cart.reduce((acc, p) => acc + p.total, 0);

  // Ir a página de compra
  const handleFinishPurchase = () => {
    router.push("/purchase");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  return (
    <>
      {show && <div className="wallet-overlay"></div>}

      <div ref={sidebarRef} className={`cartSidebar ${show ? "show" : ""}`}>
        <button className="cartCloseBtn" onClick={onClose}>
          ×
        </button>

        {!selectedItem ? (
          <>
            <h2 className="cartHeader">My Stocks</h2>

            <div className="cartList">
              {cart.length === 0 ? (
                <p className="cartEmpty">Your cart is empty</p>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={index}
                    className="cartCard"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="cartCardLeft">
                      {/* <div className="cartCardIcon">
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 24 24"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="none"
                            strokeWidth="2"
                            d="M1,16 L8,9 L13,14 L23,4 M0,22 L23.999,22 M16,4 L23,4 L23,11"
                          ></path>
                        </svg>
                      </div> */}
                      <div>
                        <p className="cartCardPortfolio">
                          Portfolio: {item.portfolio}
                        </p>
                        <p className="cartCardName">{item.stockName}</p>
                        <p className="cartCardQty">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="cartCardPrice">
                      Q.{item.total.toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="cartFooter">
              <div className="cartTotal">Total: Q.{total.toFixed(2)}</div>
              <button
                className="cartFinishBtn"
                onClick={handleFinishPurchase}
                disabled={cart.length === 0}
              >
                Finish Purchase
              </button>
            </div>
          </>
        ) : (
          <div className="cartDetail">
            <button className="backBtn" onClick={() => setSelectedItem(null)}>
              ← Back
            </button>

            <div className="cartDetailHeader">
              <div>
                <p className="cartDetailName">{selectedItem.stockName}</p>
                <p className="cartDetailCompany">
                  {selectedItem.stockSymbol}
                </p>
              </div>
              <p className="cartDetailPrice">
                Q.{(selectedItem.stockPrice * selectedItem.quantity).toFixed(2)}
              </p>
            </div>

            <div className="cartDetailInfo">
              <p>
                <strong>Date Added:</strong> {selectedItem.date}
              </p>
              <p>
                <strong>Portfolio:</strong> {selectedItem.portfolio}
              </p>
              <p>
                <strong>Individual Price:</strong> Q.
                {selectedItem.stockPrice.toFixed(2)}
              </p>
            </div>

            <div className="cartDetailQuantity">
              <label htmlFor="quantityInput">Quantity</label>
              <input
                id="quantityInput"
                type="number"
                min={1}
                value={selectedItem.quantity}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value, 10);
                  if (newQty > 0) {
                    updateQuantity(selectedItem, newQty);
                    setSelectedItem({ ...selectedItem, quantity: newQty, total: selectedItem.stockPrice * newQty });
                  }
                }}
              />
            </div>

            <div className="cartDetailActions">
              <button onClick={() => removeItem(selectedItem)} className="cartBtnRemove">Remove</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
