import { useEffect, useState } from 'react';
import { supabase, Playlist } from '../../lib/supabase';
import { Plus, Music } from 'lucide-react';

interface LibraryPageProps {
  onNavigateToPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
}

export default function LibraryPage({ onNavigateToPlaylist, onCreatePlaylist }: LibraryPageProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  async function loadPlaylists() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading playlists:', error);
    } else {
      setPlaylists(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 overflow-auto pb-24">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Your Library</h1>
          <button
            onClick={onCreatePlaylist}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading playlists...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No playlists yet</p>
            <button
              onClick={onCreatePlaylist}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onNavigateToPlaylist(playlist.id)}
                className="text-left p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
              >
                <div className="w-full aspect-square rounded bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center mb-4">
                  <Music className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1 truncate">{playlist.name}</h3>
                <p className="text-slate-400 text-sm truncate">
                  {playlist.description || 'No description'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
