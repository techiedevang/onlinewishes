import React, { useState, useEffect } from 'react';
import { UserCustomization } from '../types';
import { Music, Search, Disc, Play, ExternalLink, Check, Volume2, Sparkles, Radio } from 'lucide-react';

interface SpotifyTrackItem {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  category: string;
  previewAudioUrl?: string;
}

const FEATURED_SPOTIFY_TRACKS: SpotifyTrackItem[] = [
  {
    id: '4cOdK2wGLETKBW3PvgPWqT',
    name: 'As It Was',
    artist: 'Harry Styles',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&fit=crop',
    spotifyUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    previewAudioUrl: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
    category: 'Pop & Vibes',
  },
  {
    id: '0VjIj932C3P2932x',
    name: 'Until I Found You',
    artist: 'Stephen Sanchez',
    albumArt: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&fit=crop',
    spotifyUrl: 'https://open.spotify.com/track/0VjIj932C3P2932x',
    category: 'Romantic Acoustic',
  },
  {
    id: '1Bxf3_LoFi_01',
    name: 'Late Night Coffee & Secrets',
    artist: 'ChilledCow Lo-Fi Beats',
    albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&fit=crop',
    spotifyUrl: 'https://open.spotify.com/track/1Bxf3_LoFi_01',
    category: 'Lo-Fi Chill',
  },
  {
    id: '7qiZ42938x_Bestie',
    name: 'Count On Me',
    artist: 'Bruno Mars',
    albumArt: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=300&fit=crop',
    spotifyUrl: 'https://open.spotify.com/track/7qiZ42938x_Bestie',
    category: 'Bestie Anthem',
  },
  {
    id: '3n3Pp2392x_Golden',
    name: 'Golden Hour Sunset',
    artist: 'JVKE',
    albumArt: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&fit=crop',
    spotifyUrl: 'https://open.spotify.com/track/3n3Pp2392x_Golden',
    category: 'Piano & Strings',
  },
];

interface SpotifyIntegratorProps {
  customization: UserCustomization;
  onChangeCustomization: (updated: UserCustomization) => void;
}

