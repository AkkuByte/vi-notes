import { useState, useEffect } from 'react';
import { useKeystrokeMonitor } from '../hooks/useKeystrokeMonitor';
import { auth } from '../firebase';
import './Editor.css';

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
        await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${chatId}`, {
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
    <div className="editor-container">
      <div className="editor-wrapper">
        <header className="editor-header">
          <h1 className="editor-title">Vi-Notes Editor</h1>
          <div className="editor-telemetry-badge">
            Telemetry Active
          </div>
        </header>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={chatId ? "Start writing your note..." : "Select or create a note in the sidebar to start writing..."}
          spellCheck="false"
          disabled={!chatId}
          className="editor-textarea"
        />
      </div>
    </div>
  );
}
