"use client";

import React, { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";

export default function PreviewPage(): JSX.Element {
  const [reactCode, setReactCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "system", content: "You can instruct me to modify the React code." },
  ]);
  const [chatbotInput, setChatbotInput] = useState<string>("");
  const [chatbotLoading, setChatbotLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchReactCode() {
      try {
        const response = await fetch("/api/save-code");
        if (!response.ok) throw new Error("Failed to fetch the code.");
        const data = await response.json();
        setReactCode(data.reactCode);
      } catch (err) {
        setError("Error occurred while fetching the code.");
      } finally {
        setLoading(false);
      }
    }

    fetchReactCode();
  }, []);

  // Extract code block between ---jsx and ---
  const extractCodeBlock = (responseText: string): string | null => {
    const match = responseText.match(/---jsx([\s\S]*?)---/);
    return match ? match[1].trim() : null;
  };

  const handleChatbotSubmit = async () => {
    if (!chatbotInput.trim()) return;

    // Add user's message to the chat
    const updatedMessages = [
      ...messages,
      { role: "user", content: chatbotInput.trim() },
    ];
    setMessages(updatedMessages); // Add user input immediately
    setChatbotInput(""); // Clear the input box
    setChatbotLoading(true); // Show loading state

    try {
      // Send the conversation to the API
      const response = await fetch("/api/modify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error("Failed to get a response from AI.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";
      let codeExtracted = false;

      // Stream the AI's response
      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        // Append the current partial AI response to the chat
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1), // Keep all previous messages, including user's
          { role: "assistant", content: fullResponse },
        ]);

        // Extract code block once and update the React editor
        if (!codeExtracted) {
          const extractedCode = extractCodeBlock(fullResponse);
          if (extractedCode) {
            setReactCode(extractedCode);
            codeExtracted = true;

            // Save the updated code to the save-code API
            await fetch("/api/save-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reactCode: extractedCode }),
            });
          }
        }
      }
    } catch (error) {
      // Add an error message to the chat if the AI fails
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setChatbotLoading(false); // End loading state
    }
  };

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "700" }}>
              React Preview & Chatbot Assistant
            </h1>
            <p style={{ fontSize: "1rem" }}>
              View, edit, and improve React code using AI assistance
            </p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Loading React Code...
          </div>
        ) : error ? (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        ) : (
          <>
            <div
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "20px",
              }}
            >
              <Sandpack
                template="react"
                files={{
                  "/App.js": {
                    code: reactCode || "",
                    active: true,
                  },
                }}
                options={{
                  showNavigator: false,
                  showLineNumbers: true,
                  editorHeight: 400,
                }}
                customSetup={{
                  dependencies: {
                    react: "^18.0.0",
                    "react-dom": "^18.0.0",
                  },
                }}
              />
            </div>

            <section>
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h2>Chatbot</h2>
                <div
                  style={{
                    height: "300px",
                    overflowY: "scroll",
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    marginBottom: "20px",
                  }}
                >
                  {messages.map((msg, index) => {
                    const codeBlock = extractCodeBlock(msg.content);
                    return (
                      <div key={index} style={{ marginBottom: "10px" }}>
                        <strong>{msg.role === "user" ? "You:" : "AI:"}</strong>
                        <div
                          style={{
                            backgroundColor: codeBlock
                              ? "#1e1e1e"
                              : "#f1f1f1",
                            color: codeBlock ? "#d4d4d4" : "#333",
                            fontFamily: codeBlock ? "monospace" : "inherit",
                            padding: "10px",
                            borderRadius: "5px",
                          }}
                        >
                          {codeBlock ? (
                            codeBlock.split("\n").map((line, i) => (
                              <div key={i}>{line}</div>
                            ))
                          ) : (
                            <span>{msg.content}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    value={chatbotInput}
                    onChange={(e) => setChatbotInput(e.target.value)}
                    placeholder="Type your instructions here..."
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ddd",
                    }}
                  />
                  <button
                    onClick={handleChatbotSubmit}
                    disabled={chatbotLoading}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "5px",
                      backgroundColor: chatbotLoading ? "#ccc" : "#0070f3",
                      color: "#fff",
                      border: "none",
                      cursor: chatbotLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {chatbotLoading ? "Loading..." : "Send"}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
