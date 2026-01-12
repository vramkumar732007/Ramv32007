import { useEffect, useState } from 'react';
import { supabase, Playlist, Song, PlaylistSong } from '../../lib/supabase';
import { Play, Trash2, ArrowLeft, Plus, X } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

interface PlaylistDetailPageProps {
  playlistId: string;
  onBack: () => void;
}

export default function PlaylistDetailPage({ playlistId, onBack }: PlaylistDetailPageProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const { playSong } = usePlayer();

  useEffect(() => {
    loadPlaylist();
    loadPlaylistSongs();
  }, [playlistId]);

  async function loadPlaylist() {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .maybeSingle();

    if (error) {
      console.error('Error loading playlist:', error);
    } else {
      setPlaylist(data);
    }
  }

  async function loadPlaylistSongs() {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select(`
        *,
        song:songs(
          *,
          artist:artists(*),
          album:albums(*),
          genre:genres(*)
        )
      `)
      .eq('playlist_id', playlistId)
      .order('position');

    if (error) {
      console.error('Error loading playlist songs:', error);
    } else {
      setPlaylistSongs(data || []);
    }
    setLoading(false);
  }

  async function loadAvailableSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:artists(*),
        album:albums(*),
        genre:genres(*)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading songs:', error);
    } else {
      const currentSongIds = new Set(playlistSongs.map(ps => ps.song_id));
      setAvailableSongs((data || []).filter(song => !currentSongIds.has(song.id)));
    }
  }

  async function addSongToPlaylist(songId: string) {
    const maxPosition = playlistSongs.length > 0
      ? Math.max(...playlistSongs.map(ps => ps.position))
      : 0;

    const { error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId,
        position: maxPosition + 1,
      });

    if (error) {
      console.error('Error adding song to playlist:', error);
    } else {
      loadPlaylistSongs();
      setShowAddSongs(false);
    }
  }

  async function removeSongFromPlaylist(playlistSongId: string) {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('id', playlistSongId);

    if (error) {
      console.error('Error removing song from playlist:', error);
    } else {
      loadPlaylistSongs();
    }
  }

  async function deletePlaylist() {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) {
      console.error('Error deleting playlist:', error);
    } else {
      onBack();
    }
  }

  function handlePlayPlaylist() {
    const songs = playlistSongs.map(ps => ps.song!).filter(Boolean);
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto pb-24">
        <div className="p-8">
          <p className="text-slate-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex-1 overflow-auto pb-24">
        <div className="p-8">
          <p className="text-slate-400">Playlist not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto pb-24">
      <div className="p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Library
        </button>

        <div className="flex items-start gap-6 mb-8">
          <div className="w-48 h-48 rounded bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="text-6xl text-white">♪</span>
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-sm mb-2">PLAYLIST</p>
            <h1 className="text-5xl font-bold text-white mb-4">{playlist.name}</h1>
            <p className="text-slate-300 mb-4">{playlist.description || 'No description'}</p>
            <p className="text-slate-400 text-sm">{playlistSongs.length} songs</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handlePlayPlaylist}
            disabled={playlistSongs.length === 0}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white transition-colors"
          >
            <Play className="w-6 h-6 ml-1" />
          </button>
          <button
            onClick={() => {
              loadAvailableSongs();
              setShowAddSongs(true);
            }}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Songs
          </button>
          <button
            onClick={deletePlaylist}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
          >
            Delete Playlist
          </button>
        </div>

        {playlistSongs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">This playlist is empty</p>
            <button
              onClick={() => {
                loadAvailableSongs();
                setShowAddSongs(true);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Songs
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-slate-400 font-medium w-12">#</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Title</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Album</th>
                  <th className="text-left p-4 text-slate-400 font-medium w-24">Duration</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {playlistSongs.map((playlistSong, index) => {
                  const song = playlistSong.song!;
                  return (
                    <tr
                      key={playlistSong.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 group transition-colors"
                    >
                      <td className="p-4 text-slate-400">{index + 1}</td>
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
                      <td className="p-4 text-slate-400">{formatDuration(song.duration)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => removeSongFromPlaylist(playlistSong.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {showAddSongs && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Add Songs to Playlist</h2>
              <button
                onClick={() => setShowAddSongs(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-auto p-6">
              {availableSongs.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No songs available to add</p>
              ) : (
                <div className="space-y-2">
                  {availableSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      {song.cover_url ? (
                        <img
                          src={song.cover_url}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-600 flex items-center justify-center">
                          <span className="text-slate-400">♪</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{song.title}</p>
                        <p className="text-slate-400 text-sm truncate">{song.artist?.name}</p>
                      </div>
                      <button
                        onClick={() => addSongToPlaylist(song.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
