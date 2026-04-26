import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin, Clock, DollarSign, Star } from "lucide-react";

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function BrowseDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(true);

  const specs = ["All","Cardiology","Neurology","Orthopedics","General","Pediatrics","Dermatology","Gynecology","Psychiatry","Ophthalmology","ENT","Dentistry","Radiology"];

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_DOCTOR_URL}/api/doctors/approved`)
      .then(res => { setDoctors(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = doctors;
    if (specFilter !== "All") result = result.filter(d => d.specialization === specFilter);
    if (cityFilter) result = result.filter(d => d.clinic?.city?.toLowerCase().includes(cityFilter.toLowerCase()));
    if (search) result = result.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, specFilter, cityFilter, doctors]);

  const mapDoctors = filtered.filter(d => d.clinic?.lat && d.clinic?.lng);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Find Doctors</h1>
        <p style={{ color: "#a0aec0", marginBottom: "24px" }}>Browse verified doctors and find the right specialist</p>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={16} color="#a0aec0" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input placeholder="Search doctor name..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 36px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }} />
          </div>
          <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
            style={{ padding: "10px 14px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none" }}>
            {specs.map(s => <option key={s} value={s} style={{ background: "#1a1a2e" }}>{s}</option>)}
          </select>
          <input placeholder="Filter by city..."
            value={cityFilter} onChange={e => setCityFilter(e.target.value)}
            style={{ padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", outline: "none", width: "160px" }} />
          <div style={{ display: "flex", gap: "8px" }}>
            {["list", "map"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "10px 20px", background: view === v ? "linear-gradient(135deg, #e94560, #0f3460)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "600", textTransform: "capitalize" }}>
                {v === "list" ? "📋 List" : "🗺️ Map"}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p style={{ color: "#a0aec0" }}>Loading doctors...</p> : (
          <>
            {view === "map" ? (
              <div style={{ borderRadius: "16px", overflow: "hidden", height: "500px", border: "1px solid rgba(255,255,255,0.1)" }}>
                {mapDoctors.length > 0 ? (
                  <MapContainer center={[mapDoctors[0].clinic.lat, mapDoctors[0].clinic.lng]} zoom={11} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                    {mapDoctors.map(doc => (
                      <Marker key={doc._id} position={[doc.clinic.lat, doc.clinic.lng]}>
                        <Popup>
                          <div style={{ minWidth: "180px" }}>
                            <strong>Dr. {doc.name}</strong><br />
                            {doc.specialization}<br />
                            📍 {doc.clinic.address}, {doc.clinic.city}<br />
                            💰 ₹{doc.fees} / visit<br />
                            ⏰ {doc.availableDays?.join(", ")}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", color: "#a0aec0" }}>
                    No doctors with location data found
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                {filtered.length === 0 ? (
                  <p style={{ color: "#a0aec0" }}>No doctors found</p>
                ) : filtered.map(doc => (
                  <div key={doc._id}
                    style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", transition: "transform 0.2s" }}
                    onClick={() => setSelected(selected?._id === doc._id ? null : doc)}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div>
                        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #e94560, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "10px" }}>
                          👨‍⚕️
                        </div>
                        <h3 style={{ color: "#fff", margin: "0 0 4px 0", fontSize: "16px" }}>Dr. {doc.name}</h3>
                        <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", background: "rgba(52,152,219,0.2)", color: "#3498db" }}>{doc.specialization}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#f39c12", fontSize: "13px" }}>⭐ {doc.rating || "New"}</div>
                        <div style={{ color: "#48c78e", fontWeight: "700", fontSize: "16px", marginTop: "4px" }}>₹{doc.fees}</div>
                        <div style={{ color: "#a0aec0", fontSize: "11px" }}>per visit</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a0aec0", fontSize: "13px" }}>
                        <Star size={14} color="#f39c12" /> {doc.experience} years experience
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a0aec0", fontSize: "13px" }}>
                        <MapPin size={14} color="#e94560" /> {doc.clinic?.city || "N/A"}, {doc.clinic?.state || ""}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a0aec0", fontSize: "13px" }}>
                        <Clock size={14} color="#3498db" /> {doc.availableDays?.slice(0,3).join(", ")}{doc.availableDays?.length > 3 ? "..." : ""}
                      </div>
                    </div>

                    {selected?._id === doc._id && (
                      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <p style={{ color: "#a0aec0", fontSize: "13px", marginBottom: "8px" }}>{doc.about}</p>
                        <p style={{ color: "#a0aec0", fontSize: "12px" }}>🎓 {doc.qualifications?.join(", ")}</p>
                        <p style={{ color: "#a0aec0", fontSize: "12px" }}>🏥 {doc.clinic?.name}, {doc.clinic?.address}</p>
                        <p style={{ color: "#a0aec0", fontSize: "12px" }}>⏰ Slots: {doc.availableTimeSlots?.join(", ")}</p>
                        {doc.clinic?.lat && doc.clinic?.lng && (
                          <div style={{ marginTop: "12px", borderRadius: "8px", overflow: "hidden", height: "180px" }}>
                            <MapContainer center={[doc.clinic.lat, doc.clinic.lng]} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={[doc.clinic.lat, doc.clinic.lng]}>
                                <Popup>Dr. {doc.name}'s Clinic</Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}