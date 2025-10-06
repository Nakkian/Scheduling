import { Link } from "react-router-dom";

export default function NotFound(){
  return (
    <section className="container-fullscreen">
      <div className="centered-page glass card stack" style={{ textAlign:"center", maxWidth:560 }}>
        <h2>404 — Not Found</h2>
        <p className="small">The page you’re looking for doesn’t exist or was moved.</p>
        <div className="row gap" style={{ justifyContent:"center" }}>
          <Link to="/" className="btn-glass btn-pill">Go Home</Link>
          <Link to="/schedules" className="btn-glass btn-pill">View Schedules</Link>
        </div>
      </div>
    </section>
  );
}