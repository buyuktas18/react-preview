import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reactCode } = body;

    if (!reactCode) {
      return NextResponse.json({ error: "React code is required." }, { status: 400 });
    }

    // Save React code to environment variable
    process.env.SAVED_CODE = reactCode;

    return NextResponse.json({ message: "React code saved successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save React code." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const savedCode = process.env.SAVED_CODE || "";

    if (!savedCode) {
      return NextResponse.json({ error: "No saved code found." }, { status: 404 });
    }

    return NextResponse.json({ reactCode: savedCode });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch React code." }, { status: 500 });
  }
}
