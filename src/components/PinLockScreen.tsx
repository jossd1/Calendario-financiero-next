"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PinLockScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [verificando, setVerificando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setError("Ingresa tu PIN de 4 a 6 dígitos.");
      return;
    }
    setVerificando(true);
    setError("");
    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verificar", pin }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "PIN incorrecto.");
        setPin("");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de red al verificar el PIN.");
    } finally {
      setVerificando(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "var(--bg-canvas)",
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          borderColor: "var(--border-strong)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.65)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔒</div>
          <h1 className="panel-title" style={{ fontSize: "1.2rem" }}>
            Calendario Financiero
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              marginTop: "4px",
            }}
          >
            Ingresa tu PIN para desbloquear tu información financiera.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label htmlFor="pin-unlock-input">PIN de Acceso</label>
            <input
              id="pin-unlock-input"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="input-control tabular-nums"
              style={{
                textAlign: "center",
                fontSize: "1.35rem",
                letterSpacing: "0.35em",
              }}
              autoFocus
              required
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "#f87171",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={verificando}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {verificando ? "Verificando..." : "Desbloquear"}
          </button>
        </form>
      </div>
    </main>
  );
}