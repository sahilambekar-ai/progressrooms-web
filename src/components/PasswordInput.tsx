'use client';
import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  type?: 'password';
  revealed?: boolean;
  onRevealChange?: (revealed: boolean) => void;
  visibilityLabel?: string;
};

/** A shared masked input; controlled visibility supports protected credential retrieval. */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput({
  type: _type, revealed, onRevealChange, visibilityLabel = 'password', className = '', id, disabled, ...props
}, ref) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  const shown = revealed ?? visible;
  return <span className="relative block min-w-0 w-full">
    <input {...props} ref={ref} id={inputId} disabled={disabled} type={shown ? 'text' : 'password'} className={`${className} !pr-10`} />
    <button type="button" disabled={disabled} aria-controls={inputId} aria-pressed={shown}
      aria-label={`${shown ? 'Hide' : 'Show'} ${visibilityLabel}`} title={`${shown ? 'Hide' : 'Show'} ${visibilityLabel}`}
      onClick={() => { if (onRevealChange) onRevealChange(!shown); else setVisible(!shown); }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-slate-500 hover:text-[#133623] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2D7A58] disabled:opacity-40">
      {shown ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
    </button>
  </span>;
});
