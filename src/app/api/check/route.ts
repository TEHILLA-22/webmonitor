import { checkWebsite } from "@/lib/checker";

export async function POST(req: Request) {
  const { url } = await req.json();

  const result = await checkWebsite(url);

  return Response.json(result);
}