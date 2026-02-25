/**
 * GLOBAL BACK BUTTON SYSTEM - IMPLEMENTATION GUIDE
 * 
 * This file explains how the back-button system works and how to implement it
 * for different app navigation architectures.
 * 
 * ==========================================
 * QUICK ANSWER TO YOUR QUESTIONS:
 * ==========================================
 * 
 * 1. Will the same logic automatically work for other stack-based apps?
 *    ✅ YES - Any app using a simple view stack will work with minimal changes.
 *       Just register a handler that checks if stack.length > 1.
 * 
 * 2. Will it work with multi-page/route-based apps?
 *    ✅ YES - But the handler logic must match your internal navigation structure.
 *       See examples below for route-based apps.
 * 
 * 3. Do I need to design every app the same way?
 *    ✅ NO - The system is completely generic. Apps can use:
 *       - View stacks (like MusicApp)
 *       - React Router routes
 *       - Local state booleans for modal toggles
 *       - Context-based navigation
 *       - Any custom structure
 * 
 * ==========================================
 * HOW IT WORKS:
 * ==========================================
 * 
 * 1. Global back button calls useAppState().goBack()
 * 2. goBack() checks: Is there a back handler registered? (from current app)
 * 3. If YES → calls handler(); if it returns true, back was handled internally
 * 4. If NO or handler returns false → app closes and returns to home
 * 
 * The beauty: Apps define their OWN back handler logic based on their structure.
 * 
 * ==========================================
 * IMPLEMENTATION PATTERNS:
 * ==========================================
 * 
 * PATTERN 1: VIEW STACK (like MusicApp)
 * Single component with multiple views in a stack
 * Example: Library view → Player view → Lyrics view
 * 
 * const { viewStack, popView } = useInternalNavigation();
 * useViewStackBackHandler(viewStack, popView);
 * 
 * 
 * PATTERN 2: REACT ROUTER / ROUTE-BASED
 * Multiple page components with routes
 * 
 * const location = useLocation();
 * const navigate = useNavigate();
 * useRouteBackHandler(location.pathname, '/', () => navigate(-1));
 * 
 * 
 * PATTERN 3: MODAL/DIALOG STACK
 * Base view with overlaid modals
 * 
 * const [modalStack, setModalStack] = useState([]);
 * useModalBackHandler(modalStack, () => setModalStack(prev => prev.slice(0, -1)));
 * 
 * 
 * PATTERN 4: MULTI-TAB / SECTION-BASED
 * Multiple tabs with independent history in each
 * 
 * Use useInternalBackHandler with custom logic that tracks per-tab history
 * 
 * 
 * PATTERN 5: CONTEXT-BASED NAVIGATION
 * Navigation state in a custom context
 * 
 * const { canGoBack, goBack } = useMyAppNavigation();
 * useInternalBackHandler(canGoBack, goBack);
 * 
 * ==========================================
 * KEY TAKEAWAYS:
 * ==========================================
 * 
 * 1. The system is app-agnostic - apps control their own back logic
 * 2. No specific app structure is required
 * 3. Apps register a handler that returns true/false
 * 4. The handler defines what "back" means for that specific app
 * 5. Multiple apps can coexist with different navigation patterns
 * 6. The back button remains global and works for all architectures
 * 
 * ==========================================
 * HOW TO USE THE HELPER HOOKS:
 * ==========================================
 * 
 * Import from src/data/useInternalBackHandler.ts:
 * 
 * - useInternalBackHandler(canGoBack, onBack)
 *   Generic hook for any navigation pattern
 * 
 * - useViewStackBackHandler(viewStack, onPopView)
 *   For view-stack based apps like MusicApp
 * 
 * - useModalBackHandler(modalStack, onCloseModal)
 *   For modal/dialog overlay apps
 * 
 * - useRouteBackHandler(currentPath, rootPath, onNavigateBack)
 *   For React Router based apps
 * 
 * See src/apps/example-modal/ExampleModalApp.tsx for a working example
 * of how to implement the back handler in a modal-based app.
 */

export const BACK_HANDLER_GUIDE = "See JSDoc comments above for implementation patterns";

