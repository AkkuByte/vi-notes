import { useState, useEffect } from 'react';
import { useKeystrokeMonitor } from '../hooks/useKeystrokeMonitor';
import { auth } from '../firebase';

export default function Editor({ chatId, initialContent }: { chatId?: string, initialContent?: string }) {
  const userId = auth.currentUser?.uid;
  // The hook safely runs here because this component only exists when authenticated
  useKeystrokeMonitor(chatId, userId);
  const [text, setText] = useState('');

  // Reset text when switching chats
  useEffect(() => {
    setText(initialContent || '');
  }, [chatId, initialContent]);

  // Debounce saving to database
  useEffect(() => {
    if (!chatId) return;

    const timeoutId = setTimeout(async () => {
      try {
        await fetch(`http://localhost:5000/api/sessions/${chatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text })
        });
      } catch (err) {
        console.error("Failed to save session content:", err);
      }
    }, 1000); // Wait 1 second after typing stops to auto-save

    return () => clearTimeout(timeoutId);
  }, [text, chatId]);

  return (
    <div style={{ 
      flex: 1, backgroundColor: '#f9fafb', padding: '40px 60px', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      height: '100%', boxSizing: 'border-box' 
    }}>
      <div style={{ width: '100%', maxWidth: '800px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>Vi-Notes Editor</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}></div>
            <span style={{ fontSize: '12px', color: '#047857', fontWeight: 600 }}>Telemetry Active</span>
          </div>
        </header>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={chatId ? "Start writing your note..." : "Select or create a note in the sidebar to start writing..."}
          spellCheck="false"
          disabled={!chatId}
          style={{ 
            flex: 1, width: '100%', padding: '32px', fontSize: '18px', lineHeight: '1.6',
            border: 'none', borderRadius: '16px', resize: 'none', outline: 'none', 
            backgroundColor: '#ffffff', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.05)', 
            color: '#374151', fontFamily: "'Inter', system-ui, sans-serif",
            opacity: chatId ? 1 : 0.6, transition: 'opacity 0.2s'
          }}
        />
      </div>
    </div>
  );
}
