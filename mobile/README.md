# Mobile (Expo) — Sprint 1

## Crear el proyecto
```bash
cd mobile
npm create expo@latest
# Project name: tinder-pelis-mobile
# Template: blank (TypeScript)
cd tinder-pelis-mobile
npm i
npm start
```

## Reemplazar `App.tsx` (ejemplo)
Copiá el siguiente contenido en `App.tsx` para el **Ping API**:

```tsx
import React, { useState } from "react";
import { Button, Text, View, SafeAreaView, ActivityIndicator } from "react-native";

export default function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ping() {
    try {
      setLoading(true);
      setStatus(null);
      const res = await fetch("http://127.0.0.1:5000/health");
      const data = await res.json();
      setStatus(data?.status || "sin respuesta");
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <View style={{ padding: 24, gap: 16, alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "600" }}>Tinder de Películas</Text>
        <Button title="Ping API" onPress={ping} />
        {loading ? <ActivityIndicator /> : <Text>Estado: {status ?? "-"}</Text>}
      </View>
    </SafeAreaView>
  );
}
```
> iOS simulador no accede a `localhost` del host. Usá la IP de tu máquina (p. ej. `http://192.168.0.23:5000/health`).

## Objetivo del Sprint 1
Ver en pantalla `Estado: ok` al presionar **Ping API**.
