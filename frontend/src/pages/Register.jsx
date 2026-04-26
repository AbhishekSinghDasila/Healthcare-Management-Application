import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Heart, User, Mail, Lock, Shield } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "patient" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      await axios.post(`${import.meta.env.VITE_AUTH_URL}/api/auth/register`, form);
      setSuccess("✅ Registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "14px 14px 14px 44px", background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", color: "#fff",
    fontSize: "14px", outline: "none", boxSizing: "border-box"
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
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 }}>Create Account</h1>
          <p style={{ color: "#a0aec0", marginTop: "8px" }}>Join HealthCare System</p>
        </div>

        {error && <div style={{ background: "rgba(233,69,96,0.2)", border: "1px solid #e94560", borderRadius: "10px", padding: "12px", marginBottom: "20px", color: "#e94560", fontSize: "14px" }}>{error}</div>}
        {success && <div style={{ background: "rgba(72,199,142,0.2)", border: "1px solid #48c78e", borderRadius: "10px", padding: "12px", marginBottom: "20px", color: "#48c78e", fontSize: "14px" }}>{success}</div>}

        {[
          { label: "Full Name", key: "name", type: "text", placeholder: "John Doe", Icon: User },
          { label: "Email", key: "email", type: "email", placeholder: "your@email.com", Icon: Mail },
          { label: "Password", key: "password", type: "password", placeholder: "••••••••", Icon: Lock },
        ].map(({ label, key, type, placeholder, Icon }) => (
          <div key={key} style={{ marginBottom: "20px" }}>
            <label style={{ color: "#a0aec0", fontSize: "13px", marginBottom: "8px", display: "block" }}>{label}</label>
            <div style={{ position: "relative" }}>
              <Icon size={18} color="#a0aec0" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input type={type} placeholder={placeholder}
                value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={inputStyle} />
            </div>
          </div>
        ))}

        <div style={{ marginBottom: "28px" }}>
          <label style={{ color: "#a0aec0", fontSize: "13px", marginBottom: "8px", display: "block" }}>Role</label>
          <div style={{ position: "relative" }}>
            <Shield size={18} color="#a0aec0" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", zIndex: 1 }} />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ ...inputStyle, appearance: "none" }}>
              <option value="patient" style={{ background: "#1a1a2e" }}>Patient</option>
              <option value="doctor" style={{ background: "#1a1a2e" }}>Doctor</option>
              <option value="admin" style={{ background: "#1a1a2e" }}>Admin</option>
            </select>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: "100%", padding: "14px", background: "linear-gradient(135deg, #e94560, #0f3460)",
            border: "none", borderRadius: "12px", color: "#fff", fontSize: "16px",
            fontWeight: "600", cursor: "pointer", marginBottom: "20px"
          }}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p style={{ textAlign: "center", color: "#a0aec0", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#e94560", textDecoration: "none", fontWeight: "600" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}