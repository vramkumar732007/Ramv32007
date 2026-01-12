import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import Sidebar from './components/layout/Sidebar';
import HomePage from './components/library/HomePage';
import SearchPage from './components/library/SearchPage';
import LibraryPage from './components/library/LibraryPage';
import PlaylistDetailPage from './components/library/PlaylistDetailPage';
import LikedSongsPage from './components/library/LikedSongsPage';
import AdminPanel from './components/admin/AdminPanel';
import AudioPlayer from './components/player/AudioPlayer';
import CreatePlaylistModal from './components/modals/CreatePlaylistModal';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-white mb-4">♪</div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage onToggle={() => setAuthMode('signup')} />
    ) : (
      <SignUpPage onToggle={() => setAuthMode('login')} />
    );
  }

  function handleNavigate(view: string) {
    if (view === 'playlists') {
      setShowCreatePlaylist(true);
    } else {
      setCurrentView(view);
      setSelectedPlaylistId(null);
    }
  }

  function handleNavigateToPlaylist(playlistId: string) {
    setSelectedPlaylistId(playlistId);
    setCurrentView('playlist-detail');
  }

  function renderContent() {
    if (currentView === 'playlist-detail' && selectedPlaylistId) {
      return (
        <PlaylistDetailPage
          playlistId={selectedPlaylistId}
          onBack={() => {
            setCurrentView('library');
            setSelectedPlaylistId(null);
          }}
        />
      );
    }

    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
      case 'library':
        return (
          <LibraryPage
            onNavigateToPlaylist={handleNavigateToPlaylist}
            onCreatePlaylist={() => setShowCreatePlaylist(true)}
          />
        );
      case 'liked':
        return <LikedSongsPage />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomePage />;
    }
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      {renderContent()}
      <AudioPlayer />
      {showCreatePlaylist && (
        <CreatePlaylistModal
          onClose={() => setShowCreatePlaylist(false)}
          onCreated={() => {
            setShowCreatePlaylist(false);
            setCurrentView('library');
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
