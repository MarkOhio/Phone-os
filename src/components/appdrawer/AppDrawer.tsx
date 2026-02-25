
import { useState, useEffect, useRef } from "react";
import "./AppDrawer.css";
import { apps } from "../../data/apps";
import type { AppData } from "../../data/apps";
import { useAppState } from "../../data/state";

export default function AppDrawer() {
  const { openApp } = useAppState();

  const [drawerApps, setDrawerApps] = useState<AppData[]>([]);
  const [tooltipAppId, setTooltipAppId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const uninstalled = JSON.parse(
      localStorage.getItem("uninstalledApps") || "[]"
    ) as string[];

    const filtered = apps
      .filter((a) => !uninstalled.includes(a.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    setDrawerApps(filtered);
  }, []);

  const startLongPress = (appId: string) => {
    longPressTimer.current = setTimeout(() => {
      setTooltipAppId(appId);
    }, 3000);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const uninstallApp = () => {
    if (!tooltipAppId) return;

    const uninstalled = JSON.parse(
      localStorage.getItem("uninstalledApps") || "[]"
    ) as string[];

    if (!uninstalled.includes(tooltipAppId)) {
      uninstalled.push(tooltipAppId);
      localStorage.setItem("uninstalledApps", JSON.stringify(uninstalled));
    }

    setDrawerApps((apps) => apps.filter((a) => a.id !== tooltipAppId));
    setTooltipAppId(null);
  };

  return (
    <div
      className="app-drawer"
      onClick={() => setTooltipAppId(null)}
    >
      {drawerApps.map((app) => (
        <div
          key={app.id}
          className="app-drawer-icon"
          onClick={() => openApp(app.id)}
          onMouseDown={() => startLongPress(app.id)}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={() => startLongPress(app.id)}
          onTouchEnd={cancelLongPress}
        >
          <img src={app.icon} />
          <span>{app.name}</span>
        </div>
      ))}

      {tooltipAppId && (
        <div className="tooltip">
          <button onClick={() => openApp("app_info")}>App Info</button>
          <button onClick={uninstallApp}>Uninstall</button>
        </div>
      )}
    </div>
  );
}