import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { Calendar, Plus, X } from "lucide-react";

export default function Appointments() {
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    patientName: "", doctorName: "", department: "General",
    appointmentDate: "", timeSlot: "", reason: ""
  });

  const fetchAppointments = async () => {
    try {
      const endpoint = user?.role === "patient" ? "/api/appointments/me" : "/api/appointments";
      const res = await axios.get(`${import.meta.env.VITE_APPOINTMENT_URL}${endpoint}`,
        { headers: { authorization: `Bearer ${token}` } });
      setAppointments(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleBook = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_APPOINTMENT_URL}/api/appointments`, form,
        { headers: { authorization: `Bearer ${token}` } });
      setShowForm(false);
      setForm({ patientName: "", doctorName: "", department: "General", appointmentDate: "", timeSlot: "", reason: "" });
      fetchAppointments();
    } catch (err) { alert(err.response?.data?.message || "Booking failed"); }
  };

  const handleCancel = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_APPOINTMENT_URL}/api/appointments/${id}`,
        { headers: { authorization: `Bearer ${token}` } });
      fetchAppointments();
    } catch (err) { alert("Cancel failed"); }
  };

  const statusColor = { scheduled: "#3498db", completed: "#48c78e", cancelled: "#e94560" };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: 0 }}>Appointments</h1>
            <p style={{ color: "#a0aec0", marginTop: "8px" }}>Manage your appointments</p>
          </div>
          {user?.role === "patient" && (
            <button onClick={() => setShowForm(true)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", background: "linear-gradient(135deg, #e94560, #0f3460)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
              <Plus size={18} /> Book Appointment
            </button>
          )}
        </div>

        {showForm && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: "#fff", margin: 0 }}>Book New Appointment</h3>
              <X size={20} color="#a0aec0" onClick={() => setShowForm(false)} style={{ cursor: "pointer" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Patient Name", key: "patientName", type: "text" },
                { label: "Doctor Name", key: "doctorName", type: "text" },
                { label: "Date", key: "appointmentDate", type: "date" },
                { label: "Time Slot", key: "timeSlot", type: "text", placeholder: "e.g. 10:00 AM" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>{label}</label>
                  <input type={type} placeholder={placeholder || label}
                    value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none" }}>
                  {["Cardiology", "Neurology", "Orthopedics", "General", "Pediatrics", "Dermatology"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Reason</label>
                <input type="text" placeholder="Reason for visit"
                  value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <button onClick={handleBook}
              style={{ marginTop: "16px", padding: "12px 24px", background: "linear-gradient(135deg, #e94560, #0f3460)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
              Confirm Booking
            </button>
          </div>
        )}

        {loading ? <p style={{ color: "#a0aec0" }}>Loading...</p> : (
          <div style={{ display: "grid", gap: "12px" }}>
            {appointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#a0aec0" }}>
                <Calendar size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>No appointments found</p>
              </div>
            ) : appointments.map((apt) => (
              <div key={apt._id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ color: "#fff", margin: "0 0 6px 0", fontSize: "16px" }}>Dr. {apt.doctorName}</h3>
                  <p style={{ color: "#a0aec0", margin: "0 0 4px 0", fontSize: "13px" }}>{apt.department} • {apt.timeSlot}</p>
                  <p style={{ color: "#a0aec0", margin: 0, fontSize: "13px" }}>{new Date(apt.appointmentDate).toLocaleDateString()} • {apt.reason}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: `${statusColor[apt.status]}22`, color: statusColor[apt.status] }}>
                    {apt.status}
                  </span>
                  {apt.status === "scheduled" && user?.role === "patient" && (
                    <button onClick={() => handleCancel(apt._id)}
                      style={{ padding: "6px 14px", background: "rgba(233,69,96,0.2)", border: "1px solid #e94560", borderRadius: "8px", color: "#e94560", cursor: "pointer", fontSize: "12px" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}