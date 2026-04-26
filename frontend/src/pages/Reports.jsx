import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Reports() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_ANALYTICS_URL}/api/analytics/stats`,
      { headers: { authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  const COLORS = ["#e94560", "#3498db", "#48c78e", "#f39c12", "#533483", "#e67e22"];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Reports</h1>
        <p style={{ color: "#a0aec0", marginBottom: "32px" }}>System reports and statistics</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#fff", marginBottom: "20px" }}>Department-wise Appointments</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.departmentStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} />
                <YAxis stroke="#a0aec0" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(stats?.departmentStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#fff", marginBottom: "20px" }}>Summary Report</h3>
            {[
              { label: "Total Patients", value: stats?.overview?.totalPatients || 0, color: "#e94560" },
              { label: "Total Appointments", value: stats?.overview?.totalAppointments || 0, color: "#3498db" },
              { label: "Completed Appointments", value: stats?.appointmentStats?.completed || 0, color: "#48c78e" },
              { label: "Cancelled Appointments", value: stats?.appointmentStats?.cancelled || 0, color: "#f39c12" },
              { label: "Total Revenue", value: `₹${stats?.overview?.totalRevenue || 0}`, color: "#48c78e" },
              { label: "Pending Revenue", value: `₹${stats?.overview?.pendingRevenue || 0}`, color: "#e94560" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#a0aec0", fontSize: "14px" }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: "700", fontSize: "14px" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}