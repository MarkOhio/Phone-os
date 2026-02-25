import React from "react";
import { useAppState } from "../data/state";
import { useWallpaper } from "../data/wallpaperContext";
import "./PhoneShell.css";

import HomeScreen from "../components/Home/HomeScreen";
import AppDrawer from "../components/appdrawer/AppDrawer";
import NotificationBar from "../components/notificationBar/NotificationBar";
import { appRegistry } from "../apps/appRegistry";
import type { AppData } from "../data/apps";
import { apps } from "../data/apps";

const NavigationBar: React.FC = () => {
  const { goBack, goHome, openDrawer } = useAppState();

  return (
    <div className="navigation-bar">
      <button onClick={goBack}>◀</button>
      <button onClick={goHome}>●</button>
      <button onClick={openDrawer}>▢</button>
    </div>
  );
};

const Viewport: React.FC = () => {
  const { currentView, currentApp, openApp } = useAppState();

  // Helper to dynamically render apps
  const renderApp = (appId: string | null) => {
    if (!appId) return null;

    const appData: AppData | undefined = apps.find(a => a.id === appId);
    if (!appData) {
      return <div className="app-placeholder">App not found</div>;
    }

    // Try to get the component from the registry
    const AppComponent = appRegistry[appId];
    if (AppComponent) {
      return <AppComponent />;
    }

    // Fallback: generic placeholder for apps not yet implemented
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffcc00",
          color: "#000",
          fontSize: "24px",
        }}
      >
        {appData.name} is open
      </div>
    );
  };

  switch (currentView) {
    case "HOME":
      return <HomeScreen openApp={openApp} />;

    case "DRAWER":
      return <AppDrawer />;

    case "APP":
      return renderApp(currentApp);

    default:
      return null;
  }
};

const PhoneShell: React.FC = () => {
  const { selectedWallpaperSrc } = useWallpaper();

  return (
    <div className="phone-shell-wrapper">
      <div className="phone-shell">
        {/* Constant top notification bar */}
        <NotificationBar />

        {/* Dynamic viewport */}
        <div
          className="phone-viewport"
          style={{
            backgroundImage: `url(${selectedWallpaperSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <Viewport />
        </div>

        {/* Constant bottom navigation bar */}
        <NavigationBar />
      </div>
    </div>
  );
};

export default PhoneShell;