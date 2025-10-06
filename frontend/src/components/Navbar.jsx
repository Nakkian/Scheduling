import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function Navbar(){
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const panelRef = useRef(null);

  // Close menu on route change
  useEffect(()=>{ setOpen(false); }, [loc.pathname]);

  // Click outside to close
  useEffect(() => {
    function onDoc(e){
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target)) return;
      // also ignore clicks on the button itself
      if (e.target.closest?.(".nav-menu-btn-wrap")) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <nav className="nav glass">
      <div className="nav-container">
        {/* Left: brand */}
        <div className="brand">
          Scheduling&nbsp;Ops <span className="dot">●</span>
        </div>

        {/* Right: inline tray (visible on wide screens) */}
        <div className="nav-tray">
          <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/schedules" className={({isActive}) => isActive ? "active" : ""}>Schedules</NavLink>
          <NavLink to="/employees" className={({isActive}) => isActive ? "active" : ""}>Employees</NavLink>
          <NavLink to="/admin" className={({isActive}) => isActive ? "active" : ""}>Admin</NavLink>
          <NavLink to="/health" className={({isActive}) => isActive ? "active" : ""}>Health</NavLink>
        </div>

        {/* Right: collapsible “Menu ▾” (visible on narrow screens) */}
        <div className="nav-menu-btn-wrap">
          <button
            className="btn-glass btn-pill nav-menu-btn"
            aria-haspopup="menu"
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen(o => !o)}
          >
            Menu ▾
          </button>

          {open && (
            <div
              ref={panelRef}
              className="glass nav-menu-panel"
              role="menu"
              aria-label="Navigation menu"
            >
              <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
              <NavLink to="/schedules" className={({isActive}) => isActive ? "active" : ""}>Schedules</NavLink>
              <NavLink to="/employees" className={({isActive}) => isActive ? "active" : ""}>Employees</NavLink>
              <NavLink to="/admin" className={({isActive}) => isActive ? "active" : ""}>Admin</NavLink>
              <NavLink to="/health" className={({isActive}) => isActive ? "active" : ""}>Health</NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}