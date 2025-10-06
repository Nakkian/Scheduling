export default function Home(){
  return (
    <section className="container-fullscreen">
      <div className="centered-page glass card stack">
        <h1>Welcome 👋</h1>
        <p className="small">This is your Scheduling Ops dashboard.</p>

        <div className="row gap">
          <a href="/schedules" className="btn-glass btn-pill">Go to Schedules</a>
          <a href="/admin" className="btn-glass btn-pill">Admin</a>
          <a href="/health" className="btn-glass btn-pill">Health</a>
        </div>
      </div>
    </section>
  );
}
