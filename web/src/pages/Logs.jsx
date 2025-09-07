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
        <h2>Logs del Sistema</h2>
        <p>Registros de actividad y eventos importantes.</p>
  
        <table border="1" cellPadding="8" style={{ marginTop: "1rem", borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th>ID</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Mensaje</th>
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
  