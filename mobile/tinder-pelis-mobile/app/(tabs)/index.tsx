import React, { useState } from "react";
import { Button, Text, View, SafeAreaView, ActivityIndicator } from "react-native";

export default function Index() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ping() {
    try {
      setLoading(true);
      setStatus(null);
      const res = await fetch("http://127.0.0.1:5050/health"); // ⚠️ cambia IP si es necesario
      const data = await res.json();
      setStatus(data?.status || "sin respuesta");
    } catch {
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
