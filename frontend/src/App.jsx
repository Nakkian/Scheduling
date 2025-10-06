import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Schedules from "./pages/Schedules";
import Employees from "./pages/Employees";
import Admin from "./pages/Admin";
import Health from "./pages/Health";
import NotFound from "./pages/NotFound";

export default function App(){
  return (
    <div className="app-shell">
      <header className="glass nav">
        <Navbar />
      </header>
      <main>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/schedules" element={<Schedules/>} />
            <Route path="/employees" element={<Employees/>} />
            <Route path="/admin" element={<Admin/>} />
            <Route path="/health" element={<Health/>} />
            <Route path="*" element={<NotFound/>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}