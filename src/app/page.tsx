"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
const latest = result?.checks?.[0];

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

  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Website Uptime Checker</h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Enter domain (example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleCheck} className="bg-black text-white px-4 py-2">
        {loading ? "Checking..." : "Check"}
      </button>

      {result && (
  <div className="mt-6 border p-4 rounded-lg shadow">

    {/* STATUS */}
    <div className="flex items-center gap-2 text-lg font-bold">
      <span>
        {latest?.status === "UP" ? "🟢" : "🔴"}
      </span>
      <span>{latest?.status}</span>
    </div>

    {/* MAIN INFO */}
    <div className="mt-2 space-y-1">
      <p><strong>HTTP Code:</strong> {latest?.statusCode ?? "N/A"}</p>
      <p><strong>Response Time:</strong> {latest?.responseTime ?? "N/A"} ms</p>
      <p><strong>Message:</strong> {latest?.issue}</p>
    </div>

    {/* UPTIME */}
    <div className="mt-4">
      <p><strong>Uptime:</strong> {result.uptimePercentage}%</p>
    </div>

    {/* INFRA DETAILS */}
    <div className="mt-4 space-y-1">
      <p><strong>DNS:</strong> {result.dns}</p>
      <p><strong>SSL:</strong> {result.ssl}</p>
      <p><strong>Server:</strong> {latest?.headers?.server ?? "Unknown"}</p>
      <p><strong>Content-Type:</strong> {latest?.headers?.contentType ?? "Unknown"}</p>
    </div>

    {/* STATUS BREAKDOWN */}
    <div className="mt-4">
      <p className="font-bold">Status Breakdown:</p>
      {Object.entries(result.statusBreakdown).map(([code, count]) => (
        <p key={code}>
          {code}: {count}
        </p>
      ))}
    </div>

    {/* HISTORY */}
    <div className="mt-4">
      <p className="font-bold">Recent Checks:</p>
      {result.checks.map((c: any, i: number) => (
        <div key={i} className="text-sm border-b py-1">
          {c.status === "UP" ? "🟢" : "🔴"} {c.statusCode} — {c.responseTime}ms
        </div>
      ))}
    </div>

  </div>
)}
    </main>
  );
}
