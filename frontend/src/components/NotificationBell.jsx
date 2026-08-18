import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Bell } from "lucide-react";

const EVENT_LABELS = {
  appointment_booked: "New appointment booked",
  appointment_updated: "An appointment was updated",
  doctor_approved: "A doctor profile was approved",
  doctor_rejected: "A doctor profile was rejected",
};

const WATCHED_EVENTS = Object.keys(EVENT_LABELS);
const MAX_NOTIFICATIONS = 20;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const url = import.meta.env.VITE_NOTIFICATION_URL;
    if (!url) return;

    const socket = io(url);
    socketRef.current = socket;

    const handleEvent = (eventType) => (payload) => {
      setNotifications(prev => [
        { id: `${Date.now()}-${Math.random()}`, eventType, payload, time: new Date() },
        ...prev
      ].slice(0, MAX_NOTIFICATIONS));
      setUnread(prev => prev + 1);
    };

    const listeners = WATCHED_EVENTS.map(eventType => {
      const handler = handleEvent(eventType);
      socket.on(eventType, handler);
      return { eventType, handler };
    });

    return () => {
      listeners.forEach(({ eventType, handler }) => socket.off(eventType, handler));
      socket.disconnect();
    };
  }, []);

  const toggleOpen = () => {
    setOpen(o => !o);
    if (!open) setUnread(0);
  };

  return (
    <div style={{ position: "relative" }}>
      <div onClick={toggleOpen}
        style={{ position: "relative", cursor: "pointer", color: "#a0aec0", display: "flex", alignItems: "center" }}>
        <Bell size={20} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: "-6px", right: "-6px",
            background: "#e94560", color: "#fff", fontSize: "10px", fontWeight: "700",
            borderRadius: "10px", padding: "1px 5px", minWidth: "16px", textAlign: "center"
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "28px", right: 0, width: "280px", maxHeight: "320px",
          overflowY: "auto", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 200
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "13px", fontWeight: "600" }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: "16px", color: "#a0aec0", fontSize: "13px" }}>No notifications yet</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "#e2e8f0", fontSize: "13px" }}>{EVENT_LABELS[n.eventType] || n.eventType}</div>
                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>{n.time.toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
