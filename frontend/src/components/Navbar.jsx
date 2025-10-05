import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="glass nav">
      <div className="container nav-row">
        <div className="brand">scheduling<span className="dot">•</span></div>
        <nav className="row gap">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/schedules">Schedules</NavLink>
          <NavLink to="/health">Health</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}
