import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_AUTH_URL}/api/auth/login`, form);
      login({ name: res.data.name, role: res.data.role }, res.data.token);
      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "doctor") navigate("/doctor");
      else navigate("/patient");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)",
        borderRadius: "24px", padding: "48px", width: "420px",
        border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Heart size={48} color="#e94560" fill="#e94560" style={{ marginBottom: "16px" }} />
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 }}>Welcome Back</h1>
          <p style={{ color: "#a0aec0", marginTop: "8px" }}>Sign in to HealthCare System</p>
        </div>

        {error && (
          <div style={{ background: "rgba(233,69,96,0.2)", border: "1px solid #e94560", borderRadius: "10px", padding: "12px", marginBottom: "20px", color: "#e94560", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#a0aec0", fontSize: "13px", marginBottom: "8px", display: "block" }}>Email</label>
          <div style={{ position: "relative" }}>
            <Mail size={18} color="#a0aec0" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input type="email" placeholder="your@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              style={{
                width: "100%", padding: "14px 14px 14px 44px", background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", color: "#fff",
                fontSize: "14px", outline: "none", boxSizing: "border-box"
              }} />
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <label style={{ color: "#a0aec0", fontSize: "13px", marginBottom: "8px", display: "block" }}>Password</label>
          <div style={{ position: "relative" }}>
            <Lock size={18} color="#a0aec0" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input type={showPass ? "text" : "password"} placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%", padding: "14px 44px 14px 44px", background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", color: "#fff",
                fontSize: "14px", outline: "none", boxSizing: "border-box"
              }} />
            <div onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
              {showPass ? <EyeOff size={18} color="#a0aec0" /> : <Eye size={18} color="#a0aec0" />}
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: "100%", padding: "14px", background: "linear-gradient(135deg, #e94560, #0f3460)",
            border: "none", borderRadius: "12px", color: "#fff", fontSize: "16px",
            fontWeight: "600", cursor: "pointer", marginBottom: "20px"
          }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ textAlign: "center", color: "#a0aec0", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#e94560", textDecoration: "none", fontWeight: "600" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}