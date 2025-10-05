import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Landing from "./pages/Landing";
import Health from "./pages/Health";
import Employees from "./pages/Employees";
import Schedules from "./pages/Schedules";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/health" element={<Health />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
