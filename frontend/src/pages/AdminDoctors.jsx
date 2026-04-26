import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminDoctors() {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [rejectReason, setRejectReason] = useState({});

  const fetchDoctors = async () => {
    try {
      const endpoint = filter === "all" ? "/api/doctors/all" : `/api/doctors/${filter}`;
      const res = await axios.get(`${import.meta.env.VITE_DOCTOR_URL}${endpoint}`,
        { headers: { authorization: `Bearer ${token}` } });
      setDoctors(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_DOCTOR_URL}/api/doctors/approve/${id}`, {},
        { headers: { authorization: `Bearer ${token}` } });
      fetchDoctors();
    } catch (err) { alert("Approval failed"); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_DOCTOR_URL}/api/doctors/reject/${id}`,
        { reason: rejectReason[id] || "Does not meet requirements" },
        { headers: { authorization: `Bearer ${token}` } });
      fetchDoctors();
    } catch (err) { alert("Rejection failed"); }
  };

  const statusColor = { pending: "#f39c12", approved: "#48c78e", rejected: "#e94560" };
  const statusIcon = { pending: <Clock size={16} />, approved: <CheckCircle size={16} />, rejected: <XCircle size={16} /> };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Doctor Management</h1>
        <p style={{ color: "#a0aec0", marginBottom: "24px" }}>Review and approve doctor registrations</p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["pending", "approved", "rejected", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "8px 20px", background: filter === f ? "linear-gradient(135deg, #e94560, #0f3460)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "600", textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: "#a0aec0" }}>Loading...</p> : (
          <div style={{ display: "grid", gap: "16px" }}>
            {doctors.length === 0 ? (
              <p style={{ color: "#a0aec0" }}>No {filter} doctors found</p>
            ) : doctors.map(doc => (
              <div key={doc._id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <h3 style={{ color: "#fff", margin: 0, fontSize: "18px" }}>Dr. {doc.name}</h3>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", background: `${statusColor[doc.status]}22`, color: statusColor[doc.status] }}>
                        {statusIcon[doc.status]} {doc.status}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                      {[
                        ["Specialization", doc.specialization],
                        ["Experience", `${doc.experience} years`],
                        ["Fees", `₹${doc.fees}`],
                        ["Phone", doc.phone],
                        ["Email", doc.email],
                        ["City", doc.clinic?.city],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <span style={{ color: "#a0aec0", fontSize: "11px" }}>{label}</span>
                          <p style={{ color: "#fff", margin: "2px 0", fontSize: "13px" }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {doc.about && <p style={{ color: "#a0aec0", fontSize: "13px", margin: "0 0 8px 0" }}>{doc.about}</p>}
                    <p style={{ color: "#a0aec0", fontSize: "12px", margin: 0 }}>
                      🎓 {doc.qualifications?.join(", ")} | 🏥 {doc.clinic?.name}, {doc.clinic?.address}
                    </p>
                    {doc.rejectionReason && (
                      <p style={{ color: "#e94560", fontSize: "12px", marginTop: "8px" }}>
                        ❌ Rejection reason: {doc.rejectionReason}
                      </p>
                    )}
                  </div>

                  {doc.status === "pending" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "16px", minWidth: "200px" }}>
                      <button onClick={() => handleApprove(doc._id)}
                        style={{ padding: "10px 16px", background: "rgba(72,199,142,0.2)", border: "1px solid #48c78e", borderRadius: "8px", color: "#48c78e", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                        <CheckCircle size={16} /> Approve
                      </button>
                      <input placeholder="Rejection reason..."
                        value={rejectReason[doc._id] || ""}
                        onChange={e => setRejectReason({ ...rejectReason, [doc._id]: e.target.value })}
                        style={{ padding: "8px 12px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none", fontSize: "12px" }} />
                      <button onClick={() => handleReject(doc._id)}
                        style={{ padding: "10px 16px", background: "rgba(233,69,96,0.2)", border: "1px solid #e94560", borderRadius: "8px", color: "#e94560", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
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