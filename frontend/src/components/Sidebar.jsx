import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, FileText,
  CreditCard, BarChart2, LogOut, Heart, Users, UserCheck, Stethoscope, Sparkles, User
} from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const patientLinks = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/patient" },
    { icon: <Users size={20} />, label: "Find Doctors", path: "/browse-doctors" },
    { icon: <Calendar size={20} />, label: "Appointments", path: "/appointments" },
    { icon: <CreditCard size={20} />, label: "Billing", path: "/billing" },
    { icon: <User size={20} />, label: "My Profile", path: "/profile" },
    { icon: <Sparkles size={20} />, label: "AI Assistant", path: "/assistant" },
  ];

  const doctorLinks = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/doctor" },
    { icon: <Stethoscope size={20} />, label: "My Profile", path: "/doctor-register" },
    { icon: <Calendar size={20} />, label: "Appointments", path: "/appointments" },
    { icon: <FileText size={20} />, label: "Reports", path: "/reports" },
    { icon: <Sparkles size={20} />, label: "AI Assistant", path: "/assistant" },
  ];

  const adminLinks = [
    { icon: <LayoutDashboard size={20} />, label: "Analytics", path: "/admin" },
    { icon: <UserCheck size={20} />, label: "Doctor Approvals", path: "/admin-doctors" },
    { icon: <Calendar size={20} />, label: "Appointments", path: "/appointments" },
    { icon: <CreditCard size={20} />, label: "Billing", path: "/billing" },
    { icon: <BarChart2 size={20} />, label: "Reports", path: "/reports" },
    { icon: <Sparkles size={20} />, label: "AI Assistant", path: "/assistant" },
  ];

  const links = user?.role === "admin" ? adminLinks : user?.role === "doctor" ? doctorLinks : patientLinks;

  return (
    <div style={{
      width: "240px", minHeight: "100vh",
      background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex", flexDirection: "column", padding: "20px 0",
      position: "fixed", left: 0, top: 0, zIndex: 100
    }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Heart size={28} color="#e94560" fill="#e94560" />
            <div>
              <div style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>HealthCare</div>
              <div style={{ color: "#a0aec0", fontSize: "11px" }}>Management System</div>
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>

      <div style={{ padding: "0 12px", flex: 1 }}>
        {links.map((link) => (
          <div key={link.path} onClick={() => navigate(link.path)}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "10px", marginBottom: "4px",
              cursor: "pointer", transition: "all 0.2s",
              background: location.pathname === link.path
                ? "linear-gradient(135deg, #e94560, #0f3460)" : "transparent",
              color: location.pathname === link.path ? "#fff" : "#a0aec0",
            }}>
            {link.icon}
            <span style={{ fontSize: "14px", fontWeight: "500" }}>{link.label}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>{user?.name}</div>
        <div style={{ color: "#a0aec0", fontSize: "11px", textTransform: "capitalize", marginBottom: "12px" }}>{user?.role}</div>
        <div onClick={() => { logout(); navigate("/login"); }}
          style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e94560", cursor: "pointer", fontSize: "13px" }}>
          <LogOut size={16} /> Logout
        </div>
      </div>
    </div>
  );
}