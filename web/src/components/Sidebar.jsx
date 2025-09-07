import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside style={{ width: "200px", borderRight: "1px solid #ccc", padding: "1rem" }}>
      <h3>Admin</h3>
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/logs">Logs</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
