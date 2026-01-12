import { useEffect, useState } from 'react';
import { supabase, Song, Genre } from '../../lib/supabase';
import { Play, Heart, MoreVertical } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const { playSong, currentSong, isPlaying } = usePlayer();

  useEffect(() => {
    loadGenres();
    loadSongs();
    loadLikedSongs();
  }, [selectedGenre]);

  async function loadGenres() {
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading genres:', error);
    } else {
      setGenres(data || []);
    }
  }

  async function loadSongs() {
    setLoading(true);
    let query = supabase
      .from('songs')
      .select(`
        *,
        artist:artists(*),
        album:albums(*),
        genre:genres(*)
      `)
      .order('created_at', { ascending: false });

    if (selectedGenre) {
      query = query.eq('genre_id', selectedGenre);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading songs:', error);
    } else {
      setSongs(data || []);
    }
    setLoading(false);
  }

  async function loadLikedSongs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('likes')
      .select('song_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading liked songs:', error);
    } else {
      setLikedSongs(new Set(data.map(like => like.song_id)));
    }
  }

  async function toggleLike(songId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (likedSongs.has(songId)) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', songId);

      if (!error) {
        setLikedSongs(prev => {
          const next = new Set(prev);
          next.delete(songId);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, song_id: songId });

      if (!error) {
        setLikedSongs(prev => new Set(prev).add(songId));
      }
    }
  }

  function handlePlaySong(song: Song) {
    playSong(song, songs);
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex-1 overflow-auto pb-24">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Browse Music</h1>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Genres
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === genre.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading songs...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No songs found</p>
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
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, index) => (
                  <tr
                    key={song.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 group transition-colors"
                  >
                    <td className="p-4">
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {currentSong?.id === song.id && isPlaying ? (
                          <span className="text-blue-500 text-sm">♪</span>
                        ) : (
                          <>
                            <span className="group-hover:hidden text-slate-400">{index + 1}</span>
                            <Play className="hidden group-hover:block w-4 h-4 text-white" />
                          </>
                        )}
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLike(song.id)}
                          className={`transition-colors ${
                            likedSongs.has(song.id)
                              ? 'text-red-500'
                              : 'text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Heart
                            className="w-5 h-5"
                            fill={likedSongs.has(song.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
