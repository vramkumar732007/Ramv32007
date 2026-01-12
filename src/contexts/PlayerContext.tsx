import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song } from '../lib/supabase';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  playSong: (song: Song, newQueue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [queue, setQueue] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener('ended', () => {
        nextSong();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  function playSong(song: Song, newQueue?: Song[]) {
    if (audioRef.current) {
      audioRef.current.src = song.file_url;
      audioRef.current.play();
      setCurrentSong(song);
      setIsPlaying(true);

      if (newQueue) {
        setQueue(newQueue);
      }
    }
  }

  function pauseSong() {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  function resumeSong() {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function nextSong() {
    if (queue.length === 0 || !currentSong) return;

    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex < queue.length - 1) {
      playSong(queue[currentIndex + 1]);
    } else {
      playSong(queue[0]);
    }
  }

  function previousSong() {
    if (queue.length === 0 || !currentSong) return;

    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    } else {
      playSong(queue[queue.length - 1]);
    }
  }

  function seekTo(time: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }

  function setVolume(newVolume: number) {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
    }
  }

  function addToQueue(song: Song) {
    setQueue(prev => [...prev, song]);
  }

  function clearQueue() {
    setQueue([]);
  }

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        playSong,
        pauseSong,
        resumeSong,
        nextSong,
        previousSong,
        seekTo,
        setVolume,
        addToQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
