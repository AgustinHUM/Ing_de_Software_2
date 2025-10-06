import TopMoviesChart from "../components/TopMoviesChart";
import ActiveUsersLineChart from "../components/ActiveUsersLineChart";
import MatchDonutChart from "../components/MatchDonutChart";

export default function Dashboard(){
  return (
    <>
      <h2 style={{margin:"0 0 6px"}}>Dashboard</h2>
      <p style={{color:"var(--muted)", margin:"0 0 20px"}}>Resumen de actividad y métricas clave.</p>

      {/* KPIs */}
      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", marginBottom:16}}>
        <div className="card">
          <span className="badge">+12%</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Usuarios activos hoy</div>
          <div style={{fontSize:28, fontWeight:700}}>1,284</div>
        </div>
        <div className="card">
          <span className="badge">Top</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Película más votada</div>
          <div style={{fontSize:28, fontWeight:700}}>Inception</div>
        </div>
        <div className="card">
          <span className="badge">Avg</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Match promedio por grupo</div>
          <div style={{fontSize:28, fontWeight:700}}>63%</div>
        </div>
      </div>

      {/* Grids de charts */}
      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))"}}>
        <div className="card">
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <span>👥</span><h3 style={{margin:0}}>Usuarios activos por día</h3>
          </div>
          <ActiveUsersLineChart />
        </div>

        <div className="card">
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <span>💞</span><h3 style={{margin:0}}>Match promedio</h3>
          </div>
          <MatchDonutChart />
        </div>

        <div className="card" style={{gridColumn:"1 / -1"}}>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <span>🎬</span><h3 style={{margin:0}}>Películas más votadas</h3>
          </div>
          <TopMoviesChart />
        </div>
      </div>
    </>
  );
}
