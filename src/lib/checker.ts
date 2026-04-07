import dns from "dns/promises";

function normalizeUrl(url: string) {
  if (!url.startsWith("http")) {
    return `https://${url}`;
  }
  return url;
}

export async function checkWebsite(url: string) {
  const start = Date.now();
  const finalUrl = normalizeUrl(url);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(finalUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const time = Date.now() - start;

    // ✅ NOW res exists
    const server = res.headers.get("server");
    const contentType = res.headers.get("content-type");

    return {
      status: res.ok ? "UP" : "DOWN",
      statusCode: res.status,
      responseTime: time,
      issue: classifyStatus(res.status),
      headers: {
        server,
        contentType,
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
  if (code >= 200 && code < 300) return "Website is working correctly.";
  if (code >= 300 && code < 400) return "Website is redirecting requests.";
  if (code >= 400 && code < 500) return "Client error — request may be blocked.";
  if (code >= 500) return "Server error — the server is failing.";

  return "Unknown status.";
}

function classifyError(error: any) {
  if (error.name === "AbortError") {
    return "Request timed out — server may be overloaded.";
  }

  if (error.message?.includes("ENOTFOUND")) {
    return "Domain not found — DNS issue.";
  }

  if (error.message?.includes("ECONNREFUSED")) {
    return "Connection refused — server may be down.";
  }

  return "Network error — cannot reach server.";
}

export async function runMultipleChecks(url: string) {
  const checks = [];

  for (let i = 0; i < 3; i++) {
    const result = await checkWebsite(url);
    checks.push(result);
  }

  return checks;
}

// ✅ EXPORT these
export function calculateUptime(checks: any[]) {
  const upCount = checks.filter(c => c.status === "UP").length;
  return Number(((upCount / checks.length) * 100).toFixed(2));
}

export function getStatusBreakdown(checks: any[]) {
  const map: Record<string, number> = {};

  checks.forEach(c => {
    const code = c.statusCode || "ERROR";
    map[code] = (map[code] || 0) + 1;
  });

  return map;
}

export function checkSSL(url: string) {
  return url.startsWith("https")
    ? "Secure (HTTPS)"
    : "Not Secure (HTTP)";
}

export async function checkDNS(url: string) {
  try {
    await dns.lookup(url.replace(/^https?:\/\//, ""));
    return "DNS resolved";
  } catch {
    return "DNS failed";
  }
}