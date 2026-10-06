"use client";

type DefenseAudioSwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onLabel: string;
  offLabel: string;
  disabled?: boolean;
};

/** A native button retains Space, Enter and Tab behavior in both host toolbars. */
export function DefenseAudioSwitch({ label, checked, onCheckedChange, onLabel, offLabel, disabled = false }: DefenseAudioSwitchProps) {
  return (
    <button
      type="button"
      className="defense-audio-switch"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="defense-switch-label">{label}</span>
      <span className="defense-switch-state" aria-hidden="true">{checked ? onLabel : offLabel}</span>
      <span className="defense-switch-track" aria-hidden="true"><span className="defense-switch-thumb" /></span>
    </button>
  );
}
