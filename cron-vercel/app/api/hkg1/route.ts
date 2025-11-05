import { handleRegionBenchmarkRequest } from "@/lib/measure";

export const dynamic = "force-dynamic";
export const maxDuration = 600; // 10 minutes maximum execution time

export async function GET(request: Request) {
  return handleRegionBenchmarkRequest(request, "hkg1");
}
