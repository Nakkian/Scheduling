import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <section className="container section-glow">
      <div className="glass-strong card stack" style={{padding: "22px"}}>
        <h1>Ground Ops Scheduling</h1>
        <p className="small">
          A clear, calm workspace: import employees, assign specific jobs, and auto-schedule Above/Below Wing teams.
        </p>
        <div className="row gap">
          <Link className="btn" to="/employees">Manage Employees</Link>
          <Link className="btn secondary" to="/schedules">Auto-Schedule</Link>
          <Link className="btn ghost" to="/health">API Health</Link>
        </div>
      </div>
    </section>
  );
}
