'use client';

import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const TRACK_TITLE = 'Carry Me Into the Light';
const STORAGE_KEY = 'background-music:settings';
const DEFAULT_VOLUME = 0.5;

type MusicSettings = {
  muted: boolean;
  volume: number;
};

function readSettings(): MusicSettings {
  if (typeof window === 'undefined') {
    return { muted: false, volume: DEFAULT_VOLUME };
  }
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as
      | Partial<MusicSettings>
      | null;
    const volume =
      typeof saved?.volume === 'number'
        ? Math.min(1, Math.max(0, saved.volume))
        : DEFAULT_VOLUME;
    return {
      muted: saved?.muted === true,
      volume,
    };
  } catch {
    return { muted: false, volume: DEFAULT_VOLUME };
  }
}

function writeSettings(settings: MusicSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hydratedRef = useRef(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const settings = readSettings();
    const audio = audioRef.current;
    if (!audio) return;
    setVolume(settings.volume);
    setMuted(settings.muted);
    audio.volume = settings.volume;
    audio.muted = settings.muted;
    hydratedRef.current = true;

    const startPlayback = () => {
      void audio.play().catch(() => {
        // Browsers may require a user gesture before allowing audio playback.
      });
    };
    startPlayback();
    window.addEventListener('pointerdown', startPlayback, { once: true });
    window.addEventListener('keydown', startPlayback, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startPlayback);
      window.removeEventListener('keydown', startPlayback);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }
    if (hydratedRef.current) writeSettings({ muted, volume });
  }, [muted, volume]);

  const startPlayback = () => {
    void audioRef.current?.play().catch(() => {
      // Playback will be retried by the next user gesture.
    });
  };

  return (
    <div className="background-music" aria-label={`背景音乐：${TRACK_TITLE}`}>
      {/* This is non-speech background music; captions do not apply. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        className="background-music__audio"
        src="/audio/carry-me-into-the-light.mp3"
        loop
        preload="auto"
        aria-label={TRACK_TITLE}
      />
      <button
        className="background-music__toggle"
        type="button"
        aria-label={muted ? `取消静音：${TRACK_TITLE}` : `静音：${TRACK_TITLE}`}
        aria-pressed={muted}
        title={TRACK_TITLE}
        onPointerDown={startPlayback}
        onClick={() => setMuted((value) => !value)}
      >
        {muted || volume === 0 ? (
          <VolumeX aria-hidden="true" />
        ) : volume < 0.5 ? (
          <Volume1 aria-hidden="true" />
        ) : (
          <Volume2 aria-hidden="true" />
        )}
      </button>
      <label className="background-music__volume">
        <span className="sr-only">背景音乐音量</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          aria-label={`调节背景音乐音量：${TRACK_TITLE}`}
          onPointerDown={startPlayback}
          onChange={(event) => setVolume(Number(event.target.value))}
        />
      </label>
    </div>
  );
}
