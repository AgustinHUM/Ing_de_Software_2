import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Match", value: 63 },
  { name: "No match", value: 37 },
];

const COLORS = ["#f59e0b", "#3a3942"]; // match / resto

export default function MatchDonutChart() {
  return (
    <div style={{ width:"100%", height:280, position:"relative" }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            contentStyle={{ background:"#15141a", border:`1px solid var(--border)`, color:"var(--text)" }}
            itemStyle={{ color:"var(--text)" }}     // 👈 textos blancos
            labelStyle={{ color:"var(--muted)" }}   // 👈 label gris
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={110}
            startAngle={90}
            endAngle={-270}            // dibujo horario (look moderno)
            paddingAngle={2}
            stroke="#e5e7eb"           // separador fino claro
            strokeWidth={1.5}
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Número centrado */}
      <div style={{
        position:"absolute", inset:0,
        display:"grid", placeItems:"center",
        pointerEvents:"none"
      }}>
        <div style={{ fontSize:32, fontWeight:800 }}>63%</div>
      </div>
    </div>
  );
}
