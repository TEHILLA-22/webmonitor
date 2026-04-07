import {
  runMultipleChecks,
  calculateUptime,
  getStatusBreakdown,
  checkDNS,
  checkSSL,
} from "@/lib/checker";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }


    const checks = await runMultipleChecks(url);
    const uptime = calculateUptime(checks);
    const breakdown = getStatusBreakdown(checks);
    const dns = await checkDNS(url);

    const normalizedUrl = url.startsWith("http")
  ? url
  : `https://${url}`;
    const ssl = checkSSL(normalizedUrl);

    return Response.json({
      checks,
      uptimePercentage: uptime,
      statusBreakdown: breakdown,
      dns,
      ssl,
    });
  } catch (error: any) {
    console.error("API ERROR:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}