import React from "react";
// ...existing code...
const TermsAndConditions = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
      <div className="prose">
        <p>
          Please read our terms and conditions carefully before making a
          purchase. By using our website, you agree to abide by these terms.
        </p>
        <h3>Orders and Shipping</h3>
        <p>
          All orders are subject to product availability. Delivery times may
          vary.
        </p>
        <h3>Returns</h3>
        <p>
          Perishable food items may not be eligible for return unless damaged.
        </p>
      </div>
    </div>
  );
};
export default TermsAndConditions;
