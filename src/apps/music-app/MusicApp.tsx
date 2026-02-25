
// MusicApp.tsx
import { useEffect, useState } from "react"
import { songs } from "./songs"
import { useMusicApp } from "./useMusicApp"
import { useViewStackBackHandler } from "../../data/useInternalBackHandler"
import "./MusicApp.css"

export const appMeta = {
  id: "music",
  name: "Music Player",
  icon: "whatsapp.png",
  route: "/app/music-app",
  allowsBackground: true
}

export default function AppRoot() {
  const [loading, setLoading] = useState(true)

  const {
    audioRef,
    view,
    popView,
    pushView,
    sortedSongs,
    currentSong,
    playSong,
    togglePlay,
    playNext,
    isPlaying,
    progress,
    duration,
    seek,
    viewStack
  } = useMusicApp(songs)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 4000)
    return () => clearTimeout(t)
  }, [])

  // Register the back handler for internal navigation using the reusable hook
  useViewStackBackHandler(viewStack, popView)

  if (loading) {
    return (
      <div className="loader">
        <img src={appMeta.icon} />
        <span>Music Player</span>
      </div>
    )
  }

  return (
    <div className="app">
      <audio ref={audioRef} />

      {view === "library" && (
        <div className="library">
          <input className="search" placeholder="Search..." />
          <div className="count">{sortedSongs.length} Songs</div>

          <div className="song-list">
            {sortedSongs.map((song, i) => (
              <div key={song.id} className="song" onClick={() => playSong(i)}>
                <img src={song.coverSrc} />
                <div>
                  <div className="title">{song.title}</div>
                  <div className="artist">{song.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "player" && currentSong && (
        <div className="player">
          <button onClick={popView}>↓</button>

          <img className="cover" src={currentSong.coverSrc} />
          <div className="title">{currentSong.title}</div>
          <div className="artist">{currentSong.artist}</div>

          <div className="toggles">
            <button className="toggle" />
            <button className="toggle" />
          </div>

          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={e => seek(Number(e.target.value))}
          />

          <div className="controls">
            <button onClick={playNext}>⏭</button>
            <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
            <button onClick={() => pushView("lyrics")}>Lyrics</button>
          </div>
        </div>
      )}

      {view === "lyrics" && currentSong && (
        <div className="lyrics">
          <button onClick={popView}>↓</button>
          <h1>{currentSong.title}</h1>
          <h2>{currentSong.artist}</h2>
          <pre>{currentSong.lyrics}</pre>

          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={e => seek(Number(e.target.value))}
          />

          <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        </div>
      )}
    </div>
  )
}
 