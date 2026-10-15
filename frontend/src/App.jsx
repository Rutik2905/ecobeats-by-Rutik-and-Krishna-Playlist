import { useState } from 'react'
import { AudioLines, House, Library, LogOut, Search, Sparkles } from 'lucide-react'
import './App.css'
import './EcoBeats.css'
import AuthScreen from './AuthScreen.jsx'
import ecobeatsLogo from './assets/Ecobeats.png'
import rutikSongsCover from './assets/favrite2.jpg'

const playlists = [
  {
    id: 'rutik-songs',
    name: 'Rutik Songs',
    creator: 'Rutik gharmode',
    description: 'A personal rotation for wherever the day takes you. Keep it close, keep it playing.',
    cover: rutikSongsCover,
    spotifyId: '4u0gQ4w4hOj8ShLxNJ9ZRO',
    songs: '9 songs',
  },
  {
    id: 'code-focus',
    name: 'Code & Focus',
    creator: 'Krishna Patil Rajput',
    description: 'The soundtrack behind the code. Curated to fuel creativity, deep focus, and late-night sessions.',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84f00d59fe32bcd3a5148b70fc',
    spotifyId: '2TCiHgYtlR4QGikdLbWvXy',
    songs: 'Focus playlist',
  },
]

function App() {
  const [authSession, setAuthSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('morrow.auth.session') || sessionStorage.getItem('morrow.auth.session') || 'null')
    } catch {
      return null
    }
  })
  const [activePlaylistId, setActivePlaylistId] = useState(playlists[0].id)
  const activePlaylist = playlists.find((playlist) => playlist.id === activePlaylistId) || playlists[0]
  if (!authSession) return <AuthScreen onAuthenticated={setAuthSession} />

  return (
    <div className="eco-app">
      <aside className="eco-sidebar">
        <a className="eco-brand" href="#home" aria-label="EcoBeats home"><img src={ecobeatsLogo} alt="EcoBeats by Rutik Gharmode" /></a>
        <nav className="eco-primary-nav" aria-label="Main navigation">
          <a className="eco-nav-item" href="#home"><House size={20} /><span>Home</span></a>
          <a className="eco-nav-item" href="#playlist-library"><Search size={20} /><span>Search</span></a>
        </nav>
        <section className="eco-library" id="playlist-library">
          <div className="eco-library-heading"><Library size={19} /><span>Your Library</span><span className="library-count">{String(playlists.length).padStart(2, '0')}</span></div>
          <div className="eco-library-list">{playlists.map((playlist) => <button type="button" className={`eco-library-entry ${activePlaylist.id === playlist.id ? 'selected' : ''}`} key={playlist.id} onClick={() => { setActivePlaylistId(playlist.id); document.querySelector('#playlist-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} aria-current={activePlaylist.id === playlist.id ? 'page' : undefined}><img className="eco-library-art" src={playlist.cover} alt="" /><span><strong>{playlist.name}</strong><small>Playlist · {playlist.creator}</small></span>{activePlaylist.id === playlist.id && <i />}</button>)}</div>
          <div className="eco-sidebar-note"><span>GOOD FOR YOUR EARS.</span><strong>Better for your day.</strong></div>
        </section>
        <div className="eco-sidebar-bottom"><span className="eco-live-dot" /> PLAYING FROM YOUR LIBRARY</div>
      </aside>

      <main className="eco-main" id="home">
        <header className="eco-topbar"><div className="eco-breadcrumb"><span>YOUR LIBRARY</span><i>/</i><strong>PLAYLIST</strong></div><button type="button" className="eco-account" onClick={() => { localStorage.removeItem('morrow.auth.session'); sessionStorage.removeItem('morrow.auth.session'); setAuthSession(null) }}><span>{authSession.name?.slice(0, 1).toUpperCase() || 'A'}</span><b>{authSession.name || 'Listener'}</b><LogOut size={15} /></button></header>
        <div className="eco-content">
          <section className="eco-playlist-hero" aria-labelledby="playlist-title"><img className="eco-cover-art" src={activePlaylist.cover} alt={`${activePlaylist.name} playlist cover`} /><div className="eco-playlist-meta"><span className="eco-overline"><Sparkles size={13} /> ECOBEATS PLAYLIST</span><h1 id="playlist-title">{activePlaylist.name}</h1><p>{activePlaylist.description}</p><div className="eco-playlist-byline"><span className="eco-small-mark"><AudioLines size={12} /></span><strong>{activePlaylist.creator}</strong><span>·</span><span>{activePlaylist.songs}</span><span>·</span><span>Spotify playlist</span></div></div></section>
          <section className="eco-playback" id="playlist-player" aria-labelledby="player-heading"><div className="eco-playback-heading"><div><span className="eco-overline">THE LISTENING ROOM</span><h2 id="player-heading">Your playlist, in full.</h2></div><span className="eco-playing-status"><i /> READY TO PLAY</span></div><div className="eco-spotify-frame"><div className="eco-spotify-topline"><span><i /> CONNECTED PLAYER</span><span>SPOTIFY</span></div><iframe key={activePlaylist.spotifyId} title={`Play ${activePlaylist.name} on this website`} src={`https://open.spotify.com/embed/playlist/${activePlaylist.spotifyId}?utm_source=generator`} width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="eager" /></div></section>
          <footer className="eco-footer"><span>MADE WITH CARE, PLAYED ON REPEAT.</span><span>ONE PLAYLIST <i>·</i> ALL YOURS</span></footer>
        </div>
      </main>
    </div>
  )
}

export default App
