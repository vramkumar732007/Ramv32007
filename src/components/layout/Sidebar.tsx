import { Home, Search, Library, PlusSquare, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { signOut, profile } = useAuth();

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'library', icon: Library, label: 'Your Library' },
  ];

  const libraryItems = [
    { id: 'playlists', icon: PlusSquare, label: 'Create Playlist' },
    { id: 'liked', icon: Heart, label: 'Liked Songs' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col border-r border-slate-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">♪</span>
          StreamTune
        </h1>
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700 space-y-1">
          {libraryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {profile?.is_admin && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={() => onNavigate('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'admin'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Admin Panel</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="mb-3 px-4">
          <p className="text-white font-medium truncate">{profile?.full_name || profile?.email}</p>
          <p className="text-slate-400 text-sm truncate">{profile?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
