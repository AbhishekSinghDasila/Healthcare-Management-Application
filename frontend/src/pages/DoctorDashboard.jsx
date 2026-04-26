import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText, Users } from "lucide-react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { title: "All Appointments", desc: "View all patient appointments", icon: <Calendar size={32} />, color: "#3498db", path: "/appointments" },
    { title: "Patient Records", desc: "View all patient records", icon: <Users size={32} />, color: "#48c78e", path: "/reports" },
    { title: "Reports", desc: "Generate medical reports", icon: <FileText size={32} />, color: "#f39c12", path: "/reports" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
          Doctor Dashboard 👨‍⚕️
        </h1>
        <p style={{ color: "#a0aec0", marginBottom: "32px" }}>Welcome Dr. {user?.name}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
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
      </div>
    </div>
  );
}