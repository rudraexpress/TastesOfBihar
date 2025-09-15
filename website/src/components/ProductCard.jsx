import React, { useState } from "react";
import Modal from "./Modal";
import { useCartDispatch, useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const dispatch = useCartDispatch();
  const cart = useCart();

  const inCart = cart.items.find((i) => i.id === product.id);
  const qty = inCart ? inCart.qty : 0;

  const images =
    product.images && product.images.length
      ? product.images
      : ["/ProductIMG.png"];

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col hover:shadow-2xl transition-shadow max-w-md mx-auto">
      <div className="relative h-56 w-full mb-4 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {/* Use object-contain to avoid cropping and keep image centered */}
        <img
          src={images[index]}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-2 line-clamp-3">
          {product.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">Price</div>
          <div className="text-xl font-bold">₹{product.price}</div>
        </div>

        <div className="flex items-center gap-2">
          {!inCart ? (
            <button
              className="bg-yellow-900 text-white px-4 py-2 rounded-lg shadow"
              onClick={() => dispatch({ type: "ADD", item: product })}
            >
              Add to cart
            </button>
          ) : (
            <div className="inline-flex items-center border rounded overflow-hidden">
              <button
                className="px-3 py-1"
                onClick={() => dispatch({ type: "DECREMENT", id: product.id })}
              >
                −
              </button>
              <div className="px-4 py-1 bg-white">{qty}</div>
              <button
                className="px-3 py-1"
                onClick={() => dispatch({ type: "ADD", item: product })}
              >
                +
              </button>
            </div>
          )}
          <button
            className="border border-gray-300 px-4 py-2 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setOpen(true)}
          >
            View details
          </button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={product.name}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img
              src={images[index]}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
          </div>
          <div>
            <p className="text-gray-700 mb-4">
              {product.details || product.description}
            </p>
            <ul className="text-sm text-gray-600 list-disc pl-4 mb-4">
              <li>Weight: 250g</li>
              <li>Ingredients: wheat flour, jaggery, coconut, ghee</li>
              <li>Shelf life: 30 days (sealed pack)</li>
            </ul>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">₹{product.price}</div>
              <button className="bg-yellow-900 text-white px-4 py-2 rounded-lg">
                Buy now
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductCard;
