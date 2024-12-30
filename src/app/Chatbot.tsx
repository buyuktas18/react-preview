"use client";

import React, { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "system", content: "You can instruct me to modify the React code." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input.trim() },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setTyping(true);

    try {
      const response = await fetch("/api/modify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to get a response");

      const data = await response.json();

      // Simulate line-by-line response
      const responseLines = data.result.split("\n");
      let currentResponse = "";
      for (const line of responseLines) {
        currentResponse += line + "\n";
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: currentResponse },
        ]);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.log(error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>AI Chatbot for React Code</h1>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
          height: "400px",
          overflowY: "scroll",
          background: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px",
                borderRadius: "8px",
                background: msg.role === "user" ? "#d1fae5" : "#e5e7eb",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#333",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {typing && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <div className="dot-flashing"></div>
          </div>
        )}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your instructions here..."
          style={{
            width: "calc(100% - 80px)",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            width: "160px",
            marginLeft: "10px",
            padding: "10px",
            borderRadius: "5px",
            background: loading ? "#ccc" : "#00a651",
            color: "#000",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : "Sen"}
        </button>
      </div>
    </div>
  );
}
