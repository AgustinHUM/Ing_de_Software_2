import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
// si ya los importabas así, dejalo igual:
import ActiveUsersLineChart from "../components/ActiveUsersLineChart";
import MatchDonutChart from "../components/MatchDonutChart";
import TopMoviesChart from "../components/TopMoviesChart";

export default function Dashboard(){
  const [userCount, setUserCount] = useState(null);
  const [topRated, setTopRated] = useState([]);
  const [topFavs, setTopFavs]   = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // usuarios totales
        const uc = await api.get("/admin/home/user_count");
        setUserCount(uc.user_count);

        // top por rating y más favoritas
        const mr = await api.get("/admin/home/most_rated_movies?page=1&per_page=5");
        setTopRated(mr.movies || []);

        const mf = await api.get("/admin/home/users_most_favourites?page=1&per_page=5");
        setTopFavs(mf.movies || []);
      } catch (e) {
        setErr(e.message || "Error cargando métricas");
      }
    })();
  }, []);

  // Película más votada (primer resultado por rating)
  const topRatedTitle = topRated?.[0]?.title ?? "—";

  // Si tu TopMoviesChart acepta props con datos, le pasamos una forma simple:
  // => [{ title, avg_rating, count }]
  const topMoviesChartData = useMemo(() => {
    return (topRated || []).map(m => ({
      title: m.title,
      avg_rating: m.avg_rating,
      count: m.raing_count, // (sic) el backend lo devuelve así
    }));
  }, [topRated]);

  return (
    <>
      <h2 style={{margin:"0 0 6px"}}>Dashboard</h2>
      <p style={{color:"var(--muted)", margin:"0 0 20px"}}>Resumen de actividad y métricas clave.</p>

      {/* KPIs */}
      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", marginBottom:16}}>
        {/* KPI 1: dejo el estilo y estructura; uso el dato real que sí tenemos. */}
        <div className="card">
          <span className="badge">+12%</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Usuarios totales</div>
          <div style={{fontSize:28, fontWeight:700}}>{userCount ?? "—"}</div>
        </div>

        <div className="card">
          <span className="badge">Top</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Película más votada</div>
          <div style={{fontSize:28, fontWeight:700}}>{topRatedTitle}</div>
        </div>

        {/* KPI 3: no tenemos aún "match promedio por grupo" del backend,
            mantengo tu valor de demo para preservar el diseño. */}
        <div className="card">
          <span className="badge">Avg</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Match promedio por grupo</div>
          <div style={{fontSize:28, fontWeight:700}}>63%</div>
        </div>
      </div>

      {err && (
        <div className="card" style={{borderColor:"rgba(255,0,0,.25)"}}>
          <div style={{color:"tomato"}}>{err}</div>
        </div>
      )}

      {/* Grids de charts */}
      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))"}}>
        <div className="card">
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <span>👥</span><h3 style={{margin:0}}>Usuarios activos por día</h3>
          </div>
          {/* Si este chart hoy está harcodeado, lo dejamos igual.
             Si acepta props, pasalas acá (ej: <ActiveUsersLineChart data={...} />) */}
          <ActiveUsersLineChart />
        </div>

        <div className="card">
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <span>💞</span><h3 style={{margin:0}}>Match promedio</h3>
          </div>
          {/* Ídem: si todavía es demo, no lo toco. Si acepta props, se las pasamos */}
          <MatchDonutChart />
        </div>

        <div className="card" style={{gridColumn:"1 / -1"}}>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <span>🎬</span><h3 style={{margin:0}}>Películas más votadas</h3>
          </div>
          {/* Si tu TopMoviesChart ya renderiza datos internos, dejalo.
             Si acepta props, probá con: */}
          <TopMoviesChart data={topMoviesChartData} />
        </div>
      </div>
    </>
  );
}