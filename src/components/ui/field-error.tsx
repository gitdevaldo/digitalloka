'use client';

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="text-[0.72rem] font-semibold mt-0.5" style={{ color: 'var(--secondary, #e11d48)' }}>
      {message}
    </span>
  );
}
