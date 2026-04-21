import { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Editor from './Editor';

interface Chat {
  id: string;
  title: string;
  content?: string;
  createdAt: any;
}

export default function Dashboard({ user }: { user: User }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [initialContent, setInitialContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch from Local MongoDB server
  const fetchSessions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${user.uid}`);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setChats(data);
      
      // Auto-select first chat if none is selected
      if (data.length > 0 && !activeChatId) {
        setActiveChatId(data[0].id);
        setInitialContent(data[0].content || '');
      }
    } catch (error) {
      console.error("Failed to load sessions from server. Make sure backend is running.", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user.uid]);

  const createNewChat = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, title: `Note ${chats.length + 1}` })
      });
      const newChatData = await response.json();
      
      setChats([newChatData, ...chats]);
      setActiveChatId(newChatData.id);
      setInitialContent('');
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActiveChat = (id: string, content?: string) => {
    setActiveChatId(id);
    setInitialContent(content || '');
  };

  const handleSignOut = () => {
    signOut(auth).catch(console.error);
  };

  return (
    <div style={{ 
      display: 'flex', height: '100vh', width: '100vw', 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
      backgroundColor: '#f3f4f6', overflow: 'hidden' 
    }}>
      
      {/* Sidebar - Glassmorphism Design */}
      <aside style={{
        width: '320px',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
        zIndex: 10
      }}>
        <div style={{ padding: '32px 24px 24px 24px' }}>
          {/* User Profile Area */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '12px', 
              backgroundColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontWeight: '700', fontSize: '18px', marginRight: '14px',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
            }}>
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#111827', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', cursor: 'pointer', fontWeight: 500, marginTop: '2px', transition: 'color 0.2s' }} 
                 onClick={handleSignOut}
                 onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                 onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Sign Out
              </p>
            </div>
          </div>

          <button 
            onClick={createNewChat} 
            disabled={loading}
            style={{ 
              width: '100%', padding: '14px', backgroundColor: '#111827', 
              color: 'white', border: 'none', borderRadius: '12px', 
              fontWeight: 600, fontSize: '14px', cursor: 'pointer', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              gap: '8px', transition: 'transform 0.1s, opacity 0.2s', 
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '18px', fontWeight: 400 }}>+</span> New Note
          </button>
        </div>

        {/* Chat List Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px 16px' }}>
          <h3 style={{ 
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', 
            color: '#9ca3af', marginBottom: '16px', paddingLeft: '12px', fontWeight: 700 
          }}>
            Your Sessions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {chats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => handleActiveChat(chat.id, chat.content)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  backgroundColor: activeChatId === chat.id ? 'rgba(17, 24, 39, 0.05)' : 'transparent',
                  color: activeChatId === chat.id ? '#111827' : '#4b5563',
                  fontWeight: activeChatId === chat.id ? 600 : 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: activeChatId === chat.id ? 'rgba(17, 24, 39, 0.05)' : 'transparent'
                }}
              >
                {chat.title}
              </div>
            ))}
            
            {chats.length === 0 && !loading && (
              <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>📄</div>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                  No sessions yet.<br/>Start writing a new note.
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main View - Editor */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
         <Editor chatId={activeChatId} initialContent={initialContent} />
      </main>

    </div>
  );
}
