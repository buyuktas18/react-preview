"use client";

import type { JSX } from "react";
import React, { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { sandpackDark, githubLight } from "@codesandbox/sandpack-themes";

export default function PreviewPage(): JSX.Element {
  const [reactCode, setReactCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "system", content: "You can instruct me to modify the React code." },
  ]);
  const [chatbotInput, setChatbotInput] = useState<string>("");
  const [chatbotLoading, setChatbotLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [showChatbot, setShowChatbot] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  useEffect(() => {
    async function fetchReactCode() {
      try {
        const response = await fetch("/api/save-code");
        if (!response.ok) throw new Error("Failed to fetch the code.");
        const data = await response.json();
        setReactCode(data.reactCode);
      } catch (err) {
        console.error(err);
        setError("Error occurred while fetching the code.");
      } finally {
        setLoading(false);
      }
    }

    fetchReactCode();
  }, []);

  const handleChatbotSubmit = async () => {
    if (!chatbotInput.trim()) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: chatbotInput.trim() },
      { role: "assistant", content: "" },
    ];
    setMessages(updatedMessages);
    setChatbotInput("");
    setChatbotLoading(true);

    try {
      const response = await fetch("/api/modify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages.slice(0, -1) }),
      });

      if (!response.ok) throw new Error("Failed to get a response from AI.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";

      if (!reader) {
        throw new Error("Reader is undefined");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];

          for (let i = updatedMessages.length - 1; i >= 0; i--) {
            if (updatedMessages[i].role === "assistant") {
              updatedMessages[i] = {
                ...updatedMessages[i],
                content: fullResponse,
              };
              break;
            }
          }

          return updatedMessages;
        });

        const match = fullResponse.match(/---jsx([\s\S]*?)---/);
        if (match) {
          const extractedCode = match[1].trim();
          setReactCode(extractedCode);

          await fetch("/api/save-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reactCode: extractedCode }),
          });
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

  const formatMessage = (content: string) => {
    const codeRegex = /---jsx([\s\S]*?)---/g;
    const parts = content.split(codeRegex);
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <pre
          key={index}
          style={{
            backgroundColor: darkMode ? "#000" : "#f4f4f4",
            color: darkMode ? "#fff" : "#000",
            padding: "10px",
            borderRadius: "5px",
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {part}
        </pre>
      ) : (
        <p key={index}>{part}</p>
      )
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "Inter, sans-serif",
        backgroundColor: darkMode ? "#181818" : "#f4f4f4",
        color: darkMode ? "#f9f9f9" : "#1e1e1e",
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 30px",
          backgroundColor: darkMode ? "#333" : "#ffffff",
          borderBottom: `1px solid ${darkMode ? "#444" : "#ddd"}`,
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
          React Code Previewer
        </h1>
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: darkMode ? "#444" : "#0070f3",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={() => setShowEditor((prev) => !prev)}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#0070f3",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {showEditor ? "Hide Editor" : "Show Editor"}
          </button>
          <button
            onClick={() => window.open("https://www.figma.com", "_blank")}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#ff4081",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Open Figma
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Chatbot Section */}
        {showChatbot ? (
          <div
            style={{
              width: "30%",
              padding: "20px",
              backgroundColor: darkMode ? "#282828" : "#ffffff",
              borderRight: `1px solid ${darkMode ? "#444" : "#ddd"}`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>Chatbot</h2>
              <button
                onClick={() => setShowChatbot(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: darkMode ? "#fff" : "#000",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✖
              </button>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "scroll",
                backgroundColor: darkMode ? "#333" : "#f8f8f8",
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                marginBottom: "20px",
              }}
            >
              {messages.map((msg, index) => (
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
                      maxWidth: "80%",
                      backgroundColor:
                        msg.role === "user"
                          ? darkMode
                            ? "#007acc"
                            : "#0070f3"
                          : darkMode
                          ? "#444"
                          : "#e9e9e9",
                      color:
                        msg.role === "user"
                          ? "#fff"
                          : darkMode
                          ? "#fff"
                          : "#333",
                      padding: "10px",
                      borderRadius: "8px",
                      wordBreak: "break-word",
                    }}
                  >
                    {formatMessage(msg.content)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !chatbotLoading) {
                    handleChatbotSubmit();
                  }
                }}
                placeholder="Type your instructions here..."
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "5px",
                  border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
                  backgroundColor: darkMode ? "#282828" : "#ffffff",
                  color: darkMode ? "#fff" : "#000",
                }}
              />
              <button
                onClick={handleChatbotSubmit}
                disabled={chatbotLoading}
                style={{
                  padding: "10px 20px",
                  borderRadius: "5px",
                  backgroundColor: chatbotLoading
                    ? darkMode
                      ? "#555"
                      : "#ccc"
                    : "#0070f3",
                  color: "#fff",
                  border: "none",
                  cursor: chatbotLoading ? "not-allowed" : "pointer",
                }}
              >
                {chatbotLoading ? "Loading..." : "Send"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowChatbot(true)}
            style={{
              position: "absolute",
              zIndex: 1,
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: darkMode ? "#444" : "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "0 5px 5px 0",
              padding: "10px 15px",
              cursor: "pointer",
              boxShadow: darkMode
                ? "0 4px 6px rgba(0, 0, 0, 0.5)"
                : "0 4px 6px rgba(0, 0, 0, 0.2)",
              transition: "background-color 0.3s ease, transform 0.3s ease",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}
          >
            💬
          </button>
        )}

        {/* Sandpack Section */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  fontSize: "1.5rem",
                  color: darkMode ? "#aaa" : "#333",
                }}
              >
                Loading React Code...
              </div>
            ) : error ? (
              <p style={{ textAlign: "center", color: "red" }}>{error}</p>
            ) : (
              <SandpackProvider
                template="react"
                theme={darkMode ? sandpackDark : githubLight}
                files={{
                  "/App.js": reactCode || "",
                }}
                customSetup={{
                  dependencies: {
                    react: "^18.0.0",
                    "react-dom": "^18.0.0",
                  },
                }}
              >
                <SandpackLayout
                  style={{ height: "calc(100vh - 150px)", overflow: "auto" }}
                >
                  {showEditor && (
                    <SandpackCodeEditor
                      showLineNumbers
                      style={{
                        height: "calc(100vh - 150px)",
                        overflow: "auto",
                      }}
                    />
                  )}
                  <SandpackPreview
                    style={{ height: "calc(100vh - 150px)", overflow: "auto" }}
                  />
                </SandpackLayout>
              </SandpackProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
