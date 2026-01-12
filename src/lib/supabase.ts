import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Album {
  id: string;
  name: string;
  artist_id: string;
  cover_url: string | null;
  release_year: number | null;
  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  album_id: string | null;
  genre_id: string | null;
  duration: number;
  file_url: string;
  cover_url: string | null;
  created_at: string;
  artist?: Artist;
  album?: Album;
  genre?: Genre;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
  song?: Song;
}

export interface Like {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
}
