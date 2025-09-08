import { useMemo, useState } from "react";

const MOCK = [
  { id:1, title:"Inception", year:2010, score:4.8, genres:["Sci-Fi","Acción"], platforms:["Netflix"] },
  { id:2, title:"Interstellar", year:2014, score:4.7, genres:["Sci-Fi","Drama"], platforms:["Prime Video"] },
  { id:3, title:"Parasite", year:2019, score:4.6, genres:["Thriller","Drama"], platforms:["Max"] },
  { id:4, title:"Avengers", year:2012, score:4.2, genres:["Acción"], platforms:["Disney+"] },
];

export default function Movies(){
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    return MOCK.filter(m =>
      m.title.toLowerCase().includes(q.toLowerCase())
      || m.genres.join(" ").toLowerCase().includes(q.toLowerCase())
    );
  }, [q]);

  return (
    <>
      <h2 style={{margin:"0 0 6px"}}>Películas</h2>
      <p style={{color:"var(--muted)", margin:"0 0 16px"}}>Catálogo y puntuación.</p>

      <div style={{display:"flex", gap:12, marginBottom:12}}>
        <input
          placeholder="Buscar por título o género…"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{flex:1, padding:"10px 12px", borderRadius:12, border:`1px solid var(--border)`, background:"var(--surface)", color:"var(--text)"}}
        />
        <button className="btn-gradient">Agregar</button>
      </div>

      <div className="card" style={{overflowX:"auto"}}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ color:"var(--muted)", textAlign:"left" }}>
              <th style={{padding:"10px 12px"}}>Título</th>
              <th style={{padding:"10px 12px"}}>Año</th>
              <th style={{padding:"10px 12px"}}>Géneros</th>
              <th style={{padding:"10px 12px"}}>Plataformas</th>
              <th style={{padding:"10px 12px"}}>Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map(m => (
              <tr key={m.id} style={{ borderTop:`1px solid var(--border)`}}>
                <td style={{padding:"12px"}}>{m.title}</td>
                <td style={{padding:"12px"}}>{m.year}</td>
                <td style={{padding:"12px"}}>{m.genres.join(", ")}</td>
                <td style={{padding:"12px"}}>{m.platforms.join(", ")}</td>
                <td style={{padding:"12px", fontWeight:700}}>{m.score.toFixed(1)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} style={{padding:"16px", color:"var(--muted)"}}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
