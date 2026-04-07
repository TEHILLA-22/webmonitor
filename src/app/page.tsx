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

  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Website Uptime Checker
      </h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Enter domain (example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        onClick={handleCheck}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? "Checking..." : "Check"}
      </button>

      {result && (
        <div className="mt-6 border p-4">
          <p>Status: {result.status}</p>
          <p>Code: {result.statusCode ?? "N/A"}</p>
          <p>Response Time: {result.responseTime ?? "N/A"} ms</p>
          <p>Message: {result.issue}</p>
        </div>
      )}
    </main>
  );
}