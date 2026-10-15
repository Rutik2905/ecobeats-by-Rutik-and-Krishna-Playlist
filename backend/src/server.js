import express from 'express'
import { mixes, tracks } from './data/tracks.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const playlists = new Map([
  ['liked', { id: 'liked', name: 'Liked Songs', trackIds: ['t1', 't4'] }],
  ...mixes.map((mix) => [mix.id, { id: mix.id, name: mix.title, trackIds: [...mix.trackIds] }]),
])

app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'morrow-music-api' })
})

app.get('/api/tracks', (request, response) => {
  const query = String(request.query.q || '').trim().toLowerCase()
  const results = query
    ? tracks.filter((track) => `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query))
    : tracks
  response.json(results)
})

app.get('/api/tracks/:trackId', (request, response) => {
  const track = tracks.find((item) => item.id === request.params.trackId)
  if (!track) return response.status(404).json({ error: 'Track not found' })
  return response.json(track)
})

app.get('/api/mixes', (_request, response) => {
  response.json(mixes)
})

app.get('/api/playlists', (_request, response) => {
  response.json([...playlists.values()].map((playlist) => ({
    ...playlist,
    tracks: playlist.trackIds.map((id) => tracks.find((track) => track.id === id)).filter(Boolean),
  })))
})

app.post('/api/playlists', (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  if (!name) return response.status(400).json({ error: 'Playlist name is required' })
  const playlist = { id: `p${Date.now()}`, name, trackIds: [] }
  playlists.set(playlist.id, playlist)
  return response.status(201).json(playlist)
})

app.post('/api/playlists/:playlistId/tracks', (request, response) => {
  const playlist = playlists.get(request.params.playlistId)
  if (!playlist) return response.status(404).json({ error: 'Playlist not found' })
  const track = tracks.find((item) => item.id === request.body?.trackId)
  if (!track) return response.status(404).json({ error: 'Track not found' })
  if (!playlist.trackIds.includes(track.id)) playlist.trackIds.push(track.id)
  return response.status(200).json({ ...playlist, tracks: playlist.trackIds.map((id) => tracks.find((item) => item.id === id)) })
})

app.delete('/api/playlists/:playlistId/tracks/:trackId', (request, response) => {
  const playlist = playlists.get(request.params.playlistId)
  if (!playlist) return response.status(404).json({ error: 'Playlist not found' })
  playlist.trackIds = playlist.trackIds.filter((id) => id !== request.params.trackId)
  return response.status(204).end()
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API route not found' })
})

app.listen(port, () => {
  console.log(`Morrow API listening on http://localhost:${port}`)
})