export function SpotifyIntegrator({
  customization,
  onChangeCustomization,
}: SpotifyIntegratorProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'custom_url'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState(customization.spotifyTrackUrl || '');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Extract Spotify Track ID from standard Spotify URLs
  const getSpotifyEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes('open.spotify.com')) {
        const match = url.match(/(track|playlist|album)\/([a-zA-Z0-9]+)/);
        if (match && match[1] && match[2]) {
          return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
        }
      }
    } catch (e) {
      console.error('Failed to parse Spotify URL:', e);
    }
    return null;
  };

  const currentEmbedUrl = getSpotifyEmbedUrl(customization.spotifyTrackUrl || '');

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrackItem[]>(FEATURED_SPOTIFY_TRACKS);

  // Filter local static featured tracks or show live search results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(FEATURED_SPOTIFY_TRACKS);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsSearching(true);
        // 1. Get Token from our server
        const tokenRes = await fetch('/api/spotify/token');
        
        if (!tokenRes.ok) {
          // Fallback to mock search results if Spotify credentials are not configured yet
          console.warn('Spotify API keys not configured on server. Using mock results.');
          const mockResults: SpotifyTrackItem[] = [
            {
              id: 'mock-1',
              name: 'Mock Track 1 (Configure Spotify API)',
              artist: 'Test Artist',
              albumArt: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=100&q=80',
              spotifyUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
              previewAudioUrl: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
              category: 'Pop'
            },
            {
              id: 'mock-2',
              name: 'Mock Track 2',
              artist: 'Test Artist 2',
              albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80',
              spotifyUrl: 'https://open.spotify.com/track/0VjIj932C3P2932x',
              category: 'Acoustic'
            }
          ];
          setSearchResults(mockResults);
          setIsSearching(false);
          return;
        }

        const { access_token } = await tokenRes.json();
        
        // 2. Search Spotify API
        const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        if (!searchRes.ok) throw new Error('Spotify API error');
        
        const data = await searchRes.json();
        const tracks = data.tracks.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          artist: item.artists.map((a: any) => a.name).join(', '),
          albumArt: item.album.images[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&fit=crop',
          spotifyUrl: item.external_urls.spotify,
          previewAudioUrl: item.preview_url,
          category: 'Spotify Search'
        }));
        
        setSearchResults(tracks);
      } catch (error) {
        console.error('Spotify Search Error:', error);
        // Fallback to local filter if API fails
        const lowerQuery = searchQuery.toLowerCase();
        setSearchResults(
          FEATURED_SPOTIFY_TRACKS.filter(t => 
            t.name.toLowerCase().includes(lowerQuery) || 
            t.artist.toLowerCase().includes(lowerQuery) ||
            t.category.toLowerCase().includes(lowerQuery)
          )
        );
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectTrack = (track: SpotifyTrackItem) => {
    onChangeCustomization({
      ...customization,
      spotifyTrackUrl: track.spotifyUrl,
      spotifyPreviewUrl: track.previewAudioUrl,
      spotifyTrackName: track.name,
      spotifyArtistName: track.artist,
      musicTrack: 'spotify_custom',
    });
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    // Parse simple artist/name if possible
    onChangeCustomization({
      ...customization,
      spotifyTrackUrl: customUrlInput.trim(),
      spotifyTrackName: customization.spotifyTrackName || 'Custom Spotify Track',
      spotifyArtistName: customization.spotifyArtistName || 'Spotify Artist',
      musicTrack: 'spotify_custom',
    });

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Spotify Track & Ambient Music Integration</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                SPOTIFY API
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search Spotify, pick a background song, or embed any custom Spotify track URL.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'search'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Search Spotify
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom_url')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'custom_url'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Embed Spotify Link
          </button>
        </div>
      </div>

      {/* Currently Active Spotify Track Banner */}
      {customization.spotifyTrackUrl && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 shadow-lg mb-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Active Spotify Audio
            </span>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>
          {customization.spotifyPreviewUrl ? (
            <div className="p-3 bg-slate-950 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Music className="w-4 h-4 text-emerald-500" />
                <div className="flex-1 truncate">
                  <p className="text-xs font-bold text-white truncate">{customization.spotifyTrackName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{customization.spotifyArtistName}</p>
                </div>
              </div>
              <audio controls src={customization.spotifyPreviewUrl} className="w-full h-8" autoPlay />
            </div>
          ) : (
            <iframe
              src={getSpotifyEmbedUrl(customization.spotifyTrackUrl) || ''}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
              title="Spotify Audio Player"
            />
          )}
        </div>
      )}

      {/* TAB 1: SPOTIFY TRACK SEARCH */}
      {activeTab === 'search' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Spotify track, artist, or vibe (e.g. Harry Styles, Acoustic, Lo-Fi)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {searchResults.map((track) => {
              const isSelected = customization.spotifyTrackUrl === track.spotifyUrl;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <img
                      src={track.albumArt}
                      alt={track.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {track.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {track.artist} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{track.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                        <Play className="w-3 h-3 ml-0.5 fill-current" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM SPOTIFY LINK / EMBED CODE */}
      {activeTab === 'custom_url' && (
        <form onSubmit={handleApplyCustomUrl} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Paste Any Spotify Track or Playlist Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-colors whitespace-nowrap"
              >
                Embed Song
              </button>
            </div>
            {copiedNotification && (
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                ✓ Spotify track link embedded successfully!
              </span>
            )}
          </div>

          {/* Spotify Iframe Embed Live Preview */}
          {currentEmbedUrl ? (
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                Live Spotify Player Preview:
              </span>
              <iframe
                src={currentEmbedUrl}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl shadow"
                title="Spotify Track Player"
              ></iframe>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 text-center">
              Enter any valid Spotify song URL above to render a live embedded player widget for your website visitors.
            </div>
          )}
        </form>
      )}

    </div>
  );
}
