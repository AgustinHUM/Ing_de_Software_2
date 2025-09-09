export default function Logs() {
    // Datos de ejemplo
    const logs = [
      { id: 1, fecha: "2025-09-01", tipo: "INFO", mensaje: "Usuario Mateo creó un grupo" },
      { id: 2, fecha: "2025-09-01", tipo: "WARN", mensaje: "Intento fallido de inicio de sesión" },
      { id: 3, fecha: "2025-09-02", tipo: "ERROR", mensaje: "Fallo en conexión con API de películas" },
      { id: 4, fecha: "2025-09-03", tipo: "INFO", mensaje: "Se agregó nueva película a la base de datos" },
    ];
  
    return (
      <div>
        <h2 style={{margin:"0 0 6px"}}>Logs del Sistema</h2>
        <p>Registros de actividad y eventos importantes.</p>
  
        <table border="1" cellPadding="8" style={{ marginTop: "1rem", borderCollapse: "collapse", width: "100%" }}>
        <thead style={{
          background: "linear-gradient(90deg, var(--grad-start), var(--grad-end))",
        }}>
          <tr style={{ color: "#111", textAlign: "left", fontWeight: 600 }}>
            <th style={{ padding: "10px 12px" }}>ID</th>
            <th style={{ padding: "10px 12px" }}>Fecha</th>
            <th style={{ padding: "10px 12px" }}>Tipo</th>
            <th style={{ padding: "10px 12px" }}>Mensaje</th>
          </tr>
</thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.fecha}</td>
                <td>{log.tipo}</td>
                <td>{log.mensaje}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  