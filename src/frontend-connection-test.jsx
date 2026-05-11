import { useState } from "react";

const DEFAULT_BASE_URL = "http://192.168.4.177:8080";

export default function ConnectionTest() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [result, setResult] = useState("Waiting for test...");
  const [loading, setLoading] = useState(false);

  const runTest = async (path) => {
    const normalized = baseUrl.trim().replace(/\/$/, "");
    const url = `${normalized}${path}`;
    setLoading(true);
    setResult(`Requesting: ${url}`);

    try {
      const response = await fetch(url, { method: "GET" });
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      setResult(
        `Status: ${response.status}\n` +
          `Response:\n${JSON.stringify(data, null, 2)}`
      );
    } catch (error) {
      setResult(`Request failed: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", fontFamily: "sans-serif" }}>
      <h2>Backend Connection Test</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => runTest("/health")} disabled={loading}>
          Test /health
        </button>
        <button onClick={() => runTest("/users")} disabled={loading}>
          Test /users
        </button>
      </div>
      <pre
        style={{
          background: "#111827",
          color: "#e5e7eb",
          padding: 12,
          borderRadius: 8,
          minHeight: 120,
          whiteSpace: "pre-wrap",
        }}
      >
        {result}
      </pre>
    </div>
  );
}
