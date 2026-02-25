import { AppStateProvider } from "./data/state";
import { WallpaperProvider } from "./data/wallpaperContext";
import PhoneShell from "./shell/PhoneShell";
import "./shell/PhoneShell.css";

function App() {
  return (
    <AppStateProvider>
      <WallpaperProvider>
        <PhoneShell />
      </WallpaperProvider>
    </AppStateProvider>
  );
}

export default App;