/**
 * This module is DEPRECATED. Use the `useAppState()` hook from src/data/state.tsx instead.
 * 
 * Example:
 * ```
 * import { useAppState } from "../../data/state";
 * 
 * function MyComponent() {
 *   const { goHome, goBack, openApp, currentView } = useAppState();
 *   // Use the methods directly
 * }
 * ```
 * 
 * This file is kept for reference only. All new code should use the hook.
 */

// Re-export commonly used functions from state.tsx for minimal backward compatibility
export { useAppState } from "../../data/state";
