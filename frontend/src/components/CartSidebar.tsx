"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "../styles/CartSidebar.css";

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
  const [showToast, setShowToast] = useState(false);

  const loadCart = () => {
    const storedCart = localStorage.getItem("shoppingCart");
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);

        // Evitar duplicados por portafolio + símbolo
        const uniqueMap = new Map<string, CartItem>();
        parsedCart.forEach((item) => {
          const key = `${item.portfolio}_${item.stockSymbol}`;
          uniqueMap.set(key, item);
        });

        const cleanedCart = Array.from(uniqueMap.values());
        setCart(cleanedCart);
        localStorage.setItem("shoppingCart", JSON.stringify(cleanedCart));
      } catch (error) {
        console.error("Error leyendo localStorage:", error);
      }
    } else {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();

    const handleStorageChange = () => {
      loadCart();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const incrementQuantity = (stockSymbol: string, portfolio: string) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.stockSymbol === stockSymbol && item.portfolio === portfolio
          ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * item.stockPrice,
            }
          : item
      );
      localStorage.setItem("shoppingCart", JSON.stringify(updated));
      return updated;
    });
  };

  const decrementQuantity = (stockSymbol: string, portfolio: string) => {
    setCart((prev) => {
      const updated = prev
        .map((item) =>
          item.stockSymbol === stockSymbol &&
          item.portfolio === portfolio &&
          item.quantity > 1
            ? {
                ...item,
                quantity: item.quantity - 1,
                total: (item.quantity - 1) * item.stockPrice,
              }
            : item
        )
        .filter((item) => item.quantity > 0);

      localStorage.setItem("shoppingCart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (itemToUpdate: CartItem, newQty: number) => {
    if (newQty < 1) return;

    const updatedCart = cart.map((item) =>
      item.stockSymbol === itemToUpdate.stockSymbol &&
      item.portfolio === itemToUpdate.portfolio
        ? { ...item, quantity: newQty, total: item.stockPrice * newQty }
        : item
    );

    setCart(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
  };

  const removeItem = (itemToRemove: CartItem) => {
    const updatedCart = cart.filter(
      (item) =>
        !(
          item.stockSymbol === itemToRemove.stockSymbol &&
          item.portfolio === itemToRemove.portfolio
        )
    );

    setCart(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    setSelectedItem(null);
  };

  const total = cart.reduce((acc, p) => acc + p.total, 0);

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
                      <div>
                        <p className="cartCardPortfolio">
                          Portfolio: {item.portfolio}
                        </p>
                        <p className="cartCardName">{item.stockName}</p>
                        <p className="cartCardQty">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="cartCardPrice">$.{item.total}</p>
                  </div>
                ))
              )}
            </div>

            <div className="cartFooter">
              <div className="cartTotal">Total: $.{total}</div>
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
                <p className="cartDetailCompany">{selectedItem.stockSymbol}</p>
              </div>
              <p className="cartDetailPrice">
                $.
                {(selectedItem.stockPrice * selectedItem.quantity)}
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
                <strong>Individual Price:</strong> $.
                {selectedItem.stockPrice}
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
                    setSelectedItem({
                      ...selectedItem,
                      quantity: newQty,
                      total: selectedItem.stockPrice * newQty,
                    });
                  }
                }}
              />
            </div>

            <div className="cartDetailActions">
              <button
                onClick={() => removeItem(selectedItem)}
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
