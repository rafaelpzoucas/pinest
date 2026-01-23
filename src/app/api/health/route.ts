// app/api/health/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs"; // importante para teste

export async function GET() {
  const totalStart = performance.now();

  // 1️⃣ Tempo só da função subir
  const functionStart = performance.now();

  const supabase = createClient();

  const functionReady = performance.now();

  // 2️⃣ Tempo da query no banco
  const dbStart = performance.now();

  const { data, error } = await supabase.from("stores").select("id").limit(1);

  const dbEnd = performance.now();

  return NextResponse.json({
    ok: true,
    error,
    timings: {
      functionInitMs: functionReady - functionStart,
      dbQueryMs: dbEnd - dbStart,
      totalMs: performance.now() - totalStart,
    },
  });
}
