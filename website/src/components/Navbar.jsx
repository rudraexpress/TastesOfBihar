import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoSrc from "../assets/product-images/Logo.png";
import { useCart } from "../context/CartContext";
import CartModal from "./CartModal";
import LoginModal from "./LoginModal";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const cart = useCart();
  const { user, logout } = useContext(AuthContext);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="bg-yellow-900 text-white shadow">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-3">
            {/* Add a white, slightly rounded background behind the logo so it
                contrasts with the dark navbar while preserving the brand image */}
            <span className="inline-flex items-center justify-center bg-white rounded-md p-1 shadow-sm">
              <img src={logoSrc} alt="logo" className="h-10 w-auto" />
            </span>
            <span className="font-extrabold text-2xl">Tastes of Bihar</span>
          </Link>
          {/* Centered nav items */}
          <nav className="hidden md:flex items-center gap-6 text-sm absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/testimonials" className="hover:underline">
              Testimonials
            </Link>
            <Link to="/about" className="hover:underline">
              About
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
            <Link to="/terms" className="hover:underline">
              Terms
            </Link>
          </nav>

          {/* Right-side actions: Login + Cart */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="hidden md:inline-flex items-center bg-white text-yellow-900 px-3 py-2 rounded h-9"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="hidden md:inline-flex items-center bg-white text-yellow-900 px-3 py-2 rounded h-9"
              >
                Login
              </button>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-white text-yellow-900 px-3 py-2 rounded flex items-center gap-2 h-9"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <span className="text-sm">Cart</span>
              {cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1">
                  {cart.items.length}
                </span>
              )}
            </button>

            <div className="md:hidden">
              <button className="p-2 bg-white text-yellow-900 rounded">
                Menu
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRequestLogin={() => setLoginOpen(true)}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Navbar;
