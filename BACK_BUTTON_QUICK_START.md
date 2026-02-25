# Back Button System - Quick Start Reference

## TL;DR - For Developers

You have **ONE JOB**: Tell the back button how to handle back in your app.

### The Simplest Way (Copy & Paste)

```tsx
import { useViewStackBackHandler } from '../../data/useInternalBackHandler';

function MyApp() {
  const [viewStack, setViewStack] = useState(['home']);
  
  // Just add this one line:
  useViewStackBackHandler(viewStack, () => setViewStack(v => v.slice(0, -1)));
  
  // That's it! Back button now works perfectly.
  return <div>{/* your app */}</div>;
}
```

---

## Choose Your Hook Based on Your App Type

### If your app uses a **view stack** array:
```tsx
import { useViewStackBackHandler } from '../../data/useInternalBackHandler';

useViewStackBackHandler(viewStack, onPopView);
```

### If your app uses **modal overlays**:
```tsx
import { useModalBackHandler } from '../../data/useInternalBackHandler';

useModalBackHandler(modalStack, onCloseModal);
```

### If your app uses **React Router**:
```tsx
import { useRouteBackHandler } from '../../data/useInternalBackHandler';

useRouteBackHandler(location.pathname, '/', () => navigate(-1));
```

### If your app has **custom navigation logic**:
```tsx
import { useInternalBackHandler } from '../../data/useInternalBackHandler';

useInternalBackHandler(
  canGoBack,  // boolean or function
  onBack      // function to call
);
```

---

## What Happens When User Presses Back?

1. **Is your app at the root/first view?** → App closes, return to home
2. **Does your app have internal views?** → Pop the view, stay in app

---

## Real Examples

### Example 1: MusicApp (View Stack)
```tsx
function MusicApp() {
  const { viewStack, popView } = useMusicApp(songs);
  useViewStackBackHandler(viewStack, popView);
  
  return <div>{viewStack[viewStack.length - 1] === 'library' ? ... : ...}</div>;
}
```

### Example 2: ModalApp
```tsx
function ExampleModalApp() {
  const [modalStack, setModalStack] = useState([]);
  
  useModalBackHandler(
    modalStack, 
    () => setModalStack(prev => prev.slice(0, -1))
  );
  
  return <div>{/* modals render here */}</div>;
}
```

### Example 3: Routes (React Router)
```tsx
function MyApp() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useRouteBackHandler(location.pathname, '/', () => navigate(-1));
  
  return <Routes>{/* routes here */}</Routes>;
}
```

---

## That's Literally It

- **No boilerplate**: One line of code per app
- **No config**: Works automatically
- **Flexible**: Works with any navigation pattern
- **Safe**: Auto-cleanup when app unmounts

Just pick your hook and add one line. Back button works. Done. 🎉

---

## If Something Breaks

**Most Common Issue:** Returning `true` when at root view.

**Fix:** Make sure your `canGoBack` check actually returns false at root.

```tsx
// Wrong: always true
useViewStackBackHandler(true, popView);

// Right: only true if not at root
useViewStackBackHandler(viewStack.length > 1, popView);
```

---

## Need More Info?

- **See examples:** Check `src/apps/music-app/` and `src/apps/example-modal/`
- **Read detailed guide:** See `src/data/BACK_HANDLER_GUIDE.ts`
- **Full documentation:** See `BACK_BUTTON_SYSTEM.md`
- **See implementation:** Check `src/data/state.tsx` and `src/data/useInternalBackHandler.ts`

---

## The Golden Rule

> **If you have internal navigation, register a handler. That's it.**

Apps handle their own back logic. The system is flexible enough for any architecture.
