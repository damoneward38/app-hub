"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HealingPage from "./pages/HealingPage";
import OxygenPage from "./pages/OxygenPage";
import { FirebaseProvider } from "./components/FirebaseProvider";
import Shell from "./components/Shell";

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/healing" element={<Shell><HealingPage /></Shell>} />
          <Route path="/oxygen" element={<Shell><OxygenPage /></Shell>} />
        </Routes>
      </Router>
    </FirebaseProvider>
  );
}
