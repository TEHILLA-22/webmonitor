import dns from "dns/promises";

export async function checkWebsite(url: string) {
  const finalUrl = url.startsWith("http") ? url : `https://${url}`;
  const start = Date.now();

  try {
    const res = await fetch(finalUrl);
    const time = Date.now() - start;

    return {
      status: res.ok ? "UP" : "DOWN",
      statusCode: res.status,
      responseTime: time,
      issue: classifyStatus(res.status),
      headers: {
        server: res.headers.get("server"),
        contentType: res.headers.get("content-type"),
      },
    };
  } catch (error: any) {
    return {
      status: "DOWN",
      statusCode: null,
      responseTime: null,
      issue: classifyError(error),
      headers: null,
    };
  }
}

function classifyStatus(code: number) {
  if (code >= 200 && code < 300) return "Working correctly";
  if (code >= 300 && code < 400) return "Redirecting";
  if (code >= 400 && code < 500) return "Client error";
  if (code >= 500) return "Server error";
  return "Unknown";
}

function classifyError(error: any) {
  const msg = error.message?.toLowerCase() || "";

  if (msg.includes("enotfound")) return "DNS not found";
  if (msg.includes("econnrefused")) return "Connection refused";
  if (msg.includes("timeout")) return "Request timeout";

  return "Network error";
}

export async function runMultipleChecks(url: string) {
  const checks = [];

  for (let i = 0; i < 3; i++) {
    checks.push(await checkWebsite(url));
  }

  return checks;
}

export function calculateUptime(checks: any[]) {
  const up = checks.filter(c => c.status === "UP").length;
  return (up / checks.length) * 100;
}

export function getStatusBreakdown(checks: any[]) {
  const map: Record<string, number> = {};

  checks.forEach(c => {
    const code = c.statusCode || "ERR";
    map[code] = (map[code] || 0) + 1;
  });

  return map;
}

export async function checkDNS(url: string) {
  try {
    const clean = url.replace(/^https?:\/\//, "").split("/")[0];
    await dns.lookup(clean);
    return "Resolved";
  } catch {
    return "Failed";
  }
}

export function checkSSL(url: string) {
  return url.startsWith("https") ? "HTTPS Enabled" : "No HTTPS";
}

export async function pingDomain(url: string) {
  const finalUrl = url.startsWith("http") ? url : `https://${url}`;
  const start = Date.now();

  try {
    await fetch(finalUrl, { method: "HEAD" });
    return { latency: Date.now() - start };
  } catch {
    return { latency: null };
  }
}