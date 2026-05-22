import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import axios from 'axios';

export default function Player({ token, onDeviceReady, onPlaybackStateChange }) {
  const [player, setPlayer] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (onPlaybackStateChange) {
      onPlaybackStateChange({ currentTrack, isPaused });
    }
  }, [currentTrack, isPaused, onPlaybackStateChange]);

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'NSO Music Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setIsReady(true);
        onDeviceReady(device_id);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    let script = document.getElementById('spotify-player-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'spotify-player-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady();
    }
    
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token]);

  const togglePlayback = async () => {
    try {
      if (isPaused) {
        await axios.put('https://api.spotify.com/v1/me/player/play', {}, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.put('https://api.spotify.com/v1/me/player/pause', {}, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {
      console.error('Error in Web API, falling back to SDK', e);
      player?.togglePlay();
    }
  };

  const handleNext = async () => {
    try {
      await axios.post('https://api.spotify.com/v1/me/player/next', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      player?.nextTrack();
    }
  };

  const handlePrev = async () => {
    try {
      await axios.post('https://api.spotify.com/v1/me/player/previous', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      player?.previousTrack();
    }
  };

  if (!isReady) {
    return (
      <div className="taskbar-player" style={{justifyContent: 'center', color: '#666'}}>
        Iniciando reproductor...
      </div>
    );
  }

  return (
    <div className="taskbar-player">
      <div className="now-playing">
        {currentTrack ? (
          <>
            <img src={currentTrack.album.images[0].url} alt="Album Art" />
            <div className="track-info">
              <h4 className="marquee"><span>{currentTrack.name}</span></h4>
              <p>{currentTrack.artists[0].name}</p>
            </div>
          </>
        ) : (
          <div className="track-info" style={{color: '#666'}}>
            <h4>NO SIGNAL</h4>
            <p>Esperando música...</p>
          </div>
        )}
      </div>
      
      <div className="player-controls">
        <button className="control-btn" onClick={handlePrev}><SkipBack size={16} /></button>
        <button className="control-btn play-btn" onClick={togglePlayback}>
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button className="control-btn" onClick={handleNext}><SkipForward size={16} /></button>
      </div>
      
      <div className="volume-control" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
        <Volume2 size={16} color="#666" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setVolume(val);
            if (player) player.setVolume(val).catch(err => console.error(err));
          }} 
          className="win-slider"
        />
      </div>
    </div>
  );
}
