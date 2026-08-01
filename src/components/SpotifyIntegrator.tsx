import React, { useState, useEffect } from 'react';
import { UserCustomization } from '../types';
import { Music, Search, Disc, Play, Pause, Plus, ExternalLink, Check, Volume2, Sparkles, Radio } from 'lucide-react';

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
    id: '1226034393',
    name: 'Sign of the Times',
    artist: 'Harry Styles',
    albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3d/5e/aa/3d5eaaa3-9a86-c264-5cd5-7fac83f99a59/886446451978.jpg/100x100bb.jpg',
    spotifyUrl: 'https://music.apple.com/us/album/sign-of-the-times/1226034336?i=1226034393',
    previewAudioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/19/f7/99/19f799a3-4638-f354-8713-f5ac076f328e/mzaf_2398941441794619302.plus.aac.p.m4a',
    category: 'Pop',
  },
  {
    id: '1581702085',
    name: 'Until I Found You',
    artist: 'Stephen Sanchez',
    albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/d2/c5/64d2c511-67f4-ae09-5153-d39c3da413a3/21UMGIM75467.rgb.jpg/100x100bb.jpg',
    spotifyUrl: 'https://music.apple.com/us/album/until-i-found-you/1581702082?i=1581702085',
    previewAudioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/53/82/c1/5382c1d4-ddba-aa2b-90df-57268895fac9/mzaf_8926201202931541051.plus.aac.p.m4a',
    category: 'Singer/Songwriter',
  },
  {
    id: '1529156069898',
    name: 'Count On Me',
    artist: 'Bruno Mars',
    albumArt: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=300&fit=crop',
    spotifyUrl: 'https://open.spotify.com/track/7qiZ42938x_Bestie',
    previewAudioUrl: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
    category: 'Bestie Anthem',
  },
  {
    id: '1492684223066',
    name: 'Golden Hour',
    artist: 'JVKE',
    albumArt: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&fit=crop',
    spotifyUrl: 'https://open.spotify.com/track/3n3Pp2392x_Golden',
    previewAudioUrl: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
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
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  
  // Create an audio ref to manage preview playback
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handleTogglePreview = (e: React.MouseEvent, track: SpotifyTrackItem) => {
    e.stopPropagation(); // Prevent track selection
    
    if (!track.previewAudioUrl) {
      alert('Preview not available for this track.');
      return;
    }

    if (playingPreviewId === track.id) {
      // Pause current
      if (audioRef.current) audioRef.current.pause();
      setPlayingPreviewId(null);
    } else {
      // Play new
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setPlayingPreviewId(null);
      }
      audioRef.current.src = track.previewAudioUrl;
      audioRef.current.play().catch(console.error);
      setPlayingPreviewId(track.id);
    }
  };

  // Extract Spotify Track ID from standard Spotify URLs
  const getMediaEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes('spotify.com')) {
        const match = url.match(/(track|playlist|album)\/([a-zA-Z0-9]+)/);
        if (match && match[1] && match[2]) {
          return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
        }
      }
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}?autoplay=1&loop=1&playlist=${match[1]}`;
        }
      }
      if (url.includes('soundcloud.com')) {
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
      }
    } catch (e) {
      console.error('Failed to parse Media URL:', e);
    }
    return url.startsWith('http') ? url : null;
  };

  const currentEmbedUrl = getMediaEmbedUrl(customization.spotifyTrackUrl || '');

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
        // Search using iTunes API which provides 30s audio previews for free
        const searchRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=10`);
        
        if (!searchRes.ok) throw new Error('Search API error');
        
        const data = await searchRes.json();
        const results = data.results.map((item: any) => ({
          id: String(item.trackId),
          name: item.trackName,
          artist: item.artistName,
          albumArt: item.artworkUrl100,
          spotifyUrl: item.trackViewUrl,
          previewAudioUrl: item.previewUrl,
          category: item.primaryGenreName
        }));
        
        setSearchResults(results.length > 0 ? results : FEATURED_SPOTIFY_TRACKS);
      } catch (error) {
        console.error('Error searching music:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectTrack = (track: SpotifyTrackItem) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingPreviewId(null);
    }
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
              <span>Music Track & Ambient Audio Integration</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                MUSIC SEARCH
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search Music, pick a background song, or embed any custom Spotify track URL.
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
            Search Music
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
            Embed Custom Link Link
          </button>
        </div>
      </div>

      {/* Currently Active Spotify Track Banner */}
      {customization.spotifyTrackUrl && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 shadow-lg mb-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Active Background Music
            </span>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg space-y-2">
            <div className="flex items-center space-x-3 mb-1">
              <Music className="w-4 h-4 text-emerald-500" />
              <div className="flex-1 truncate flex flex-col gap-1.5">
                <input
                  type="text"
                  value={customization.spotifyTrackName || ''}
                  onChange={(e) => onChangeCustomization({ ...customization, spotifyTrackName: e.target.value, musicTrack: e.target.value })}
                  placeholder="Song Title..."
                  className="bg-transparent border-b border-emerald-900 focus:border-emerald-500 text-xs font-bold text-white placeholder-slate-500 outline-none w-full pb-0.5"
                />
                <input
                  type="text"
                  value={customization.spotifyArtistName || ''}
                  onChange={(e) => onChangeCustomization({ ...customization, spotifyArtistName: e.target.value })}
                  placeholder="Artist Name..."
                  className="bg-transparent border-b border-slate-800 focus:border-slate-600 text-[10px] text-slate-400 placeholder-slate-600 outline-none w-full pb-0.5"
                />
              </div>
            </div>
            {customization.spotifyPreviewUrl ? (
              <audio controls src={customization.spotifyPreviewUrl} className="w-full h-8" autoPlay />
            ) : getMediaEmbedUrl(customization.spotifyTrackUrl) ? (
              <iframe
                src={getMediaEmbedUrl(customization.spotifyTrackUrl)!}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
                title="Media Audio Player"
              />
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 1: SPOTIFY TRACK SEARCH */}
      {activeTab === 'search' && (
        <div className="space-y-3">
          <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-lg text-[10px] text-slate-500 flex items-start space-x-2">
            <span className="text-xl">ℹ️</span>
            <p><strong>Note:</strong> API search results only provide <strong>30-second previews</strong> due to copyright limits. For the <strong>FULL song</strong>, please use the "Custom Link" tab to embed a YouTube or SoundCloud URL.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any song or artist... (e.g. Harry Styles, Acoustic, Lo-Fi)..."
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

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {track.previewAudioUrl && (
                      <button
                        onClick={(e) => handleTogglePreview(e, track)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          playingPreviewId === track.id
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-400 hover:text-white'
                        }`}
                        title="Listen to preview"
                      >
                        {playingPreviewId === track.id ? (
                          <Pause className="w-3 h-3 fill-current" />
                        ) : (
                          <Play className="w-3 h-3 ml-0.5 fill-current" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         handleSelectTrack(track);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white'
                      }`}
                      title={isSelected ? "Selected" : "Select track"}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
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
              Paste Any YouTube, Spotify, or SoundCloud Link (Full Songs)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Paste YouTube, Spotify, or SoundCloud link..."
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
                Live Media Player Preview:
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
