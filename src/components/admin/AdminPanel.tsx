import { useState, useEffect } from 'react';
import { supabase, Song, Artist, Album, Genre } from '../../lib/supabase';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function AdminPanel() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeTab, setActiveTab] = useState<'songs' | 'artists' | 'albums' | 'genres'>('songs');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    switch (activeTab) {
      case 'songs':
        loadSongs();
        loadArtists();
        loadAlbums();
        loadGenres();
        break;
      case 'artists':
        loadArtists();
        break;
      case 'albums':
        loadAlbums();
        loadArtists();
        break;
      case 'genres':
        loadGenres();
        break;
    }
  }

  async function loadSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:artists(*),
        album:albums(*),
        genre:genres(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading songs:', error);
    } else {
      setSongs(data || []);
    }
  }

  async function loadArtists() {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading artists:', error);
    } else {
      setArtists(data || []);
    }
  }

  async function loadAlbums() {
    const { data, error } = await supabase
      .from('albums')
      .select(`
        *,
        artist:artists(*)
      `)
      .order('name');

    if (error) {
      console.error('Error loading albums:', error);
    } else {
      setAlbums(data || []);
    }
  }

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

  async function deleteSong(id: string) {
    if (!confirm('Are you sure you want to delete this song?')) return;

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song');
    } else {
      loadSongs();
    }
  }

  async function deleteArtist(id: string) {
    if (!confirm('Are you sure you want to delete this artist? This will also delete all their songs.')) return;

    const { error } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting artist:', error);
      alert('Failed to delete artist');
    } else {
      loadArtists();
    }
  }

  async function deleteGenre(id: string) {
    if (!confirm('Are you sure you want to delete this genre?')) return;

    const { error } = await supabase
      .from('genres')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting genre:', error);
      alert('Failed to delete genre');
    } else {
      loadGenres();
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {(['songs', 'artists', 'albums', 'genres'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'songs' && (
          <div className="bg-slate-800/50 rounded-lg overflow-hidden">
            {songs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No songs yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-slate-400 font-medium">Title</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Artist</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Album</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Genre</th>
                    <th className="text-left p-4 text-slate-400 font-medium w-24">Duration</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-4 text-white">{song.title}</td>
                      <td className="p-4 text-slate-300">{song.artist?.name}</td>
                      <td className="p-4 text-slate-300">{song.album?.name || '-'}</td>
                      <td className="p-4 text-slate-300">{song.genre?.name || '-'}</td>
                      <td className="p-4 text-slate-400">{formatDuration(song.duration)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteSong(song.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
              >
                {artist.image_url ? (
                  <img
                    src={artist.image_url}
                    alt={artist.name}
                    className="w-full aspect-square rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-full bg-slate-700 flex items-center justify-center mb-4">
                    <span className="text-4xl text-slate-400">♪</span>
                  </div>
                )}
                <p className="text-white font-medium text-center truncate mb-2">{artist.name}</p>
                <button
                  onClick={() => deleteArtist(artist.id)}
                  className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
              >
                {album.cover_url ? (
                  <img
                    src={album.cover_url}
                    alt={album.name}
                    className="w-full aspect-square rounded object-cover mb-4"
                  />
                ) : (
                  <div className="w-full aspect-square rounded bg-slate-700 flex items-center justify-center mb-4">
                    <span className="text-4xl text-slate-400">♪</span>
                  </div>
                )}
                <p className="text-white font-medium truncate">{album.name}</p>
                <p className="text-slate-400 text-sm truncate mb-2">{album.artist?.name}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'genres' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.id}
                className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group flex items-center justify-between"
              >
                <span className="text-white font-medium">{genre.name}</span>
                <button
                  onClick={() => deleteGenre(genre.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddForm && (
          <AddItemModal
            type={activeTab}
            artists={artists}
            albums={albums}
            genres={genres}
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              loadData();
            }}
          />
        )}
      </div>
    </div>
  );
}

interface AddItemModalProps {
  type: 'songs' | 'artists' | 'albums' | 'genres';
  artists: Artist[];
  albums: Album[];
  genres: Genre[];
  onClose: () => void;
  onSuccess: () => void;
}

function AddItemModal({ type, artists, albums, genres, onClose, onSuccess }: AddItemModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      switch (type) {
        case 'songs':
          await supabase.from('songs').insert({
            title: formData.title,
            artist_id: formData.artist_id,
            album_id: formData.album_id || null,
            genre_id: formData.genre_id || null,
            duration: parseInt(formData.duration),
            file_url: formData.file_url,
            cover_url: formData.cover_url || null,
          });
          break;
        case 'artists':
          await supabase.from('artists').insert({
            name: formData.name,
            bio: formData.bio || null,
            image_url: formData.image_url || null,
          });
          break;
        case 'albums':
          await supabase.from('albums').insert({
            name: formData.name,
            artist_id: formData.artist_id,
            cover_url: formData.cover_url || null,
            release_year: formData.release_year ? parseInt(formData.release_year) : null,
          });
          break;
        case 'genres':
          await supabase.from('genres').insert({
            name: formData.name,
          });
          break;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white capitalize">Add {type.slice(0, -1)}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {type === 'songs' && (
            <>
              <input
                type="text"
                placeholder="Title"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <select
                required
                value={formData.artist_id || ''}
                onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Select Artist</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
              <select
                value={formData.album_id || ''}
                onChange={(e) => setFormData({ ...formData, album_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Select Album (Optional)</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
              <select
                value={formData.genre_id || ''}
                onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Select Genre (Optional)</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Duration (seconds)"
                required
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <input
                type="url"
                placeholder="File URL (e.g., https://example.com/song.mp3)"
                required
                value={formData.file_url || ''}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <input
                type="url"
                placeholder="Cover Image URL (Optional)"
                value={formData.cover_url || ''}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </>
          )}

          {type === 'artists' && (
            <>
              <input
                type="text"
                placeholder="Name"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <textarea
                placeholder="Bio (Optional)"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
              />
              <input
                type="url"
                placeholder="Image URL (Optional)"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </>
          )}

          {type === 'albums' && (
            <>
              <input
                type="text"
                placeholder="Name"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <select
                required
                value={formData.artist_id || ''}
                onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Select Artist</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Release Year (Optional)"
                value={formData.release_year || ''}
                onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <input
                type="url"
                placeholder="Cover Image URL (Optional)"
                value={formData.cover_url || ''}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </>
          )}

          {type === 'genres' && (
            <input
              type="text"
              placeholder="Genre Name"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
