export default function Admin(){
  return (
    <section className="container-fullscreen">
      <div className="centered-page glass card stack">
          <h2>Admin</h2>
        <p className="small">Application sensitive actions will go here</p>
          <div className = "row.gap">
          <button className="btn-glass btn-pill btn-ok">Import Employees</button>
          <button className="btn-glass btn-pill">Test Button</button>
          <button className="btn-glass btn-pill btn-warn">Purge Test Data</button>
        </div>
      </div>
    </section>
  );
}