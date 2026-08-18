import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Calendar, CreditCard, User, Heart } from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { title: "My Appointments", desc: "View and book appointments", icon: <Calendar size={32} />, color: "#3498db", path: "/appointments" },
    { title: "My Bills", desc: "View billing and payments", icon: <CreditCard size={32} />, color: "#48c78e", path: "/billing" },
    { title: "My Profile", desc: "Manage patient record", icon: <User size={32} />, color: "#e94560", path: "/profile" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: "#a0aec0", marginTop: "8px" }}>Here's your health overview</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {cards.map((card, i) => (
            <div key={i} onClick={() => navigate(card.path)}
              style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "32px",
                border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
                transition: "transform 0.2s", textAlign: "center"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ color: card.color, marginBottom: "16px" }}>{card.icon}</div>
              <h3 style={{ color: "#fff", fontSize: "18px", margin: "0 0 8px 0" }}>{card.title}</h3>
              <p style={{ color: "#a0aec0", fontSize: "14px", margin: 0 }}>{card.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.3)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Heart size={24} color="#e94560" fill="#e94560" />
            <div>
              <h3 style={{ color: "#fff", margin: 0, fontSize: "16px" }}>Health Tip of the Day</h3>
              <p style={{ color: "#a0aec0", margin: "4px 0 0 0", fontSize: "14px" }}>
                Stay hydrated! Drink at least 8 glasses of water daily to maintain good health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}