import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import OrderHistory from "./pages/OrderHistory";
import Testimonials from "./pages/Testimonials";
import AboutUs from "./pages/AboutUs";
import TermsAndConditions from "./pages/TermsAndConditions";
import ContactUs from "./pages/ContactUs";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<TermsAndConditions />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
