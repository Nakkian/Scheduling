// src/pages/Landing.jsx
import { Link } from "react-router-dom";
export default function Landing() {
  return (
    <section className="stack">
      <h1>Ground Ops Scheduling</h1>
      <p>Upload employees, assign specific jobs, and auto-generate Above/Below Wing schedules.</p>
      <div className="row gap">
        <Link className="btn" to="/employees">Manage Employees</Link>
        <Link className="btn secondary" to="/schedules">Auto-Schedule</Link>
      </div>
    </section>
  );
}
