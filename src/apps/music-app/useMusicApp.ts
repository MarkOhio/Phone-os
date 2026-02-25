
// useMusicApp.ts
import { useEffect, useRef, useState } from "react"
import type { Song } from "./songs"

type View = "library" | "player" | "lyrics"

export function useMusicApp(songs: Song[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [viewStack, setViewStack] = useState<View[]>(["library"])
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null

  const pushView = (view: View) =>
    setViewStack(stack => [...stack, view])

  const popView = () =>
    setViewStack(stack => (stack.length > 1 ? stack.slice(0, -1) : stack))

  const playSong = (index: number) => {
    setCurrentSongIndex(index)
    setIsPlaying(true)
    pushView("player")
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const playNext = () => {
    if (currentSongIndex === null) return
    const next = (currentSongIndex + 1) % songs.length
    setCurrentSongIndex(next)
    setIsPlaying(true)
  }

  useEffect(() => {
    if (!audioRef.current || !currentSong) return
    audioRef.current.src = currentSong.audioSrc
    if (isPlaying) audioRef.current.play()
  }, [currentSongIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const timeUpdate = () => setProgress(audio.currentTime)
    const loaded = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", timeUpdate)
    audio.addEventListener("loadedmetadata", loaded)

    return () => {
      audio.removeEventListener("timeupdate", timeUpdate)
      audio.removeEventListener("loadedmetadata", loaded)
    }
  }, [])

  const seek = (value: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value
    setProgress(value)
  }

  const sortedSongs = [...songs].sort((a, b) =>
    a.artist.localeCompare(b.artist, undefined, { sensitivity: "base" })
  )

  return {
    audioRef,
    view: viewStack[viewStack.length - 1],
    viewStack,
    popView,
    pushView,
    sortedSongs,
    currentSong,
    currentSongIndex,
    playSong,
    togglePlay,
    playNext,
    isPlaying,
    progress,
    duration,
    seek
  }
}
