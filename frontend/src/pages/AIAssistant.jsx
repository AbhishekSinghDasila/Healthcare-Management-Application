import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { Sparkles, Send } from "lucide-react";

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I'm your AI health assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || sending) return;
    setMessages(m => [...m, { sender: "user", text: prompt }]);
    setInput("");
    setSending(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_AI_URL}/ask`, {
        prompt, role: user?.role
      });
      setMessages(m => [...m, { sender: "ai", text: res.data.reply }]);
    } catch (err) {
      setMessages(m => [...m, { sender: "ai", text: "Sorry, I couldn't process that right now. Please try again." }]);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Sparkles size={26} color="#e94560" />
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 }}>AI Assistant</h1>
        </div>
        <p style={{ color: "#a0aec0", marginBottom: "24px" }}>Ask questions and get instant AI-powered help</p>

        <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: "0" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "65%", padding: "12px 16px", borderRadius: "14px", fontSize: "14px", lineHeight: 1.5,
                  background: msg.sender === "user" ? "linear-gradient(135deg, #e94560, #0f3460)" : "rgba(255,255,255,0.08)",
                  color: msg.sender === "user" ? "#fff" : "#e2e8f0",
                  whiteSpace: "pre-wrap"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "12px 16px", borderRadius: "14px", background: "rgba(255,255,255,0.08)", color: "#a0aec0", fontSize: "14px" }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: "flex", gap: "10px", padding: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "12px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", color: "#fff", outline: "none" }}
            />
            <button onClick={handleSend} disabled={sending || !input.trim()}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", background: "linear-gradient(135deg, #e94560, #0f3460)", border: "none", borderRadius: "10px", color: "#fff", cursor: sending ? "default" : "pointer", fontWeight: "600", opacity: sending || !input.trim() ? 0.7 : 1 }}>
              <Send size={16} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
