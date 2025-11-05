import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function TopMoviesChart({ data = [] }) {
  // data = [{ name: "Inception", votos: 120 }, ...]

  return (
    <div style={{width:"100%", height:320}}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2930" />
          <XAxis dataKey="name" stroke="var(--muted)" />
          <YAxis stroke="var(--muted)" />
          <Tooltip
            formatter={(value, name) => [value, name === "votos" ? "Votos" : name]}
            contentStyle={{ background:"#15141a", border:`1px solid var(--border)`, color:"var(--text)" }}
          />
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--grad-start)" />
              <stop offset="100%" stopColor="var(--grad-end)" />
            </linearGradient>
          </defs>
          <Bar dataKey="votos" fill="url(#barGrad)" radius={[10,10,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}