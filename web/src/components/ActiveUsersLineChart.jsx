import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
  } from "recharts";
  
  const data = [
    { day: "Lun", users: 220 },
    { day: "Mar", users: 260 },
    { day: "Mié", users: 310 },
    { day: "Jue", users: 280 },
    { day: "Vie", users: 350 },
    { day: "Sáb", users: 390 },
    { day: "Dom", users: 320 },
  ];
  
  export default function ActiveUsersLineChart() {
    return (
      <div style={{ width:"100%", height:280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ right: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2930" />
            <XAxis dataKey="day" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" />
            <Tooltip contentStyle={{ background:"#15141a", border:`1px solid var(--border)`, color:"var(--text)" }}/>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--grad-start)" />
                <stop offset="100%" stopColor="var(--grad-end)" />
              </linearGradient>
            </defs>
            <Line type="monotone" dataKey="users" stroke="url(#lineGrad)" strokeWidth={3} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  