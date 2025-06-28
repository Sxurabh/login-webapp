// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('');

  const runLogin = async () => {
    setStatus('Running…');
    try {
      const r = await fetch('/api/login');
      const j = await r.json();
      setStatus(`${j.status}: ${j.message}`);
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <h1>HimalayanUniversity Login Check</h1>
      <button
        onClick={runLogin}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Run Check
      </button>
      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </main>
  );
}
