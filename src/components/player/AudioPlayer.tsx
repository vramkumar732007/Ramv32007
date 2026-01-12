import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useEffect, useState } from 'react';

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seekTo(percentage * duration);
  }

  function toggleMute() {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  }

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 py-3 z-50">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {currentSong.cover_url ? (
            <img
              src={currentSong.cover_url}
              alt={currentSong.title}
              className="w-14 h-14 rounded object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded bg-slate-700 flex items-center justify-center">
              <span className="text-slate-400 text-xl">♪</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium truncate">{currentSong.title}</p>
            <p className="text-slate-400 text-sm truncate">{currentSong.artist?.name}</p>
          </div>
        </div>

        <div className="flex flex-col items-center flex-1 max-w-2xl">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={previousSong}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={isPlaying ? pauseSong : resumeSong}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-900 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={nextSong}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1 bg-slate-700 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-blue-500 rounded-full relative group-hover:bg-blue-400 transition-colors"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-slate-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-24 accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
