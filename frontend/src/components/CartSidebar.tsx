"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "../styles/CartSidebar.css";

type CartItem = {
  stockId: number;
  name: string;
  quantity: number;
  price: number;
  dateAdded?: string;
  company?: string;
};

type Props = {
  onClose: () => void;
  show?: boolean;
};

export default function CartSidebar({ onClose, show = false }: Props) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [cart, setCart] = useState<CartItem[]>([
    {
      stockId: 1,
      name: "Apple Inc.",
      quantity: 1,
      price: 150,
      dateAdded: "2025-10-12",
      company: "NASDAQ",
    },
    {
      stockId: 2,
      name: "Microsoft Corp.",
      quantity: 2,
      price: 280,
      dateAdded: "2025-10-10",
      company: "NASDAQ",
    },
    {
      stockId: 3,
      name: "Google LLC",
      quantity: 1,
      price: 2700,
      dateAdded: "2025-10-11",
      company: "NASDAQ",
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  const incrementQuantity = (stockId: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.stockId === stockId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQuantity = (stockId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.stockId === stockId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateQuantity = (stockId: number, newQty: number) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.stockId === stockId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeItem = (stockId: number) => {
    setCart((prev) => prev.filter((item) => item.stockId !== stockId));
    setSelectedItem(null);
  };

  const total = cart.reduce((acc, p) => acc + p.price * p.quantity, 0);

  const handleFinishPurchase = () => {
    router.push("/purchase-sale");
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
                cart.map((item) => (
                  <div
                    key={item.stockId}
                    className="cartCard"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="cartCardLeft">
                      <div className="cartCardIcon"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-width="2" d="M1,16 L8,9 L13,14 L23,4 M0,22 L23.999,22 M16,4 L23,4 L23,11"></path></svg></div>
                      <div>
                        <p className="cartCardName">{item.name}</p>
                        <p className="cartCardQty">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="cartCardPrice">
                      Q.{(item.price * item.quantity).toFixed(2)}
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
                <p className="cartDetailName">{selectedItem.name}</p>
                <p className="cartDetailCompany">{selectedItem.company}</p>
              </div>
              <p className="cartDetailPrice">
                Q.{(selectedItem.price * selectedItem.quantity).toFixed(2)}
              </p>
            </div>

            <div className="cartDetailInfo">
              <p>
                <strong>Date Added:</strong> {selectedItem.dateAdded}
              </p>
              <p>
                <strong>Individual Price:</strong> Q.
                {selectedItem.price.toFixed(2)}
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
                    updateQuantity(selectedItem.stockId, newQty);
                    setSelectedItem({ ...selectedItem, quantity: newQty });
                  }
                }}
              />
            </div>

            <div className="cartDetailActions">
              <button
                onClick={() => removeItem(selectedItem.stockId)}
                className="cartBtnRemove"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
