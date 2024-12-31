import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not defined");
}

console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image_data, prompt } = body;

    if (!image_data || !prompt) {
      return NextResponse.json({ error: "Image data and prompt are required." }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: image_data,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // Inspect and parse content blocks
    const contentBlocks = message?.content || [];
    const reactCode = contentBlocks
      .map((block) => {
        // Check for blocks with a 'text' property
        if ("text" in block) {
          return block.text;
        }
        return ""; // Ignore unsupported block types
      })
      .join(""); // Combine all text blocks

    // Remove markdown markers
    const cleanedReactCode = reactCode.replace(/^```jsx\n|```$/g, "");

    return NextResponse.json({ reactCode: cleanedReactCode }, { status: 200 });
  } catch (error) {
    console.error("Anthropic Proxy Error:", error);
    return NextResponse.json({ error: "Failed to process request to Anthropic API." }, { status: 500 });
  }
}
