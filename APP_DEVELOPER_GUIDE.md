# Phone OS - App Developer Guide

Complete instructions for creating a new app that integrates fully with the Phone OS system.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Step-by-Step App Creation](#step-by-step-app-creation)
3. [Back Button Integration](#back-button-integration)
4. [Home Screen & App Drawer Integration](#home-screen--app-drawer-integration)
5. [Navigation Patterns](#navigation-patterns)
6. [Code Examples](#code-examples)
7. [Testing Checklist](#testing-checklist)
8. [Common Issues & Fixes](#common-issues--fixes)
9. [File Structure Template](#file-structure-template)

---

## Project Structure

The Phone OS uses a modular app architecture. Each app is a self-contained component with its own styling and logic.

```
src/
├── apps/
│   ├── music-app/
│   │   ├── MusicApp.tsx           # Main app component
│   │   ├── MusicApp.css           # App styling
│   │   ├── useMusicApp.ts         # Custom hooks (optional)
│   │   └── songs.ts               # App data (optional)
│   └── [your-new-app]/
│       ├── YourNewApp.tsx         # Main component (REQUIRED)
│       └── YourNewApp.css         # Styling (REQUIRED)
├── data/
│   ├── apps.ts                    # App registry data
│   ├── state.tsx                  # Global app state & navigation
│   └── useInternalBackHandler.ts  # Back button hooks
└── components/
    └── [other components]
```

---

## Step-by-Step App Creation

### Step 1: Create the App Folder & Files

Create a new folder under `src/apps/` with your app name (use kebab-case):

```bash
mkdir -p src/apps/my-awesome-app
touch src/apps/my-awesome-app/MyAwesomeApp.tsx
touch src/apps/my-awesome-app/MyAwesomeApp.css
```

**File naming convention:**
- Component: `YourAppNameApp.tsx` (PascalCase, end with "App")
- Styles: `YourAppNameApp.css` (same name, different extension)
- Data/hooks: `useYourAppName.ts` or `yourAppData.ts` (optional, only if complex)

---

### Step 2: Create the Main App Component

Create `src/apps/my-awesome-app/MyAwesomeApp.tsx`:

```tsx
import { useState } from "react";
import { useViewStackBackHandler } from "../../data/useInternalBackHandler";
import "./MyAwesomeApp.css";

/**
 * MyAwesomeApp - [Brief description of what your app does]
 * 
 * Internal navigation: Uses view stack pattern
 * Views: home, details, settings (or whatever applies)
 */
export default function MyAwesomeApp() {
  // 1. Initialize your app state
  const [viewStack, setViewStack] = useState(["home"]);

  // 2. Create helper functions for navigation
  const pushView = (view: string) => {
    setViewStack((prev) => [...prev, view]);
  };

  const popView = () => {
    setViewStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // 3. Register back button handler (ONE LINE - REQUIRED)
  useViewStackBackHandler(viewStack, popView);

  // 4. Get current view
  const currentView = viewStack[viewStack.length - 1];

  // 5. Render your app
  return (
    <div className="my-awesome-app">
      {currentView === "home" && (
        <div className="view-home">
          <h1>My Awesome App</h1>
          <p>Welcome to my app!</p>
          <button onClick={() => pushView("details")}>
            Go to Details
          </button>
        </div>
      )}

      {currentView === "details" && (
        <div className="view-details">
          <h1>Details View</h1>
          <p>You pressed a button!</p>
          <button onClick={popView}>Back to Home</button>
        </div>
      )}
    </div>
  );
}
```

**IMPORTANT REQUIREMENTS:**
- ✅ Default export your component
- ✅ Name your component `[AppName]App` (must end with "App")
- ✅ Use `useViewStackBackHandler` OR one of the other back button hooks
- ✅ Component must return a root div with `className="my-awesome-app"`
- ✅ Must handle at least a "home" view (the root/initial view)

---

### Step 3: Style Your App

Create `src/apps/my-awesome-app/MyAwesomeApp.css`:

```css
.my-awesome-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

/* View containers */
.view-home,
.view-details {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Typography */
.my-awesome-app h1 {
  margin: 0;
  font-size: 24px;
}

.my-awesome-app p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

/* Buttons */
.my-awesome-app button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
}

.my-awesome-app button:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}
```

**Styling guidelines:**
- Use full width/height for root container
- Full viewport fills the phone screen
- Use `flex` for responsive layouts
- Include active/hover states for buttons
- Follow the visual style of other apps (gradients, rounded corners, spacing)

---

### Step 4: Register Your App in the Data

Edit `src/data/apps.ts` and add your app to the array:

```ts
export const apps: AppData[] = [
  { id: "music", name: "Music Player", icon: "whatsapp.png", link: "music" },
  { id: "example-modal", name: "Modal App", icon: "logo.png", link: "example-modal" },
  // ADD THIS LINE (adjust id, name, icon):
  { id: "my-awesome-app", name: "Awesome App", icon: "logo.png", link: "my-awesome-app" },
  // ... rest of apps
];
```

**Requirements:**
- `id`: Must match your folder name (kebab-case)
- `name`: Display name shown on home screen & app drawer
- `icon`: Icon filename from `public/icons/` (without path)
- `link`: Same as `id`

---

### Step 5: Register Your App Component

Edit `src/apps/appRegistry.ts` and add your app to the registry:

```ts
import MyAwesomeApp from "./my-awesome-app/MyAwesomeApp";

export const appRegistry: Record<string, React.ComponentType> = {
  music: MusicApp,
  "example-modal": ExampleModalApp,
  "my-awesome-app": MyAwesomeApp,  // ← ADD THIS LINE
};
```

**Requirements:**
- Import your app component
- Add to `appRegistry` with the same `id` as in `apps.ts`
- App ID becomes the object key in the registry

---

### Step 6: Verify TypeScript (Optional)

Ensure your app has proper TypeScript types:

```tsx
// Good practices:
const [count, setCount] = useState<number>(0);  // ← Type generic
const handleClick = (): void => {               // ← Type return value
  setCount((prev) => prev + 1);
};

// For complex state, create types:
interface AppState {
  viewStack: string[];
  selectedItem: Item | null;
}
```

---

## Back Button Integration

The back button works automatically if you follow the pattern. Choose the right hook for your navigation style.

### Option 1: View Stack (Recommended for Single-Component Apps)

**Use this if:** Your app has multiple views in a single component.

```tsx
import { useViewStackBackHandler } from "../../data/useInternalBackHandler";

export default function MyApp() {
  const [viewStack, setViewStack] = useState(["home"]);
  
  useViewStackBackHandler(viewStack, () => setViewStack(v => v.slice(0, -1)));
  
  // Back button now works!
  return <div>{/* views */}</div>;
}
```

### Option 2: Modal Stack

**Use this if:** Your app has a base view with modal overlays.

```tsx
import { useModalBackHandler } from "../../data/useInternalBackHandler";

export default function MyApp() {
  const [modals, setModals] = useState([]);
  
  useModalBackHandler(modals, () => setModals(m => m.slice(0, -1)));
  
  // Back closes modals before exiting app
  return <div>{/* base view + modals */}</div>;
}
```

### Option 3: React Router Routes

**Use this if:** Your app uses React Router for internal navigation.

```tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteBackHandler } from "../../data/useInternalBackHandler";

export default function MyApp() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useRouteBackHandler(location.pathname, "/", () => navigate(-1));
  
  return <Routes>{/* routes */}</Routes>;
}
```

### Option 4: Custom Logic

**Use this if:** Your app has custom navigation logic.

```tsx
import { useInternalBackHandler } from "../../data/useInternalBackHandler";

export default function MyApp() {
  const [currentView, setCurrentView] = useState("home");
  
  useInternalBackHandler(
    currentView !== "home",  // Can go back?
    () => setCurrentView("home")  // How to go back?
  );
  
  return <div>{/* content */}</div>;
}
```

**CRITICAL:** Always register a back handler in your app. Without it, pressing back will immediately exit your app.

---

## Home Screen & App Drawer Integration

Once you register your app in `apps.ts` and `appRegistry.ts`, it **automatically appears** on the home screen and app drawer. No additional work needed!

### What Happens Automatically:

1. ✅ App icon appears on home screen (last 5 apps are in dock)
2. ✅ App appears in app drawer (swipe up from home screen)
3. ✅ App can be removed from home screen (long press)
4. ✅ Clicking the icon opens your app
5. ✅ Back button closes your app correctly

### Icon Files:

Place your app icon in `public/icons/`:

```
public/
└── icons/
    ├── logo.png
    ├── whatsapp.png
    ├── instagram.png
    └── my-awesome-app.png  (optional - create if you want custom icon)
```

If you specify a custom icon in `apps.ts`:

```ts
{ 
  id: "my-awesome-app", 
  name: "Awesome App", 
  icon: "my-awesome-app.png",  // ← Custom icon
  link: "my-awesome-app" 
}
```

If you use a generic icon (recommended for quick testing):

```ts
{ 
  id: "my-awesome-app", 
  name: "Awesome App", 
  icon: "logo.png",  // ← Use existing icon
  link: "my-awesome-app" 
}
```

---

## Navigation Patterns

### Pattern 1: Simple View Stack (Like MusicApp)

```tsx
const [viewStack, setViewStack] = useState(["home"]);

const pushView = (view: string) => {
  setViewStack(prev => [...prev, view]);
};

const popView = () => {
  setViewStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
};

useViewStackBackHandler(viewStack, popView);

const currentView = viewStack[viewStack.length - 1];

return (
  <div>
    {currentView === "home" && <HomeView onNavigate={pushView} />}
    {currentView === "details" && <DetailsView onNavigate={pushView} />}
  </div>
);
```

### Pattern 2: Boolean State (Simple Apps)

```tsx
const [showDetails, setShowDetails] = useState(false);

useInternalBackHandler(showDetails, () => setShowDetails(false));

return (
  <div>
    {!showDetails ? (
      <HomeView onOpen={() => setShowDetails(true)} />
    ) : (
      <DetailsView onClose={() => setShowDetails(false)} />
    )}
  </div>
);
```

### Pattern 3: Enum/String State

```tsx
type ViewType = "home" | "details" | "settings";

const [view, setView] = useState<ViewType>("home");

useInternalBackHandler(
  view !== "home",
  () => setView("home")
);

return (
  <div>
    {view === "home" && <HomeView onNavigate={(v) => setView(v as ViewType)} />}
    {view === "details" && <DetailsView />}
    {view === "settings" && <SettingsView />}
  </div>
);
```

### Pattern 4: Modal Stack (Advanced)

```tsx
interface Modal {
  id: string;
  type: "settings" | "help" | "about";
  data?: any;
}

const [modals, setModals] = useState<Modal[]>([]);

const openModal = (modal: Modal) => {
  setModals(prev => [...prev, modal]);
};

const closeModal = () => {
  setModals(prev => prev.length > 0 ? prev.slice(0, -1) : prev);
};

useModalBackHandler(modals, closeModal);

return (
  <div>
    <HomeView onOpenModal={openModal} />
    {modals.length > 0 && <ModalOverlay modal={modals[modals.length - 1]} onClose={closeModal} />}
  </div>
);
```

---

## Code Examples

### Minimal App (Copy & Paste)

```tsx
// src/apps/hello-world/HelloWorldApp.tsx
import { useState } from "react";
import { useViewStackBackHandler } from "../../data/useInternalBackHandler";
import "./HelloWorldApp.css";

export default function HelloWorldApp() {
  const [viewStack, setViewStack] = useState(["home"]);
  
  useViewStackBackHandler(viewStack, () => setViewStack(v => v.slice(0, -1)));
  
  const view = viewStack[viewStack.length - 1];

  return (
    <div className="hello-world-app">
      {view === "home" && (
        <div className="view">
          <h1>Hello World</h1>
          <button onClick={() => setViewStack(v => [...v, "message"])}>
            Show Message
          </button>
        </div>
      )}
      {view === "message" && (
        <div className="view">
          <h1>Hello from Phone OS!</h1>
          <p>Press back to return</p>
        </div>
      )}
    </div>
  );
}
```

```css
/* src/apps/hello-world/HelloWorldApp.css */
.hello-world-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.view {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}

.hello-world-app h1 {
  margin: 0;
  font-size: 28px;
}

.hello-world-app button {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.hello-world-app button:active {
  transform: scale(0.98);
}
```

### Todo App Example

```tsx
// src/apps/todo/TodoApp.tsx
import { useState } from "react";
import { useViewStackBackHandler } from "../../data/useInternalBackHandler";
import "./TodoApp.css";

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export default function TodoApp() {
  const [viewStack, setViewStack] = useState(["list"]);
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "Learn Phone OS", done: false },
    { id: "2", text: "Build awesome apps", done: false },
  ]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  useViewStackBackHandler(viewStack, () => setViewStack(v => v.slice(0, -1)));

  const view = viewStack[viewStack.length - 1];

  const handleSelectTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setViewStack(v => [...v, "detail"]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  return (
    <div className="todo-app">
      {view === "list" && (
        <div>
          <h1>My Todos</h1>
          <div className="todo-list">
            {todos.map(todo => (
              <div key={todo.id} className="todo-item" onClick={() => handleSelectTodo(todo)}>
                <input 
                  type="checkbox" 
                  checked={todo.done} 
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleTodo(todo.id);
                  }} 
                />
                <span className={todo.done ? "done" : ""}>{todo.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "detail" && selectedTodo && (
        <div>
          <h1>{selectedTodo.text}</h1>
          <p>Status: {selectedTodo.done ? "Done" : "Pending"}</p>
          <button onClick={() => toggleTodo(selectedTodo.id)}>
            Toggle Status
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Testing Checklist

Before publishing your app, verify all items:

### Functionality
- ✅ App opens when tapped from home screen
- ✅ App opens when tapped from app drawer
- ✅ All internal views/pages work correctly
- ✅ Navigation between views works
- ✅ Data persists when navigating between views

### Back Button
- ✅ Back button navigates to previous internal view (if any)
- ✅ Back button from root view closes app and returns to home
- ✅ App closes cleanly (no console errors)
- ✅ Back button works after reopening app

### UI/UX
- ✅ App fills entire screen (no black bars)
- ✅ All buttons/interactive elements work
- ✅ Text is readable and visible
- ✅ Colors match phone OS theme
- ✅ No overlapping elements
- ✅ Buttons have active/pressed states

### Code Quality
- ✅ No TypeScript errors (check terminal: `npm run build`)
- ✅ No console warnings or errors
- ✅ Clean imports (no unused code)
- ✅ Proper file naming conventions
- ✅ CSS doesn't conflict with other apps (use app-specific class names)

### Integration
- ✅ App appears in app drawer
- ✅ App appears on home screen
- ✅ App can be removed from home screen (long press)
- ✅ App data is in `apps.ts`
- ✅ App component is in `appRegistry.ts`

**To verify everything works:**
```bash
npm run build  # Should have zero errors
npm run dev    # Start dev server
# Test in browser at http://localhost:5174
```

---

## Common Issues & Fixes

### Issue 1: Back button immediately closes the app

**Problem:** App closes when pressing back from root view.

**Cause:** View stack condition is wrong.

**Fix:**
```tsx
// Wrong:
useViewStackBackHandler(true, popView);  // Always allows back

// Correct:
useViewStackBackHandler(viewStack.length > 1, popView);  // Only if not at root
```

### Issue 2: App doesn't appear on home screen

**Problem:** App doesn't show up in home screen or app drawer.

**Cause:** Not registered in `apps.ts` or `appRegistry.ts`.

**Fix:**
1. Check `src/data/apps.ts` — app entry must exist
2. Check `src/apps/appRegistry.ts` — app must be imported and in registry
3. App `id` must match in both files
4. Rebuild: `npm run build`

### Issue 3: Back button handler not working

**Problem:** Back button does nothing or throws an error.

**Cause:** No back handler registered or wrong hook used.

**Fix:**
```tsx
// Make sure you have this:
import { useViewStackBackHandler } from "../../data/useInternalBackHandler";

export default function MyApp() {
  const [viewStack, setViewStack] = useState(["home"]);
  
  // Add this line:
  useViewStackBackHandler(viewStack, () => setViewStack(v => v.slice(0, -1)));
  
  // ...rest of component
}
```

### Issue 4: App icon not showing

**Problem:** App appears in drawer but icon is broken/blank.

**Cause:** Icon file doesn't exist or wrong filename.

**Fix:**
1. Check icon exists in `public/icons/[icon-name].png`
2. Verify spelling in `apps.ts` matches filename exactly
3. Use `.png` format (also supports `.jpg`, `.svg`)
4. Recommended size: 512x512px or larger

### Issue 5: Styles affecting other apps

**Problem:** Your CSS affects other apps.

**Cause:** Global selectors or no CSS scoping.

**Fix:**
```css
/* Good: Scoped to app */
.my-awesome-app {
  /* styles only apply to your app */
}

.my-awesome-app button {
  /* scoped to your app's buttons */
}

/* Bad: Too global */
button {
  /* affects ALL buttons site-wide! */
}
```

### Issue 6: App state resets when navigating back

**Problem:** Data is lost when returning to a view.

**Cause:** State not managed at app root level.

**Fix:**
```tsx
// Good: State at root, survives view changes
export default function MyApp() {
  const [data, setData] = useState([]);  // ← Here
  const [view, setView] = useState("home");
  
  return <div>{/* views can access and modify data */}</div>;
}

// Bad: State inside conditional
export default function MyApp() {
  const [view, setView] = useState("home");
  
  return (
    <div>
      {view === "details" && (
        <DetailsView data={useState([])} />  // ← Resets every time!
      )}
    </div>
  );
}
```

### Issue 7: TypeScript errors

**Problem:** Build fails with TypeScript errors.

**Cause:** Type mismatches or missing types.

**Fix:**
```tsx
// Add types to useState:
const [count, setCount] = useState<number>(0);
const [view, setView] = useState<"home" | "details">("home");

// Type function returns:
const handleClick = (): void => {
  // ...
};

// If stuck, check errors:
npm run build  // Shows detailed errors
```

---

## File Structure Template

Use this template for new apps:

```
src/apps/my-awesome-app/
├── MyAwesomeApp.tsx          # Main component (REQUIRED)
├── MyAwesomeApp.css          # Styling (REQUIRED)
├── useMyAwesomeApp.ts        # Custom hooks (OPTIONAL)
├── myAwesomeAppData.ts       # Data/constants (OPTIONAL)
├── types.ts                  # Type definitions (OPTIONAL)
└── README.md                 # App documentation (OPTIONAL)
```

### MyAwesomeApp.tsx Template:

```tsx
import { useState } from "react";
import { useViewStackBackHandler } from "../../data/useInternalBackHandler";
import "./MyAwesomeApp.css";

/**
 * MyAwesomeApp
 * 
 * Description: [What does your app do?]
 * Navigation: View stack (home → details → settings)
 * Dependencies: [List any external deps]
 */

interface AppState {
  viewStack: string[];
  // Add other state fields here
}

export default function MyAwesomeApp() {
  // State
  const [viewStack, setViewStack] = useState<string[]>(["home"]);

  // Navigation helpers
  const pushView = (view: string) => {
    setViewStack(prev => [...prev, view]);
  };

  const popView = () => {
    setViewStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  // Back button handler (REQUIRED)
  useViewStackBackHandler(viewStack, popView);

  // Current view
  const currentView = viewStack[viewStack.length - 1];

  // Render
  return (
    <div className="my-awesome-app">
      {currentView === "home" && (
        <div className="view-home">
          <h1>Home</h1>
          {/* content */}
        </div>
      )}

      {currentView === "details" && (
        <div className="view-details">
          <h1>Details</h1>
          {/* content */}
        </div>
      )}
    </div>
  );
}
```

### MyAwesomeApp.css Template:

```css
/* Root container - REQUIRED */
.my-awesome-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

/* View containers */
.view-home,
.view-details {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Typography */
.my-awesome-app h1 {
  margin: 0 0 20px 0;
  font-size: 24px;
}

.my-awesome-app h2 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.my-awesome-app p {
  margin: 0 0 15px 0;
  font-size: 14px;
  line-height: 1.5;
}

/* Buttons */
.my-awesome-app button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  margin-top: 10px;
}

.my-awesome-app button:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}

/* Lists/items */
.my-awesome-app .item {
  padding: 12px;
  margin: 8px 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.my-awesome-app .item:active {
  background: rgba(0, 0, 0, 0.3);
}
```

---

## Quick Reference Checklist

### Before creating your app:
- [ ] You understand the Phone OS architecture
- [ ] You've looked at `src/apps/music-app/` for reference
- [ ] You know which navigation pattern to use (stack, modal, routes, etc.)

### While creating:
- [ ] Created folder: `src/apps/[app-id]/`
- [ ] Created component: `[AppName]App.tsx`
- [ ] Created styles: `[AppName]App.css`
- [ ] Added back handler hook (one of the 4 options)
- [ ] Component has `className="[app-id-app]"` on root div
- [ ] All views implemented

### After creating:
- [ ] Added app to `src/data/apps.ts`
- [ ] Added app to `src/apps/appRegistry.ts`
- [ ] Icon file exists (or using existing icon)
- [ ] Ran `npm run build` — zero errors
- [ ] Tested in browser: `npm run dev`
- [ ] Tested all views work
- [ ] Tested back button works
- [ ] Ran through testing checklist

### If something breaks:
- [ ] Check console for errors: F12 → Console tab
- [ ] Check build output: `npm run build`
- [ ] Verify app registration in both files
- [ ] Verify back handler is registered
- [ ] Check CSS class names are scoped

---

## Support & Resources

### Key Files to Reference:
- **Music App** (view stack example): `src/apps/music-app/`
- **Example Modal App** (modal example): `src/apps/example-modal/`
- **Back button guide**: See `BACK_BUTTON_SYSTEM.md` in project root
- **Helper hooks**: `src/data/useInternalBackHandler.ts`
- **State management**: `src/data/state.tsx`

### Common Questions:
- **"How do I access data from other apps?"** → Use context or global state (beyond scope of individual apps)
- **"Can I use external libraries?"** → Yes, but install and check compatibility
- **"How do I test my app?"** → Use `npm run dev` and test in browser at http://localhost:5174
- **"Can I use React Router?"** → Yes, use `useRouteBackHandler` instead of `useViewStackBackHandler`
- **"How do I persist data?"** → Use `localStorage` like MusicApp does

### Getting Help:
If your app doesn't work:
1. Check the testing checklist above
2. Look for console errors (F12)
3. Check `npm run build` output
4. Compare your code to MusicApp reference
5. Verify files are in correct locations and correctly named

---

## Summary

To create a fully compatible Phone OS app:

1. **Create files**: Component + CSS in `src/apps/[app-id]/`
2. **Use back handler**: One line of code using a helper hook
3. **Register app**: Add to `apps.ts` and `appRegistry.ts` (2 lines each)
4. **Test**: `npm run build` → `npm run dev` → verify in browser
5. **Done**: App automatically appears on home screen and works!

That's it! Your app now has:
- ✅ Full back button support
- ✅ Integration with home screen
- ✅ Integration with app drawer
- ✅ App removal from home screen
- ✅ Proper lifecycle management
- ✅ All system integrations

Happy coding! 🚀
