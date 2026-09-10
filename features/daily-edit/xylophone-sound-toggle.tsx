'use client';

export default function XylophoneSoundToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      className="xylophone-sound-toggle"
      type="button"
      aria-pressed={enabled}
      onClick={() => onChange(!enabled)}
    >
      SOUND {enabled ? 'ON' : 'OFF'}
    </button>
  );
}
