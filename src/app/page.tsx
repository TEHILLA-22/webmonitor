"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);

    const res = await fetch("/api/check", {
      method: "POST",
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const latest = result?.checks?.[0];

  const avgTime =
    result?.checks?.reduce(
      (acc: number, c: any) => acc + (c.responseTime || 0),
      0
    ) / (result?.checks?.length || 1);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">

      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        Website Monitoring Dashboard
      </h1>

      {/* INPUT */}
      <div className="border p-4 rounded-lg shadow">
        <input
          className="border p-2 w-full mb-3"
          placeholder="Enter domain (e.g. google.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={handleCheck}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Checking..." : "Check Website"}
        </button>
      </div>

      {/* STATUS OVERVIEW */}
      {result && (
        <div className="border p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-lg font-bold">
            {latest?.status === "UP" ? "🟢" : "🔴"}
            {latest?.status}
          </div>

          <p className="text-sm text-gray-500">
            {latest?.issue}
          </p>
        </div>
      )}

      {/* METRICS GRID */}
      {result && (
        <div className="grid grid-cols-2 gap-4">

          <Card title="HTTP Code" value={latest?.statusCode ?? "N/A"} />
          <Card title="Avg Response" value={`${Math.round(avgTime)} ms`} />
          <Card title="Uptime" value={`${result.uptimePercentage}%`} />
          <Card title="DNS" value={result.dns} />
          <Card title="SSL" value={result.ssl} />
          <Card title="Server" value={latest?.headers?.server || "Unknown"} />

        </div>
      )}

      {/* HISTORY */}
      {result?.history && (
        <div className="border p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Recent Activity</h3>

          {result.history.map((h: any) => (
            <div
              key={h.id}
              className="flex justify-between text-sm border-b py-2"
            >
              <span>
                {h.status === "UP" ? "🟢" : "🔴"} {h.statusCode}
              </span>

              <span>{h.responseTime ?? "N/A"} ms</span>

              <span className="text-gray-400">
                {new Date(h.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="border p-3 rounded-lg shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}