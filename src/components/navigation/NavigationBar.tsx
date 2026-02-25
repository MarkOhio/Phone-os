
import "./NavigationBar.css";

interface Props {
  onBack: () => void;
  onHome: () => void;
  onRecent: () => void;
}

export default function NavigationBar({ onBack, onHome, onRecent }: Props) {
  return (
    <div className="nav-bar">
      <div className="nav-btn" onClick={onBack}>◀</div>
      <div className="nav-btn" onClick={onHome}>●</div>
      <div className="nav-btn" onClick={onRecent}>■</div>
    </div>
  );
}