import { useEffect } from "react";
import { useAppState } from "./state";

/**
 * useInternalBackHandler - A generic hook for registering internal back handlers
 * 
 * This hook simplifies back-handler registration for any app, regardless of
 * internal navigation structure.
 * 
 * @param canGoBack - Boolean or function that returns true if app can navigate back
 * @param onBack - Function to call when user presses back (within app)
 * 
 * @example
 * // Simple boolean state
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * useInternalBackHandler(isModalOpen, () => setIsModalOpen(false));
 * 
 * @example
 * // Complex state
 * const [viewStack, setViewStack] = useState(['home']);
 * useInternalBackHandler(
 *   viewStack.length > 1,
 *   () => setViewStack(v => v.slice(0, -1))
 * );
 * 
 * @example
 * // Route-based
 * const location = useLocation();
 * useInternalBackHandler(
 *   location.pathname !== '/',
 *   () => navigate(-1)
 * );
 */
export function useInternalBackHandler(
  canGoBack: boolean | (() => boolean),
  onBack: () => void
): void {
  const { setAppBackHandler } = useAppState();

  useEffect(() => {
    const handler = () => {
      // Resolve canGoBack if it's a function
      const canNavigateBack =
        typeof canGoBack === "function" ? canGoBack() : canGoBack;

      if (canNavigateBack) {
        onBack();
        return true; // App handled the back
      }
      return false; // App cannot handle back, exit
    };

    setAppBackHandler(handler);

    // Cleanup on unmount
    return () => setAppBackHandler(null);
  }, [canGoBack, onBack, setAppBackHandler]);
}

/**
 * useViewStackBackHandler - Specialized hook for view-stack based navigation
 * 
 * Simplifies registration for apps that use a simple view stack pattern.
 * 
 * @param viewStack - Current view stack array
 * @param onPopView - Function to pop the top view from stack
 * 
 * @example
 * const [viewStack, setViewStack] = useState(['home']);
 * useViewStackBackHandler(
 *   viewStack,
 *   () => setViewStack(v => v.slice(0, -1))
 * );
 */
export function useViewStackBackHandler(
  viewStack: string[],
  onPopView: () => void
): void {
  useInternalBackHandler(viewStack.length > 1, onPopView);
}

/**
 * useModalBackHandler - Specialized hook for modal/dialog based navigation
 * 
 * Simplifies registration for apps with stacked modals.
 * 
 * @param modalStack - Array of open modals/dialogs
 * @param onCloseModal - Function to close the topmost modal
 * 
 * @example
 * const [modals, setModals] = useState<Modal[]>([]);
 * useModalBackHandler(
 *   modals,
 *   () => setModals(m => m.slice(0, -1))
 * );
 */
export function useModalBackHandler<T>(
  modalStack: T[],
  onCloseModal: () => void
): void {
  useInternalBackHandler(modalStack.length > 0, onCloseModal);
}

/**
 * useRouteBackHandler - Specialized hook for route-based navigation
 * 
 * Simplifies registration for apps using client-side routing.
 * 
 * @param currentPath - The current route path
 * @param rootPath - The root path (default: '/')
 * @param onNavigateBack - Function to navigate back (e.g., navigate(-1))
 * 
 * @example
 * const location = useLocation();
 * const navigate = useNavigate();
 * useRouteBackHandler(
 *   location.pathname,
 *   '/',
 *   () => navigate(-1)
 * );
 * 
 * @example
 * // Multiple root routes
 * useRouteBackHandler(
 *   location.pathname,
 *   ['/', '/home', '/dashboard'],
 *   () => navigate(-1)
 * );
 */
export function useRouteBackHandler(
  currentPath: string,
  rootPathOrPaths: string | string[],
  onNavigateBack: () => void
): void {
  const rootPaths = Array.isArray(rootPathOrPaths)
    ? rootPathOrPaths
    : [rootPathOrPaths];

  useInternalBackHandler(
    !rootPaths.includes(currentPath),
    onNavigateBack
  );
}
