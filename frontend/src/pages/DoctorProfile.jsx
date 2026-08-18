import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { MapPin, Clock, Star, ArrowLeft } from "lucide-react";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = () => {
    axios.get(`${import.meta.env.VITE_REVIEW_URL}/api/reviews/doctor/${id}`)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]));
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_DOCTOR_URL}/api/doctors/${id}`)
      .then(res => setDoctor(res.data))
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
    fetchReviews();
  }, [id]);

  const handleSubmitReview = async () => {
    setSubmitMsg("");
    setSubmitErr("");
    if (!appointmentId.trim()) {
      setSubmitErr("Please enter the appointment ID this review is for.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_REVIEW_URL}/api/reviews`, {
        doctorId: id,
        appointmentId: appointmentId.trim(),
        rating,
        comment
      }, { headers: { authorization: `Bearer ${token}` } });
      setSubmitMsg("✅ Review submitted, thank you!");
      setComment("");
      setAppointmentId("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      setSubmitErr(err.response?.data?.message || "Failed to submit review");
    }
    setSubmitting(false);
  };

  const cardStyle = { background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" };
  const inputStyle = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box", fontSize: "14px" };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <div onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a0aec0", cursor: "pointer", marginBottom: "24px", width: "fit-content" }}>
          <ArrowLeft size={18} /> Back
        </div>

        {loading ? (
          <p style={{ color: "#a0aec0" }}>Loading doctor profile...</p>
        ) : !doctor ? (
          <p style={{ color: "#a0aec0" }}>Doctor not found.</p>
        ) : (
          <>
            <div style={{ ...cardStyle, marginBottom: "24px", display: "flex", gap: "24px", alignItems: "flex-start" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #e94560, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0 }}>
                👨‍⚕️
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ color: "#fff", margin: "0 0 6px 0", fontSize: "26px" }}>Dr. {doctor.name}</h1>
                <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", background: "rgba(52,152,219,0.2)", color: "#3498db" }}>{doctor.specialization}</span>
                <div style={{ display: "grid", gap: "8px", marginTop: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a0aec0", fontSize: "14px" }}>
                    <Star size={16} color="#f39c12" /> {doctor.rating ? `${doctor.rating.toFixed?.(1) ?? doctor.rating} rating` : "No ratings yet"} • {doctor.experience} years experience
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a0aec0", fontSize: "14px" }}>
                    <MapPin size={16} color="#e94560" /> {doctor.clinic?.name}, {doctor.clinic?.address}, {doctor.clinic?.city}, {doctor.clinic?.state}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a0aec0", fontSize: "14px" }}>
                    <Clock size={16} color="#3498db" /> {doctor.availableDays?.join(", ")} • {doctor.availableTimeSlots?.join(", ")}
                  </div>
                </div>
                {doctor.about && <p style={{ color: "#a0aec0", marginTop: "16px", fontSize: "14px", lineHeight: 1.6 }}>{doctor.about}</p>}
                {doctor.qualifications?.length > 0 && (
                  <p style={{ color: "#a0aec0", marginTop: "8px", fontSize: "13px" }}>🎓 {doctor.qualifications.join(", ")}</p>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#48c78e", fontWeight: "700", fontSize: "22px" }}>₹{doctor.fees}</div>
                <div style={{ color: "#a0aec0", fontSize: "12px" }}>per visit</div>
              </div>
            </div>

            {user?.role === "patient" && (
              <div style={{ ...cardStyle, marginBottom: "24px" }}>
                <h3 style={{ color: "#fff", marginTop: 0, marginBottom: "16px" }}>Leave a Review</h3>
                {submitMsg && <div style={{ background: "rgba(72,199,142,0.2)", border: "1px solid #48c78e", borderRadius: "10px", padding: "10px", marginBottom: "14px", color: "#48c78e", fontSize: "13px" }}>{submitMsg}</div>}
                {submitErr && <div style={{ background: "rgba(233,69,96,0.2)", border: "1px solid #e94560", borderRadius: "10px", padding: "10px", marginBottom: "14px", color: "#e94560", fontSize: "13px" }}>{submitErr}</div>}

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    Appointment ID being reviewed (simplification: paste the appointment's ID from the Appointments page)
                  </label>
                  <input value={appointmentId} onChange={e => setAppointmentId(e.target.value)} placeholder="e.g. 65f1a2b3c4d5e6f7a8b9c0d1" style={inputStyle} />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Rating</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={26} color="#f39c12" fill={n <= rating ? "#f39c12" : "none"}
                        style={{ cursor: "pointer" }} onClick={() => setRating(n)} />
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ color: "#a0aec0", fontSize: "13px", display: "block", marginBottom: "6px" }}>Comment</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                    placeholder="Share your experience..." style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                <button onClick={handleSubmitReview} disabled={submitting}
                  style={{ padding: "12px 24px", background: "linear-gradient(135deg, #e94560, #0f3460)", border: "none", borderRadius: "10px", color: "#fff", cursor: submitting ? "default" : "pointer", fontWeight: "600", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            )}

            <div style={cardStyle}>
              <h3 style={{ color: "#fff", marginTop: 0, marginBottom: "16px" }}>Patient Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p style={{ color: "#a0aec0" }}>No reviews yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
                      <div style={{ color: "#f39c12", fontSize: "14px", marginBottom: "4px" }}>
                        {"⭐".repeat(r.rating)}
                      </div>
                      <p style={{ color: "#a0aec0", margin: 0, fontSize: "14px" }}>{r.comment}</p>
                      <p style={{ color: "#6b7280", margin: "4px 0 0 0", fontSize: "12px" }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
