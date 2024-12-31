import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Redis bağlantısını başlat
const redis = new Redis(process.env.REDIS_URL || "default"); // Çevresel değişkenden URL alın

const REDIS_KEY = "savedReactCode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reactCode } = body;

    if (!reactCode) {
      return NextResponse.json({ error: "React code is required." }, { status: 400 });
    }

    // React kodunu Redis'e kaydet
    await redis.set(REDIS_KEY, reactCode);

    return NextResponse.json({ message: "React code saved successfully!" });
  } catch (error) {
    console.error("Error saving React code:", error);
    return NextResponse.json({ error: "Failed to save React code." }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Redis'ten kaydedilmiş React kodunu al
    const savedCode = await redis.get(REDIS_KEY);

    if (!savedCode) {
      return NextResponse.json({ error: "No saved code found." }, { status: 404 });
    }

    return NextResponse.json({ reactCode: savedCode });
  } catch (error) {
    console.error("Error fetching React code:", error);
    return NextResponse.json({ error: "Failed to fetch React code." }, { status: 500 });
  }
}
