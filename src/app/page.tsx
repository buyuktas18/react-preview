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

  const extractCodeBlock = (responseText: string): string | null => {
    const match = responseText.match(/---jsx([\s\S]*?)---/);
    return match ? match[1].trim() : null;
  };

  const splitContent = (content: string) => {
    const parts = content.split(/---jsx([\s\S]*?)---/);
    return parts.map((part, index) => {
      if (index % 2 === 0) {
        return { type: "text", content: part };
      } else {
        return { type: "code", content: part.trim() };
      }
    });
  };

  const handleChatbotSubmit = async () => {
    if (!chatbotInput.trim()) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: chatbotInput.trim() },
      { role: "assistant", content: "" }, // Placeholder for AI response
    ];
    setMessages(updatedMessages);
    setChatbotInput("");
    setChatbotLoading(true);

    try {
      const response = await fetch("/api/modify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages.slice(0, -1) }), // Send user messages only
      });

      if (!response.ok) throw new Error("Failed to get a response from AI.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";
      let codeExtracted = false;

      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastAssistantMessageIndex = updatedMessages.findLastIndex(
            (msg) => msg.role === "assistant"
          );

          if (lastAssistantMessageIndex !== -1) {
            updatedMessages[lastAssistantMessageIndex] = {
              ...updatedMessages[lastAssistantMessageIndex],
              content: fullResponse,
            };
          }

          return updatedMessages;
        });

        if (!codeExtracted) {
          const extractedCode = extractCodeBlock(fullResponse);
          if (extractedCode) {
            setReactCode(extractedCode);
            codeExtracted = true;

            await fetch("/api/save-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reactCode: extractedCode }),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error during AI response fetching:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setChatbotLoading(false);
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
                    const parts = splitContent(msg.content);
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent:
                            msg.role === "user" ? "flex-end" : "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            backgroundColor:
                              msg.role === "user" ? "#0070f3" : "#f1f1f1",
                            color: msg.role === "user" ? "#fff" : "#333",
                            padding: "10px",
                            borderRadius: "8px",
                            wordBreak: "break-word",
                          }}
                        >
                          {parts.map((part, i) => (
                            part.type === "code" ? (
                              <pre
                                key={i}
                                style={{
                                  backgroundColor: "#272822",
                                  color: "#f8f8f2",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  overflowX: "auto",
                                  fontFamily: "monospace",
                                }}
                              >
                                {part.content}
                              </pre>
                            ) : (
                              <p key={i} style={{ margin: 0 }}>{part.content}</p>
                            )
                          ))}
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
