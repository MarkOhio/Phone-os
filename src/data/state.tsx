import React, { createContext, useContext, useState, useRef } from "react";

export type ViewType = "HOME" | "DRAWER" | "APP";

/**
 * Back handler function signature.
 * Apps register this handler to control back-button behavior.
 * 
 * @returns true if the app handled the back (internal navigation)
 *          false if the app should close (exit to previous view)
 * 
 * @example
 * // View stack based app
 * const handler = () => {
 *   if (viewStack.length > 1) {
 *     popView();
 *     return true;  // Handled internally
 *   }
 *   return false;   // Exit app
 * };
 */
type AppBackHandler = () => boolean;

interface NavState {
  currentView: ViewType;
  stack: ViewType[];
  openDrawer: () => void;
  closeDrawer: () => void;
  goHome: () => void;
  /**
   * Global back button handler.
   * Checks if current app can handle back internally before exiting.
   * See src/data/BACK_HANDLER_GUIDE.ts for implementation patterns.
   */
  goBack: () => void;
  openApp: (appId: string) => void;
  currentApp: string | null;
  /**
   * Register/unregister a back handler for the current app.
   * Apps call this to provide custom back-button behavior.
   * 
   * @example
   * const { setAppBackHandler } = useAppState();
   * useEffect(() => {
   *   setAppBackHandler(() => {
   *     if (canGoBack()) {
   *       handleBack();
   *       return true;
   *     }
   *     return false;
   *   });
   *   return () => setAppBackHandler(null);
   * }, [canGoBack, handleBack]);
   */
  setAppBackHandler: (handler: AppBackHandler | null) => void;
}

const AppStateContext = createContext<NavState | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stack, setStack] = useState<ViewType[]>(["HOME"]);
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const appBackHandlerRef = useRef<(() => boolean) | null>(null);

  const currentView = stack[stack.length - 1];

  const openDrawer = () => {
    setStack((s) => [...s, "DRAWER"]);
  };

  const closeDrawer = () => {
    setStack((s) => s.filter((v) => v !== "DRAWER"));
  };

  const openApp = (appId: string) => {
    setCurrentApp(appId);
    setStack((s) => [...s, "APP"]);
  };

  const goHome = () => {
    setCurrentApp(null);
    setStack(["HOME"]);
  };

  const goBack = () => {
    // If we're in an app, try to let the app handle back first
    if (currentView === "APP" && appBackHandlerRef.current) {
      const handled = appBackHandlerRef.current();
      if (handled) {
        // App handled internal back navigation
        return;
      }
    }

    // Otherwise, proceed with system navigation back
    setStack((s) => {
      const newStack = s.length > 1 ? s.slice(0, -1) : s;
      // Clear currentApp if we're leaving an APP view
      if (s[s.length - 1] === "APP") {
        setCurrentApp(null);
        appBackHandlerRef.current = null;
      }
      return newStack;
    });
  };

  const setAppBackHandler = (handler: (() => boolean) | null) => {
    appBackHandlerRef.current = handler;
  };

  return (
    <AppStateContext.Provider
      value={{
        currentView,
        stack,
        openDrawer,
        closeDrawer,
        openApp,
        goHome,
        goBack,
        currentApp,
        setAppBackHandler,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
};
