import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic SDK with API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "your-api-key-here",
});

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required for modification." },
        { status: 400 }
      );
    }

    // Fetch the current React code from the save-code API
    const savedCodeResponse = await fetch("https://react-preview-zu7d.vercel.app/api/save-code", {
      method: "GET",
    });

    if (!savedCodeResponse.ok) {
      throw new Error("Failed to fetch the current React code.");
    }

    const savedCodeData = await savedCodeResponse.json();
    const currentReactCode = savedCodeData.reactCode || "";

    if (!currentReactCode) {
      return NextResponse.json(
        { error: "No React code found in the save-code API." },
        { status: 404 }
      );
    }

    // Extract the user's latest instruction
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Construct the prompt for the AI
    const prompt = `
\n\nHuman: Here is the current React code:
${currentReactCode}

User instruction:
${lastMessage}

Please modify the code based on the user's instructions. 
and do not remove any part of the code. Include also unchanged parts of the code in the response. 
Each component's code should exist in the response.
Give the React code between the following markers: ---jsx and ---. 
Do not forget to include the export default statement at the end.
\n\nAssistant:
    `;

    console.log("Prompt to AI:", prompt);

    // Use Anthropic's streaming messages API
    const stream = await anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      start(controller) {
        let reactCode = "";

        stream.on("text", (chunk) => {
          reactCode += chunk;

          // Pass intermediate text chunks to the client
          controller.enqueue(encoder.encode(chunk));
        });

        stream.on("end", () => {
          // Finalize processing the response
          console.log("Final React Code:", reactCode);
          const match = reactCode.match(/---jsx([\s\S]*?)---/);
          const cleanedReactCode = match ? match[1].trim() : null;

          // Save the updated code back to the save-code API
          fetch("https://react-preview-zu7d.vercel.app/api/save-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reactCode: cleanedReactCode }),
          }).catch((error) =>
            console.error("Failed to save React code:", error)
          );

          controller.close();
        });

        stream.on("error", (err) => {
          console.error("Streaming error:", err);
          controller.error(err);
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Error in modify-code API:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Failed to process request to modify the code." },
      { status: 500 }
    );
  }
}
