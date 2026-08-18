import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { CreditCard, Coins } from "lucide-react";

export default function Billing() {
  const { token, user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);

  const fetchBills = async () => {
    try {
      const endpoint = user?.role === "patient" ? "/api/billing/me" : "/api/billing";
      const res = await axios.get(`${import.meta.env.VITE_BILLING_URL}${endpoint}`,
        { headers: { authorization: `Bearer ${token}` } });
      setBills(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchWallet = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BILLING_URL}/api/billing/wallet`,
        { headers: { authorization: `Bearer ${token}` } });
      setWallet(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchBills();
    if (user?.role === "patient") fetchWallet();
  }, []);

  const handlePayNow = async (bill) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BILLING_URL}/api/billing/${bill._id}`,
        { paidAmount: bill.totalAmount, paymentMethod: "online" },
        { headers: { authorization: `Bearer ${token}` } }
      );
      fetchBills();
    } catch (err) {
      alert("Payment failed. Please try again.");
    }
  };

  const statusColor = { paid: "#48c78e", pending: "#f39c12", partial: "#3498db" };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "240px", flex: 1, background: "#0d1117", minHeight: "100vh", padding: "32px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Billing</h1>
        <p style={{ color: "#a0aec0", marginBottom: "32px" }}>Your billing and payment history</p>

        {user?.role === "patient" && wallet && (
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            background: "linear-gradient(135deg, rgba(243,156,18,0.15), rgba(233,69,96,0.1))",
            border: "1px solid rgba(243,156,18,0.3)", borderRadius: "16px",
            padding: "20px 24px", marginBottom: "24px", width: "fit-content"
          }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(243,156,18,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coins size={24} color="#f39c12" />
            </div>
            <div>
              <div style={{ color: "#a0aec0", fontSize: "12px" }}>Wallet Balance</div>
              <div style={{ color: "#f39c12", fontSize: "22px", fontWeight: "700" }}>{wallet.coins} coins</div>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: "#a0aec0" }}>Loading...</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {bills.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#a0aec0" }}>
                <CreditCard size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>No bills found</p>
              </div>
            ) : bills.map((bill) => (
              <div key={bill._id} style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "12px",
                padding: "20px", border: "1px solid rgba(255,255,255,0.08)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: "#fff", margin: "0 0 6px 0", fontSize: "16px" }}>
                      {bill.patientName}
                    </h3>
                    <p style={{ color: "#a0aec0", margin: "0 0 4px 0", fontSize: "13px" }}>
                      Total: ₹{bill.totalAmount} • Paid: ₹{bill.paidAmount} • Remaining: ₹{bill.totalAmount - bill.paidAmount}
                    </p>
                    <p style={{ color: "#a0aec0", margin: "0 0 4px 0", fontSize: "13px" }}>
                      Due: {new Date(bill.dueDate).toLocaleDateString()} • Method: {bill.paymentMethod}
                    </p>
                    {bill.services?.length > 0 && (
                      <p style={{ color: "#a0aec0", margin: "4px 0 0 0", fontSize: "12px" }}>
                        Services: {bill.services.map(s => `${s.name} (₹${s.cost})`).join(", ")}
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", marginLeft: "16px" }}>
                    <span style={{
                      padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
                      fontWeight: "600", background: `${statusColor[bill.status]}22`,
                      color: statusColor[bill.status]
                    }}>
                      {bill.status}
                    </span>

                    {bill.status !== "paid" && (
                      <button onClick={() => handlePayNow(bill)}
                        style={{
                          padding: "10px 18px",
                          background: "linear-gradient(135deg, #48c78e, #27ae60)",
                          border: "none", borderRadius: "8px", color: "#fff",
                          cursor: "pointer", fontWeight: "600", fontSize: "13px",
                          whiteSpace: "nowrap"
                        }}>
                        💳 Pay Now ₹{bill.totalAmount - bill.paidAmount}
                      </button>
                    )}

                    {bill.status === "paid" && (
                      <span style={{ color: "#48c78e", fontSize: "13px", fontWeight: "600" }}>
                        ✅ Payment Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}