/*
  # Add Sample Data for Music Streaming Platform

  1. Sample Data
    - Adds sample genres (Rock, Pop, Jazz, Electronic, Classical, Hip Hop)
    - Adds sample artists with images
    - Adds sample albums with cover art
    - Adds sample songs with free music URLs from archive.org
  
  2. Notes
    - All music files are from public domain or Creative Commons sources
    - Sample images use Pexels stock photos
    - This provides a working demo of the platform
*/

-- Insert sample genres
INSERT INTO genres (name) VALUES
  ('Rock'),
  ('Pop'),
  ('Jazz'),
  ('Electronic'),
  ('Classical'),
  ('Hip Hop')
ON CONFLICT (name) DO NOTHING;

-- Insert sample artists
DO $$
DECLARE
  artist1_id uuid := gen_random_uuid();
  artist2_id uuid := gen_random_uuid();
  artist3_id uuid := gen_random_uuid();
  artist4_id uuid := gen_random_uuid();
  rock_id uuid;
  pop_id uuid;
  jazz_id uuid;
  electronic_id uuid;
  album1_id uuid := gen_random_uuid();
  album2_id uuid := gen_random_uuid();
  album3_id uuid := gen_random_uuid();
BEGIN
  -- Insert artists
  INSERT INTO artists (id, name, bio, image_url) VALUES
    (artist1_id, 'The Electric Waves', 'An indie rock band known for their energetic performances and catchy melodies.', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400'),
    (artist2_id, 'Luna Dreams', 'A pop artist creating dreamy soundscapes and heartfelt lyrics.', 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=400'),
    (artist3_id, 'Jazz Quartet', 'Classic jazz ensemble bringing timeless melodies to modern audiences.', 'https://images.pexels.com/photos/1813124/pexels-photo-1813124.jpeg?auto=compress&cs=tinysrgb&w=400'),
    (artist4_id, 'Digital Pulse', 'Electronic music producer pushing boundaries with innovative sounds.', 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=400')
  ON CONFLICT (name) DO NOTHING;
  
  -- Get genre IDs
  SELECT id INTO rock_id FROM genres WHERE name = 'Rock' LIMIT 1;
  SELECT id INTO pop_id FROM genres WHERE name = 'Pop' LIMIT 1;
  SELECT id INTO jazz_id FROM genres WHERE name = 'Jazz' LIMIT 1;
  SELECT id INTO electronic_id FROM genres WHERE name = 'Electronic' LIMIT 1;
  
  -- Insert sample albums
  INSERT INTO albums (id, name, artist_id, cover_url, release_year) VALUES
    (album1_id, 'Electric Dreams', artist1_id, 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400', 2023),
    (album2_id, 'Midnight Melodies', artist2_id, 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400', 2024),
    (album3_id, 'Jazz Sessions', artist3_id, 'https://images.pexels.com/photos/1246437/pexels-photo-1246437.jpeg?auto=compress&cs=tinysrgb&w=400', 2022)
  ON CONFLICT DO NOTHING;
  
  -- Insert sample songs with public domain music from archive.org
  INSERT INTO songs (title, artist_id, album_id, genre_id, duration, file_url, cover_url) VALUES
    ('Summer Nights', artist1_id, album1_id, rock_id, 205, 'https://archive.org/download/TheLivingTombstoneRemixCompetitionWinnerAnnouncement/My_Ordinary_Life_Remix.mp3', 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400'),
    ('Neon Lights', artist1_id, album1_id, rock_id, 198, 'https://archive.org/download/PodcastMix/Motive%20-%20Makina.mp3', 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400'),
    ('Dancing Stars', artist2_id, album2_id, pop_id, 223, 'https://archive.org/download/newagemusic_20190322/528Hz.mp3', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400'),
    ('Moonlight Serenade', artist2_id, album2_id, pop_id, 187, 'https://archive.org/download/relaxing-guitar-music/Relaxing-Music.mp3', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400'),
    ('Blue Notes', artist3_id, album3_id, jazz_id, 312, 'https://archive.org/download/78_blue-room_paul-whiteman-and-his-orchestra-vocal-chorus_gbia0000271a/Blue%20Room%20-%20Paul%20Whiteman%20and%20His%20Orchestra%2C%20Vocal%20Chorus-restored.mp3', 'https://images.pexels.com/photos/1246437/pexels-photo-1246437.jpeg?auto=compress&cs=tinysrgb&w=400'),
    ('Smooth Groove', artist3_id, album3_id, jazz_id, 267, 'https://archive.org/download/78_in-a-little-spanish-town-twas-on-a-night-like-this_paul-whiteman-and-his-orche_gbia0001300a/In%20A%20Little%20Spanish%20Town%20%27Twas%20On%20A%20Night%20Like%20This%20-%20Paul%20Whiteman%20and%20His%20Orchestra-restored.mp3', 'https://images.pexels.com/photos/1246437/pexels-photo-1246437.jpeg?auto=compress&cs=tinysrgb&w=400'),
    ('Digital Waves', artist4_id, NULL, electronic_id, 245, 'https://archive.org/download/999WavFiles/Alien.wav', 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=400'),
    ('Cyber Dreams', artist4_id, NULL, electronic_id, 278, 'https://archive.org/download/999WavFiles/Echoing.wav', 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=400')
  ON CONFLICT DO NOTHING;
  
END $$;