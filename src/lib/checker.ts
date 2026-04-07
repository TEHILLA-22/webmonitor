export async function checkWebsite(url: string) {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://${url}`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const time = Date.now() - start;

    return {
      status: res.ok ? "UP" : "DOWN",
      statusCode: res.status,
      responseTime: time,
      issue: classifyStatus(res.status),
    };
  } catch (error: any) {
    return {
      status: "DOWN",
      statusCode: null,
      responseTime: null,
      issue: classifyError(error),
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

  if (error.message.includes("ENOTFOUND")) {
    return "Domain not found — DNS issue.";
  }

  if (error.message.includes("ECONNREFUSED")) {
    return "Connection refused — server may be down.";
  }

  return "Network error — cannot reach server.";
}