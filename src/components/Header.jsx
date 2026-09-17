function Header() {
  return (
    <header className="header">

      <div>
        <h1>AI Screening Dashboard</h1>
        <p>Component Burn-In & Anomaly Detection</p>
      </div>

      <div className="system-status">
        <span className="status-dot"></span>
        🟢 System Online
      </div>

    </header>
  );
}

export default Header;