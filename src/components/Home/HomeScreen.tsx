import "./HomeScreen.css";
import { useRef, useState, useEffect } from "react";
import type { AppData } from "../../data/apps";
import { apps } from "../../data/apps";
import RecentApps from "../RecentApps/RecentApps";
import { useAppState } from "../../data/state"; // Integrates with PhoneShell routing

interface HomeProps {
  openApp?: (appId: string) => void; // optional because PhoneShell handles routing
}

const LONG_PRESS_DURATION = 600; // Reduced from 3000ms for better UX
const FIRST_PAGE_APP_COUNT = 10;
const OTHER_PAGE_APP_COUNT = 20;
const DOCK_COUNT = 5;

function paginateApps(data: AppData[]) {
  const pages: AppData[][] = [];
  pages.push(data.slice(0, FIRST_PAGE_APP_COUNT));
  for (let i = FIRST_PAGE_APP_COUNT; i < data.length; i += OTHER_PAGE_APP_COUNT) {
    pages.push(data.slice(i, i + OTHER_PAGE_APP_COUNT));
  }
  return pages;
}

export default function HomeScreen({ openApp }: HomeProps) {
  const { openApp: routeApp, openDrawer } = useAppState(); // Use AppState for routing

  const openAppHandler = (id: string) => {
    if (openApp) openApp(id);
    else routeApp(id);
  };

  /* ---------- PERSISTENCE ---------- */
  const [removedApps, setRemovedApps] = useState<string[]>(() => {
    const raw = localStorage.getItem("removedHomeApps");
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem("removedHomeApps", JSON.stringify(removedApps));
  }, [removedApps]);

  /* ---------- VIEW STATE ---------- */
  const [currentPage, setCurrentPage] = useState(0);
  const [showRecents, setShowRecents] = useState(false);

  /* ---------- TOOLTIP ---------- */
  const [tooltipApp, setTooltipApp] = useState<AppData | null>(null);
  const longPressTimer = useRef<number | null>(null);

  /* ---------- REFS ---------- */
  const pagesRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragging = useRef<"NONE" | "HORIZONTAL" | "VERTICAL">("NONE");

  /* ---------- APP FILTERING ---------- */
  const visibleApps = apps.filter(a => !removedApps.includes(a.id));
  const dockApps = visibleApps.slice(-DOCK_COUNT);
  const pageAppsSource = visibleApps.slice(0, visibleApps.length - DOCK_COUNT);
  const pages = paginateApps(pageAppsSource);

  /* ---------- LONG PRESS ---------- */
  const startLongPress = (app: AppData) => {
    longPressTimer.current = window.setTimeout(() => {
      setTooltipApp(app);
    }, LONG_PRESS_DURATION);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Close tooltip on any touch end
    setTooltipApp(null);
  };

  /* ---------- SWIPE ---------- */
  const onTouchStart = (x: number, y: number) => {
    dragStartX.current = x;
    dragStartY.current = y;
    dragging.current = "NONE";
  };

  const onTouchMove = (x: number, y: number) => {
    const dx = x - dragStartX.current;
    const dy = y - dragStartY.current;

    if (dragging.current === "NONE") {
      if (Math.abs(dx) > 15) dragging.current = "HORIZONTAL";
      else if (Math.abs(dy) > 15) dragging.current = "VERTICAL";
    }

    if (dragging.current === "HORIZONTAL" && pagesRef.current) {
      pagesRef.current.style.transform =
        `translateX(${(-currentPage * 100) + (-dx / window.innerWidth) * 100}%)`;
    }
  };

  const onTouchEnd = (x: number, y: number) => {
    const dx = x - dragStartX.current;
    const dy = y - dragStartY.current;

    if (dragging.current === "HORIZONTAL") {
      if (dx < -50 && currentPage < pages.length - 1) setCurrentPage(p => p + 1);
      else if (dx > 50 && currentPage > 0) setCurrentPage(p => p - 1);
    }

    if (dragging.current === "VERTICAL") {
      if (-dy > 60) openDrawer();
    }

    dragging.current = "NONE";
  };

  useEffect(() => {
    if (pagesRef.current) {
      pagesRef.current.style.transform = `translateX(-${currentPage * 100}%)`;
    }
  }, [currentPage]);

  /* ---------- REMOVE APP ---------- */
  const removeFromHome = (appId: string) => {
    setRemovedApps(prev => [...prev, appId]);
    setTooltipApp(null);
  };

  return (
    <div className="home-root">
      <div
        className="home-body"
        onTouchStart={e =>
          onTouchStart(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={e =>
          onTouchMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={e =>
          onTouchEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
        }
      >
        <div className="home-pages" ref={pagesRef}>
          {pages.map((page, index) => (
            <div className="home-page" key={index}>
              {index === 0 ? (
                <>
                  <div className="section widget-full" />

                  <div className="section grid-4">
                    <div className="widget span-2" />
                    {page.slice(0, 2).map(app => (
                      <button
                        key={app.id}
                        className="app-slot"
                        onClick={() => openAppHandler(app.id)}
                        onTouchStart={() => startLongPress(app)}
                        onTouchEnd={cancelLongPress}
                        aria-label={app.name}
                      >
                        <img src={app.icon} alt={app.name} />
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="section grid-4">
                    {page.slice(2, 6).map(app => (
                      <button
                        key={app.id}
                        className="app-slot"
                        onClick={() => openAppHandler(app.id)}
                        onTouchStart={() => startLongPress(app)}
                        onTouchEnd={cancelLongPress}
                        aria-label={app.name}
                      >
                        <img src={app.icon} alt={app.name} />
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="section grid-4">
                    {page.slice(6, 10).map(app => (
                      <button
                        key={app.id}
                        className="app-slot"
                        onClick={() => openAppHandler(app.id)}
                        onTouchStart={() => startLongPress(app)}
                        onTouchEnd={cancelLongPress}
                        aria-label={app.name}
                      >
                        <img src={app.icon} alt={app.name} />
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="section widget-full" />
                </>
              ) : (
                <div className="section grid-4 full-page">
                  {page.map(app => (
                    <button
                      key={app.id}
                      className="app-slot"
                      onClick={() => openAppHandler(app.id)}
                      onTouchStart={() => startLongPress(app)}
                      onTouchEnd={cancelLongPress}
                      aria-label={app.name}
                    >
                      <img src={app.icon} alt={app.name} />
                      <span>{app.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dock */}
      <div className="dock">
        {dockApps.map(app => (
          <button
            key={app.id}
            className="dock-app"
            onClick={() => openAppHandler(app.id)}
            aria-label={app.name}
          >
            <img src={app.icon} alt={app.name} />
          </button>
        ))}
      </div>

      {/* Tooltip */}
      {tooltipApp && (
        <div className="app-tooltip">
          <button onClick={() => removeFromHome(tooltipApp.id)}>
            Remove from Home
          </button>
          <button onClick={() => openAppHandler("app-info")}>
            App Info
          </button>
        </div>
      )}

      {/* Recents modal (independent of drawer) */}
      {showRecents && (
        <RecentApps closeRecentApps={() => setShowRecents(false)} />
      )}
    </div>
  );
}