import { useEffect, useState } from 'react';
import { supabase, Song, Like } from '../../lib/supabase';
import { Play, Heart } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

export default function LikedSongsPage() {
  const [likedSongs, setLikedSongs] = useState<(Like & { song: Song })[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    loadLikedSongs();
  }, []);

  async function loadLikedSongs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('likes')
      .select(`
        *,
        song:songs(
          *,
          artist:artists(*),
          album:albums(*),
          genre:genres(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading liked songs:', error);
    } else {
      setLikedSongs(data || []);
    }
    setLoading(false);
  }

  async function unlikeSong(likeId: string) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', likeId);

    if (error) {
      console.error('Error unliking song:', error);
    } else {
      setLikedSongs(prev => prev.filter(like => like.id !== likeId));
    }
  }

  function handlePlayAll() {
    const songs = likedSongs.map(like => like.song).filter(Boolean);
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex-1 overflow-auto pb-24">
      <div className="p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-48 h-48 rounded bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-24 h-24 text-white" fill="white" />
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-sm mb-2">PLAYLIST</p>
            <h1 className="text-5xl font-bold text-white mb-4">Liked Songs</h1>
            <p className="text-slate-400">{likedSongs.length} liked songs</p>
          </div>
        </div>

        {likedSongs.length > 0 && (
          <div className="mb-8">
            <button
              onClick={handlePlayAll}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Play className="w-6 h-6 ml-1" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading liked songs...</p>
          </div>
        ) : likedSongs.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No liked songs yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Start liking songs to build your collection
            </p>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-slate-400 font-medium w-12">#</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Title</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Album</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Genre</th>
                  <th className="text-left p-4 text-slate-400 font-medium w-24">Duration</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {likedSongs.map((like, index) => {
                  const song = like.song;
                  return (
                    <tr
                      key={like.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 group transition-colors"
                    >
                      <td className="p-4">
                        <button
                          onClick={() => playSong(song, likedSongs.map(l => l.song))}
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <span className="group-hover:hidden text-slate-400">{index + 1}</span>
                          <Play className="hidden group-hover:block w-4 h-4 text-white" />
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {song.cover_url ? (
                            <img
                              src={song.cover_url}
                              alt={song.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center">
                              <span className="text-slate-400">♪</span>
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{song.title}</p>
                            <p className="text-slate-400 text-sm">{song.artist?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{song.album?.name || '-'}</td>
                      <td className="p-4 text-slate-300">{song.genre?.name || '-'}</td>
                      <td className="p-4 text-slate-400">{formatDuration(song.duration)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => unlikeSong(like.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Heart className="w-5 h-5" fill="currentColor" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
