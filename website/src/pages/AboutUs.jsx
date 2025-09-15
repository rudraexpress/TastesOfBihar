import React from "react";
// ...existing code...
const AboutUs = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">About Tastes of Bihar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-gray-700 mb-4">
            Tastes of Bihar is dedicated to bringing authentic Bihari cuisine to
            your doorstep. Our journey starts with Thekua, a beloved treat from
            Chhath Puja, and will soon expand to many more traditional flavors.
          </p>
          <p className="text-gray-700">
            We work with local cooks, use traditional recipes, and package
            products carefully so you get an authentic taste every time.
          </p>
        </div>
        <div>
          <img src="/IMG_9551.png" alt="About us" className="rounded shadow" />
        </div>
      </div>
    </div>
  );
};
export default AboutUs;
