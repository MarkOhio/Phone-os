
// songs.ts
export type Song = {
  id: string
  title: string
  artist: string
  audioSrc: string
  coverSrc: string
  lyrics: string
}

export const songs: Song[] = [
  {
    id: "song-1",
    title: "1990 (Demo)",
    artist: "Jon Bellion",
    audioSrc: "/music/1990-demo.mp3",
    coverSrc: "/music/1990.jpg",
    lyrics: `It's crazy when
The thing you love the most
Is the detriment...`
  },
  {
    id: "song-2",
    title: "Graveyard (Demo)",
    artist: "Jon Bellion",
    audioSrc: "/music/graveyard-demo.mp3",
    coverSrc: "/music/graveyard.jpg",
    lyrics: `Let that sink in
You can think again...`
  }
]

