import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-row">
        <div className="brand">✈ scheduling</div>
        <nav>
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
