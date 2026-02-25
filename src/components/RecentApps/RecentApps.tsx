import { useState, useEffect, useRef } from "react";
import "./RecentApps.css";
import type { AppData } from "../../data/apps";

interface RecentAppsProps {
  closeRecentApps: () => void;
}

export default function RecentApps({ closeRecentApps }: RecentAppsProps) {
  const [recentApps, setRecentApps] = useState<AppData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent apps from local storage
  useEffect(() => {
    const stored = localStorage.getItem("recentApps");
    if (stored) setRecentApps(JSON.parse(stored));
  }, []);

  const saveRecentApps = (apps: AppData[]) => {
    localStorage.setItem("recentApps", JSON.stringify(apps));
    setRecentApps(apps);
    if (currentIndex >= apps.length) setCurrentIndex(apps.length - 1);
  };

  const removeApp = (id: string) => {
    const updated = recentApps.filter((app) => app.id !== id);
    saveRecentApps(updated);
  };

  const clearAllApps = () => {
    saveRecentApps([]);
    closeRecentApps();
  };

  const handleDragStart = (x: number) => {
    startXRef.current = x;
    isDraggingRef.current = true;
  };

  const handleDragMove = (x: number) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const deltaX = x - startXRef.current;
    containerRef.current.style.transform = `translateX(${
      -currentIndex * 100 + (-deltaX / window.innerWidth) * 100
    }%)`;
  };

  const handleDragEnd = (x: number) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const deltaX = x - startXRef.current;
    if (deltaX < -50 && currentIndex < recentApps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (deltaX > 50 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (containerRef.current) {
      containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  };

  useEffect(() => {
    if (containerRef.current)
      containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
  }, [currentIndex]);

  return (
    <div className="recent-apps-root">
      <div className="recent-apps-container">
        <div
          className="recent-apps-carousel"
          ref={containerRef}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => {
            if (isDraggingRef.current) e.preventDefault();
            handleDragMove(e.clientX);
          }}
          onMouseUp={(e) => handleDragEnd(e.clientX)}
          onMouseLeave={(e) => {
            if (isDraggingRef.current) handleDragEnd(e.clientX);
          }}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
        >
          {recentApps.map((app) => (
            <div className="recent-app-card" key={app.id}>
              <button className="card-close-btn" onClick={() => removeApp(app.id)}>
                X
              </button>
              <div
                className="card-content"
                style={{ backgroundColor: "#ddd" }}
              >
                <img src={app.icon} alt={app.name} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="clear-all-btn" onClick={clearAllApps}>
        Clear All
      </button>
    </div>
  );
}
