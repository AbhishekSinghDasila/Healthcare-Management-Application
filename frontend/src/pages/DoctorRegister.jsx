import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

export default function DoctorRegister() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", specialization: "General",
    experience: "", fees: "", about: "",
    qualifications: "",
    availableDays: [],
    availableTimeSlots: "",
    clinic: { name: "", address: "", city: "", state: "", pincode: "", lat: "", lng: "" }
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const specs = ["Cardiology","Neurology","Orthopedics","General","Pediatrics","Dermatology","Gynecology","Psychiatry","Ophthalmology","ENT","Dentistry","Radiology"];

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter(d => d !== day)
        : [...f.availableDays, day]
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        qualifications: form.qualifications.split(",").map(q => q.trim()),
        availableTimeSlots: form.availableTimeSlots.split(",").map(t => t.trim()),
        experience: Number(form.experience),
        fees: Number(form.fees),
        clinic: {
          ...form.clinic,
          lat: Number(form.clinic.lat),
          lng: Number(form.clinic.lng)
        }
      };
      await axios.post(`${import.meta.env.VITE_DOCTOR_URL}/api/doctors/register`, payload,
        { headers: { authorization: `Bearer ${token}` } });
      setSuccess("✅ Profile submitted! Waiting for admin approval.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
    color: "#fff", outline: "none", boxSizing: "border-box", fontSize: "14px"
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Doctor Profile Registration</h1>
        <p style={{ color: "#a0aec0", marginBottom: "32px" }}>Submit your profile for admin approval</p>

        {success && <div style={{ background: "rgba(72,199,142,0.2)", border: "1px solid #48c78e", borderRadius: "10px", padding: "12px", marginBottom: "20px", color: "#48c78e" }}>{success}</div>}
        {error && <div style={{ background: "rgba(233,69,96,0.2)", border: "1px solid #e94560", borderRadius: "10px", padding: "12px", marginBottom: "20px", color: "#e94560" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Full Name", key: "name" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "Experience (years)", key: "experience", type: "number" },
            { label: "Consultation Fees (₹)", key: "fees", type: "number" },
            { label: "Qualifications (comma separated)", key: "qualifications" },
            { label: "Time Slots (comma separated, e.g. 9:00 AM, 10:00 AM)", key: "availableTimeSlots" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>{label}</label>
              <input type={type || "text"} placeholder={label}
                value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={inputStyle} />
            </div>
          ))}

          <div>
            <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Specialization</label>
            <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}
              style={{ ...inputStyle, background: "#1a1a2e" }}>
              {specs.map(s => <option key={s} value={s} style={{ background: "#1a1a2e" }}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* About */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>About / Bio</label>
          <textarea placeholder="Tell patients about yourself..."
            value={form.about} onChange={e => setForm({ ...form, about: e.target.value })}
            rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {/* Available Days */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "10px" }}>Available Days</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {days.map(day => (
              <div key={day} onClick={() => toggleDay(day)}
                style={{
                  padding: "8px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
                  background: form.availableDays.includes(day) ? "linear-gradient(135deg, #e94560, #0f3460)" : "rgba(255,255,255,0.08)",
                  color: form.availableDays.includes(day) ? "#fff" : "#a0aec0",
                  border: "1px solid rgba(255,255,255,0.15)"
                }}>
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Clinic Info */}
        <h3 style={{ color: "#fff", marginBottom: "16px", fontSize: "16px" }}>🏥 Clinic Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Clinic Name", key: "name" },
            { label: "Address", key: "address" },
            { label: "City", key: "city" },
            { label: "State", key: "state" },
            { label: "Pincode", key: "pincode" },
            { label: "Latitude (e.g. 28.6139)", key: "lat" },
            { label: "Longitude (e.g. 77.2090)", key: "lng" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>{label}</label>
              <input placeholder={label}
                value={form.clinic[key]} onChange={e => setForm({ ...form, clinic: { ...form.clinic, [key]: e.target.value } })}
                style={inputStyle} />
            </div>
          ))}
        </div>

        <button onClick={handleSubmit}
          style={{ padding: "14px 32px", background: "linear-gradient(135deg, #e94560, #0f3460)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
          Submit for Approval
        </button>
      </div>
    </div>
  );
}