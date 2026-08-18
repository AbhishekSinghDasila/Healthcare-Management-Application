import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { User } from "lucide-react";

const emptyForm = {
  name: "", age: "", gender: "Male", bloodGroup: "", phone: "", address: "",
  allergies: "",
  emergencyContact: { name: "", phone: "", relation: "" }
};

export default function PatientProfile() {
  const { token, user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchPatient = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_PATIENT_URL}/api/patients/me`,
        { headers: { authorization: `Bearer ${token}` } });
      setPatient(res.data);
      setExists(true);
      setForm({
        name: res.data.name || "",
        age: res.data.age ?? "",
        gender: res.data.gender || "Male",
        bloodGroup: res.data.bloodGroup || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        allergies: (res.data.allergies || []).join(", "),
        emergencyContact: {
          name: res.data.emergencyContact?.name || "",
          phone: res.data.emergencyContact?.phone || "",
          relation: res.data.emergencyContact?.relation || ""
        }
      });
      setEditing(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setExists(false);
        setForm(f => ({ ...f, name: user?.name || "" }));
        setEditing(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchPatient(); }, []);

  const handleSave = async () => {
    setSuccess("");
    setError("");
    const payload = {
      ...form,
      age: Number(form.age),
      allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean)
    };
    try {
      if (exists) {
        await axios.put(`${import.meta.env.VITE_PATIENT_URL}/api/patients/me`, payload,
          { headers: { authorization: `Bearer ${token}` } });
        setSuccess("✅ Profile updated");
      } else {
        await axios.post(`${import.meta.env.VITE_PATIENT_URL}/api/patients/`, payload,
          { headers: { authorization: `Bearer ${token}` } });
        setSuccess("✅ Patient record created");
      }
      fetchPatient();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save record");
    }
  };

  const inputStyle = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box", fontSize: "14px" };
  const cardStyle = { background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>My Profile</h1>
        <p style={{ color: "#a0aec0", marginBottom: "32px" }}>
          {exists ? "Your patient record" : "Create your patient record"}
        </p>

        {success && <div style={{ background: "rgba(72,199,142,0.2)", border: "1px solid #48c78e", borderRadius: "10px", padding: "12px", marginBottom: "20px", color: "#48c78e" }}>{success}</div>}
        {error && <div style={{ background: "rgba(233,69,96,0.2)", border: "1px solid #e94560", borderRadius: "10px", padding: "12px", marginBottom: "20px", color: "#e94560" }}>{error}</div>}

        {loading ? (
          <p style={{ color: "#a0aec0" }}>Loading...</p>
        ) : !editing ? (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #e94560, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={26} color="#fff" />
              </div>
              <div>
                <h2 style={{ color: "#fff", margin: 0, fontSize: "20px" }}>{patient.name}</h2>
                <p style={{ color: "#a0aec0", margin: "4px 0 0 0", fontSize: "13px" }}>{patient.age} years • {patient.gender} • {patient.bloodGroup || "Blood group N/A"}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <p style={{ color: "#a0aec0", margin: 0, fontSize: "14px" }}><strong style={{ color: "#fff" }}>Phone:</strong> {patient.phone}</p>
              <p style={{ color: "#a0aec0", margin: 0, fontSize: "14px" }}><strong style={{ color: "#fff" }}>Address:</strong> {patient.address || "N/A"}</p>
              <p style={{ color: "#a0aec0", margin: 0, fontSize: "14px" }}><strong style={{ color: "#fff" }}>Allergies:</strong> {patient.allergies?.length ? patient.allergies.join(", ") : "None recorded"}</p>
              <p style={{ color: "#a0aec0", margin: 0, fontSize: "14px" }}>
                <strong style={{ color: "#fff" }}>Emergency Contact:</strong> {patient.emergencyContact?.name ? `${patient.emergencyContact.name} (${patient.emergencyContact.relation}) — ${patient.emergencyContact.phone}` : "None recorded"}
              </p>
            </div>
            {patient.medicalHistory?.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <strong style={{ color: "#fff", fontSize: "14px" }}>Medical History:</strong>
                <ul style={{ color: "#a0aec0", fontSize: "13px", marginTop: "6px" }}>
                  {patient.medicalHistory.map((m, i) => (
                    <li key={i}>{m.condition} {m.diagnosedDate ? `(${new Date(m.diagnosedDate).toLocaleDateString()})` : ""} {m.notes ? `— ${m.notes}` : ""}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => setEditing(true)}
              style={{ padding: "12px 24px", background: "linear-gradient(135deg, #e94560, #0f3460)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
              Edit Profile
            </button>
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Age</label>
                <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={{ ...inputStyle, background: "#1a1a2e" }}>
                  {["Male", "Female", "Other"].map(g => <option key={g} value={g} style={{ background: "#1a1a2e" }}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Blood Group</label>
                <input value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} placeholder="e.g. O+" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Allergies (comma separated)</label>
                <input value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, Peanuts" style={inputStyle} />
              </div>
            </div>

            <h3 style={{ color: "#fff", marginBottom: "16px", fontSize: "16px" }}>Emergency Contact</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Name</label>
                <input value={form.emergencyContact.name} onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Phone</label>
                <input value={form.emergencyContact.phone} onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Relation</label>
                <input value={form.emergencyContact.relation} onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleSave}
                style={{ padding: "12px 24px", background: "linear-gradient(135deg, #e94560, #0f3460)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
                {exists ? "Save Changes" : "Create Record"}
              </button>
              {exists && (
                <button onClick={() => setEditing(false)}
                  style={{ padding: "12px 24px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
