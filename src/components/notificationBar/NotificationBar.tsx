import { useEffect, useRef, useState } from "react";
import "./NotificationBar.css";
import {
  startNotificationScheduler,
  seedDemoNotifications,
  getActiveNotifications,
  getCollapsedIcons,
  hasOverflowIcons,
  clearAllNotifications,
  dismissNotification,
} from "../../data/notifications";

/* ---------------- types ---------------- */

type PanelState = "collapsed" | "notifications" | "actions";

type ActionToggle = {
  id: string;
  label: string;
};

/* ---------------- component ---------------- */

export default function NotificationBar() {
  const [panel, setPanel] = useState<PanelState>("collapsed");
  const [now, setNow] = useState<Date>(new Date());
  const [battery, setBattery] = useState<number>(100);
  const [notifications, setNotifications] = useState(
    getActiveNotifications()
  );

  const startY = useRef<number | null>(null);

  /* ---------------- lifecycle ---------------- */

  useEffect(() => {
    seedDemoNotifications();
    startNotificationScheduler();
  }, []);

  useEffect(() => {
    const clock = setInterval(() => {
      setNow(new Date());
      setNotifications(getActiveNotifications());
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const drain = setInterval(() => {
      setBattery((b) => (b > 10 ? b - 1 : 10));
    }, 300000);

    return () => clearInterval(drain);
  }, []);

  /* ---------------- gestures ---------------- */

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return;

    const delta = e.changedTouches[0].clientY - startY.current;

    if (delta > 50) {
      if (panel === "collapsed") setPanel("notifications");
      else if (panel === "notifications") setPanel("actions");
    }

    if (delta < -50) {
      if (panel === "actions") setPanel("notifications");
      else if (panel === "notifications") setPanel("collapsed");
    }

    startY.current = null;
  };

  /* ---------------- actions ---------------- */

  const onNotificationClick = (id: string) => {
    dismissNotification(id);
    setNotifications(getActiveNotifications());
    // app routing can be handled using appId elsewhere
  };

  /* ---------------- render ---------------- */

  return (
    <div
      className={`notification-bar ${panel}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
{/* -------- collapsed header -------- */}
{panel === "collapsed" && (
  <div className="nb-collapsed">
    <div className="nb-left">
      <span className="time">
        {now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>

      <div className="nb-icons">
        {getCollapsedIcons().map((iconKey, idx) => (
          <img
            key={idx}
            src={`/icons/${iconKey}.png`} // full path to public/icons folder
            alt={iconKey}
            className="notif-icon"
            onError={(e) => {
              // fallback in case image is missing
              (e.target as HTMLImageElement).src = "/icons/logo.png";
            }}
          />
        ))}
        {hasOverflowIcons() && <span className="dot">•</span>}
      </div>
    </div>

    <div className="nb-right">
      <span>{battery}%</span>
      <span className="signal" />
      <span className="wifi" />
    </div>
  </div>
)}
      {/* -------- notifications panel -------- */}
      {panel === "notifications" && (
        <div className="nb-notifications">
          <header>
            <div>
              {now.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div>
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </header>

          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="notif-item"
                onClick={() => onNotificationClick(n.id)}
              >
                <img src={`/icons/${n.iconKey}.png`} alt="" />
                <div>
                  <div className="title">{n.title}</div>
                  <div className="subtitle">{n.subtitle}</div>
                </div>
                <span className="time">
                  {Math.max(
                    1,
                    Math.floor((Date.now() - n.timestamp) / 60000)
                  )}
                  m
                </span>
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={() => {
                clearAllNotifications();
                setNotifications([]);
              }}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* -------- action panel -------- */}
      {panel === "actions" && (
        <div className="nb-actions">
          <header>
            <span>
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              {now.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </header>

          <div className="actions-grid">
            {ACTION_TOGGLES.map((a) => (
              <ActionToggleButton key={a.id} toggle={a} />
            ))}
          </div>

          <div className="fake-slider">
            <div className="track" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- action toggles ---------------- */

const ACTION_TOGGLES: ActionToggle[] = [
  { id: "wifi", label: "Wi-Fi" },
  { id: "data", label: "Data" },
  { id: "bt", label: "Bluetooth" },
  { id: "torch", label: "Torch" },
];

function ActionToggleButton({ toggle }: { toggle: ActionToggle }) {
  const [active, setActive] = useState<boolean>(() => {
    return localStorage.getItem(`action:${toggle.id}`) === "1";
  });

  const toggleState = () => {
    const next = !active;
    setActive(next);
    localStorage.setItem(`action:${toggle.id}`, next ? "1" : "0");
  };

  return (
    <button
      className={`action ${active ? "active" : ""}`}
      onClick={toggleState}
    >
      {toggle.label}
    </button>
  );
}