import React from "react";
import MusicApp from "./music-app/MusicApp";
import ExampleModalApp from "./example-modal/ExampleModalApp";
import WallpaperApp from "./wallpaper/WallpaperApp";

/**
 * Central registry mapping app IDs to their React components.
 * Add new apps here to enable dynamic rendering in PhoneShell.
 * 
 * Each app can implement internal navigation in different ways:
 * - View stacks (like MusicApp)
 * - Modal/dialog overlays (like ExampleModalApp)
 * - React Router routes
 * - Any custom navigation structure
 * 
 * See src/data/BACK_HANDLER_GUIDE.ts for implementation patterns.
 */
export const appRegistry: Record<string, React.ComponentType> = {
  music: MusicApp,
  "example-modal": ExampleModalApp,
  wallpaper: WallpaperApp,
  // Add more apps here:
  // whatsapp: WhatsApp,
  // settings: Settings,
  // etc.
};

/**
 * Get the component for an app by ID, or return a placeholder.
 */
export const getAppComponent = (appId: string | null) => {
  if (!appId) return null;
  return appRegistry[appId] || null;
};
