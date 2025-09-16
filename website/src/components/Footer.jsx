import React from "react";
import { Link } from "react-router-dom";
import logoSrc from "../assets/product-images/Logo.png";

const Footer = () => {
  return (
    <footer className="bg-yellow-900 text-white">
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex items-center justify-center bg-white rounded-md p-1 shadow-sm">
              <img
                src={logoSrc}
                alt="Tastes of Bihar"
                className="h-10 w-auto"
              />
            </span>
            <span className="font-extrabold text-lg">Tastes of Bihar</span>
          </div>
          <p className="text-sm text-yellow-100">
            Authentic snacks and sweets from Bihar. Handcrafted recipes passed
            down generations.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Navigate</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/testimonials" className="hover:underline">
                Testimonials
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:underline">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Help</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <a
                href="mailto:hello@tastesofbihar.example"
                className="hover:underline"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a href="/" className="hover:underline">
                FAQ
              </a>
            </li>
            <li>
              <a href="/" className="hover:underline">
                Shipping & Returns
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Follow</h3>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="p-2 bg-white/10 rounded hover:bg-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-3h2.4V9.5c0-2.4 1.4-3.8 3.6-3.8 1 0 2 .08 2 .08v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4V12H20l-1 3.9h-2v7A10 10 0 0022 12z" />
              </svg>
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="p-2 bg-white/10 rounded hover:bg-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6a4 4 0 100 8 4 4 0 000-8zm6.5-3a1 1 0 110 2 1 1 0 010-2z" />
              </svg>
            </a>

            <a
              href="#"
              aria-label="Twitter"
              className="p-2 bg-white/10 rounded hover:bg-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 5.8c-.6.3-1.2.5-1.9.6.7-.4 1.2-1 1.4-1.8-.7.4-1.5.7-2.3.9C18.2 4.6 17.3 4 16.3 4c-1.7 0-3 1.5-2.6 3.1C11.5 7 9.4 6 8 4.6c-.8 1.3-.2 3 1 3.8-.5 0-1-.2-1.4-.4v.1c0 1.6 1.1 2.9 2.6 3.2-.5.1-1 .1-1.6.1-.4 0-.8 0-1.2-.1.8 2.3 3 3.8 5.6 3.8-2 1.5-4.6 2.2-7.2 2.2-.5 0-1 0-1.4-.1 2.5 1.6 5.6 2.6 8.9 2.6 10.7 0 16.6-9 16.6-16.8v-.8c1.2-.8 2.1-1.7 2.9-2.7z" />
              </svg>
            </a>
          </div>

          <div className="mt-4 text-sm text-yellow-100">
            <div>Phone: +1 (555) 123-4567</div>
            <div className="mt-1">Email: hello@tastesofbihar.example</div>
          </div>
        </div>
      </div>

      <div className="border-t border-yellow-800">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-yellow-200">
          © {new Date().getFullYear()} Tastes of Bihar — All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
