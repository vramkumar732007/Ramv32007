import { useState, useEffect } from 'react';
import { supabase, Song, Artist, Album } from '../../lib/supabase';
import { Search, Play } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();

  useEffect(() => {
    if (query.trim().length > 0) {
      searchAll();
    } else {
      setSongs([]);
      setArtists([]);
      setAlbums([]);
    }
  }, [query]);

  async function searchAll() {
    setLoading(true);

    const searchTerm = `%${query}%`;

    const [songsResult, artistsResult, albumsResult] = await Promise.all([
      supabase
        .from('songs')
        .select(`
          *,
          artist:artists(*),
          album:albums(*),
          genre:genres(*)
        `)
        .ilike('title', searchTerm)
        .limit(10),
      supabase
        .from('artists')
        .select('*')
        .ilike('name', searchTerm)
        .limit(5),
      supabase
        .from('albums')
        .select(`
          *,
          artist:artists(*)
        `)
        .ilike('name', searchTerm)
        .limit(5),
    ]);

    setSongs(songsResult.data || []);
    setArtists(artistsResult.data || []);
    setAlbums(albumsResult.data || []);
    setLoading(false);
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex-1 overflow-auto pb-24">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Search</h1>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs, artists, or albums..."
            className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {query.trim().length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Start typing to search for music</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Searching...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {songs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
                <div className="space-y-2">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
                    >
                      {song.cover_url ? (
                        <img
                          src={song.cover_url}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center">
                          <span className="text-slate-400">♪</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{song.title}</p>
                        <p className="text-slate-400 text-sm truncate">{song.artist?.name}</p>
                      </div>
                      <span className="text-slate-400 text-sm">{formatDuration(song.duration)}</span>
                      <button
                        onClick={() => playSong(song, songs)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-5 h-5 ml-0.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {artists.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {artists.map((artist) => (
                    <div
                      key={artist.id}
                      className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
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
                      <p className="text-white font-medium text-center truncate">{artist.name}</p>
                      <p className="text-slate-400 text-sm text-center">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {albums.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
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
                      <p className="text-slate-400 text-sm truncate">{album.artist?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {songs.length === 0 && artists.length === 0 && albums.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No results found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
