import React, { useMemo, useState, useEffect, useContext } from "react";
import Modal from "./Modal";
import { useCart, useCartDispatch } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const CartModal = ({ open, onClose, onRequestLogin }) => {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { user } = useContext(AuthContext);

  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(null);
  const [message, setMessage] = useState("");

  // simple coupon rules (client-side demo)
  const coupons = {
    SAVE10: { type: "percent", value: 10 },
    FLAT50: { type: "flat", value: 50 },
  };

  useEffect(() => {
    // clear applied coupon if cart becomes empty
    if (cart.items.length === 0) {
      setApplied(null);
      setCoupon("");
      setMessage("");
    }
  }, [cart.items.length]);

  const discount = useMemo(() => {
    if (!applied) return 0;
    const rule = coupons[applied];
    if (!rule) return 0;
    if (rule.type === "percent") return Math.round((total * rule.value) / 100);
    return Math.min(rule.value, total);
  }, [applied, total]);

  const finalTotal = Math.max(0, total - discount);

  const applyCoupon = () => {
    const code = (coupon || "").toUpperCase().trim();
    if (!code) {
      setMessage("Enter a coupon code");
      return;
    }
    if (!coupons[code]) {
      setMessage("Invalid coupon");
      return;
    }
    setApplied(code);
    setMessage(`Applied ${code}`);
  };

  const removeCoupon = () => {
    setApplied(null);
    setMessage("Coupon removed");
  };

  return (
    <Modal open={open} onClose={onClose} title={`Cart (${cart.items.length})`}>
      {cart.items.length === 0 ? (
        <div className="p-4 text-center text-gray-600">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((it) => (
            <div key={it.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={it.images?.[0] || it.imageUrl}
                  alt={it.name}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-500">Qty: {it.qty}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{it.price * it.qty}</div>
                <button
                  className="text-sm text-red-600"
                  onClick={() => dispatch({ type: "REMOVE", id: it.id })}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-lg font-bold">₹{total}</div>
          </div>

          <div className="pt-2">
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="px-3 py-2 border rounded w-full"
              />
              {!applied ? (
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 rounded bg-yellow-900 text-white"
                >
                  Apply
                </button>
              ) : (
                <button
                  onClick={removeCoupon}
                  className="px-4 py-2 rounded border"
                >
                  Remove
                </button>
              )}
            </div>
            {message && (
              <div className="text-sm text-gray-500 mt-1">{message}</div>
            )}
            {applied && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <div>Discount ({applied})</div>
                <div className="font-medium">-₹{discount}</div>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-lg font-bold">
              <div>Final total</div>
              <div>₹{finalTotal}</div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => dispatch({ type: "CLEAR" })}
            >
              Clear
            </button>
            <button
              className="px-4 py-2 rounded bg-yellow-900 text-white"
              onClick={() => {
                // If user not logged in, request opening the login modal
                if (!user) {
                  if (typeof onRequestLogin === "function") {
                    onRequestLogin();
                  }
                  return;
                }

                // Proceed to checkout (placeholder)
                // TODO: replace with real checkout/navigation logic
                alert("Proceeding to checkout...");
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CartModal;
