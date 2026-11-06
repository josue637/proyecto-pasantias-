import { NextResponse } from "next/server";
import { createBcvQuote, getBcvRate } from "@/lib/bcv";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(createBcvQuote(await getBcvRate()), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("No se pudo obtener la tasa oficial del BCV.", error);
    return NextResponse.json(
      { error: "La tasa del BCV no está disponible. Inténtalo más tarde." },
      { status: 503 },
    );
  }
}
