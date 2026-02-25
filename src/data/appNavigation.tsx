import React, { createContext, useContext, useRef, useCallback } from "react";

/**
 * AppNavigationContext allows individual apps to register back handlers.
 * This enables the global back button to respect internal app navigation.
 * 
 * Apps can call `registerBackHandler(fn)` to provide a custom back handler.
 * The handler should return true if it handled the back (internal nav),
 * or false if the app should close.
 */

interface AppNavContextType {
  registerBackHandler: (handler: () => boolean) => () => void;
  getBackHandler: () => (() => boolean) | null;
}

const AppNavContext = createContext<AppNavContextType | null>(null);

export const AppNavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const backHandlerRef = useRef<(() => boolean) | null>(null);

  const registerBackHandler = useCallback(
    (handler: () => boolean) => {
      backHandlerRef.current = handler;
      // Return unregister function
      return () => {
        backHandlerRef.current = null;
      };
    },
    []
  );

  const getBackHandler = useCallback(() => {
    return backHandlerRef.current;
  }, []);

  return (
    <AppNavContext.Provider value={{ registerBackHandler, getBackHandler }}>
      {children}
    </AppNavContext.Provider>
  );
};

/**
 * Hook for apps to register their internal back handler.
 * @param handler Function that handles internal back navigation.
 *                 Return true if back was handled internally, false to exit app.
 */
export const useAppNavigation = () => {
  const ctx = useContext(AppNavContext);
  if (!ctx) {
    throw new Error("useAppNavigation must be used within AppNavigationProvider");
  }
  return ctx;
};
