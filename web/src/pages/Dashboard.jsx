import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import MatchDonutChart from "../components/MatchDonutChart";
import TopMoviesChart from "../components/TopMoviesChart";

export default function Dashboard(){
  const [userCount, setUserCount] = useState(null);
  const [topRated, setTopRated] = useState([]); // most_rated_movies
  const [topFavs, setTopFavs]   = useState([]); // users_most_favourites
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // KPI 1: usuarios totales
        const uc = await api.get("/admin/home/user_count");
        setUserCount(uc?.user_count ?? 0);

        // Gráfica barras: top por cantidad de ratings (y luego mejor promedio)
        const mr = await api.get("/admin/home/most_rated_movies?page=1&per_page=10");
        setTopRated(mr?.movies ?? []);

        // KPI 2: película más favorita
        const mf = await api.get("/admin/home/users_most_favourites?page=1&per_page=10");
        setTopFavs(mf?.movies ?? []);
      } catch (e) {
        setErr(e.message || "Error cargando métricas");
      }
    })();
  }, []);

  // KPI 2: nombre de la más favorita
  const mostFavouriteTitle = topFavs?.[0]?.title ?? "—";

  // Datos para la barra: name = título, votos = cantidad de ratings
  const barData = useMemo(() => {
    return (topRated || []).slice(0, 5).map(m => ({
      name: m.title,
      // el back hoy manda "raing_count" con typo; cubrimos ambos
      votos: Number(m.rating_count ?? m.raing_count ?? 0),
      // si querés usar promedio más adelante: Number(m.avg_rating ?? 0)
    }));
  }, [topRated]);

  return (
    <>
      <h2 style={{margin:"0 0 6px"}}>Dashboard</h2>
      <p style={{color:"var(--muted)", margin:"0 0 20px"}}>Resumen de actividad y métricas clave.</p>

      {/* KPIs */}
      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", marginBottom:16}}>
        {/* KPI 1 */}
        <div className="card">
          <span className="badge">Usuarios totales</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Cantidad</div>
          <div style={{fontSize:28, fontWeight:700}}>{userCount ?? "—"}</div>
        </div>

        {/* KPI 2 */}
        <div className="card">
          <span className="badge">Top favorita</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Película</div>
          <div style={{fontSize:28, fontWeight:700}}>{mostFavouriteTitle}</div>
        </div>

        {/* KPI 3 (maquetado)
        <div className="card">
          <span className="badge">Avg</span>
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>Match promedio por grupo</div>
          <div style={{fontSize:28, fontWeight:700}}>63%</div>
        </div>
         */}
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
            <span>💞</span><h3 style={{margin:0}}>Match promedio</h3>
          </div>
          <MatchDonutChart />
        </div>

        <div className="card">
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <span>🎬</span><h3 style={{margin:0}}>Más votadas (cantidad de ratings)</h3>
          </div>
          <TopMoviesChart data={barData} />
          <div style={{marginTop:8, fontSize:12, color:"var(--muted)"}}>
            * Ordenadas por cantidad de votos; a igualdad, por mejor promedio de rating.
          </div>
        </div>
      </div>
    </>
  );
}