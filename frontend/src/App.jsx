import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./contexts/CartContext.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import BackToTop from "./components/BackToTop.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderStatus from "./pages/OrderStatus.jsx";
import Kitchen from "./pages/Kitchen.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollToTop() {
  // Scroll to top on route change, but honor in-page #hash targets.
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* A static host (or a bookmarked build) can land on /index.html */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:code" element={<OrderStatus />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <CartDrawer />
      <BackToTop />
    </CartProvider>
  );
}
