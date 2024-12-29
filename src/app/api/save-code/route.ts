import { NextResponse } from "next/server";

let savedCode = "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reactCode } = body;

    if (!reactCode) {
      return NextResponse.json({ error: "React code is required." }, { status: 400 });
    }

    savedCode = reactCode; // Save the React code

    return NextResponse.json({ message: "React code saved successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save React code." }, { status: 500 });
  }
}

export async function GET() {
  if (!savedCode) {
    return NextResponse.json({ error: "No saved code found." }, { status: 404 });
  }

  return NextResponse.json({ reactCode: savedCode });
}
