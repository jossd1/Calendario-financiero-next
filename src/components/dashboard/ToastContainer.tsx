"use client";

import type { BottomToast } from "@/hooks/useDashboardState";

interface ToastContainerProps {
  toasts: BottomToast[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="bottom-toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="bottom-toast">
          {t.texto}
        </div>
      ))}
    </div>
  );
}