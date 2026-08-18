import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

const COLORS = ["#e94560", "#0f3460", "#533483", "#48c78e", "#f39c12", "#3498db"];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_ANALYTICS_URL}/api/analytics/stats`,
      { headers: { authorization: `Bearer ${token}` } })
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#fff", fontSize: "18px" }}>Loading Analytics...</div>
      </div>
    </div>
  );

  const cards = [
    { title: "Total Patients", value: stats?.overview?.totalPatients || 0, icon: <Users size={24} />, color: "#e94560", bg: "rgba(233,69,96,0.15)" },
    { title: "Total Appointments", value: stats?.overview?.totalAppointments || 0, icon: <Calendar size={24} />, color: "#3498db", bg: "rgba(52,152,219,0.15)" },
    { title: "Total Revenue", value: `₹${stats?.overview?.totalRevenue || 0}`, icon: <DollarSign size={24} />, color: "#48c78e", bg: "rgba(72,199,142,0.15)" },
    { title: "Pending Revenue", value: `₹${stats?.overview?.pendingRevenue || 0}`, icon: <TrendingUp size={24} />, color: "#f39c12", bg: "rgba(243,156,18,0.15)" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Analytics Dashboard</h1>
        <p style={{ color: "#a0aec0", marginBottom: "32px" }}>Healthcare system overview and insights</p>

        {/* Overview Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {cards.map((card, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ color: "#a0aec0", fontSize: "13px", margin: "0 0 8px 0" }}>{card.title}</p>
                  <p style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 }}>{card.value}</p>
                </div>
                <div style={{ background: card.bg, color: card.color, padding: "12px", borderRadius: "12px" }}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          {/* Monthly Appointments */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "16px" }}>Monthly Appointments</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats?.monthlyAppointments || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#a0aec0" fontSize={12} />
                <YAxis stroke="#a0aec0" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Line type="monotone" dataKey="count" stroke="#e94560" strokeWidth={2} dot={{ fill: "#e94560" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Stats */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "16px" }}>Appointments by Department</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.departmentStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} />
                <YAxis stroke="#a0aec0" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="count" fill="#0f3460" radius={[4, 4, 0, 0]}>
                  {(stats?.departmentStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          {/* Appointment Status Pie */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "16px" }}>Appointment Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[
                  { name: "Scheduled", value: stats?.appointmentStats?.scheduled || 0 },
                  { name: "Completed", value: stats?.appointmentStats?.completed || 0 },
                  { name: "Cancelled", value: stats?.appointmentStats?.cancelled || 0 },
                ]} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {["#3498db", "#48c78e", "#e94560"].map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Stats */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "16px" }}>Patient Gender</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats?.genderStats || []} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {["#e94560", "#3498db", "#48c78e"].map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Billing Stats */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "16px" }}>Billing Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[
                  { name: "Paid", value: stats?.billingStats?.paidBills || 0 },
                  { name: "Pending", value: stats?.billingStats?.pendingBills || 0 },
                ]} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {["#48c78e", "#f39c12"].map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}