import { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Editor from './Editor';
import electronLogo from '../assets/flower-svgrepo-com.svg';
import './Dashboard.css';

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
    <div className="dashboard-container">
      
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          
          {/* App Header Logo */}
          <div className="dashboard-logo-container">
             <img src={electronLogo} alt="App Logo" className="dashboard-logo" />
             <h2 className="dashboard-title">Vi-Notes</h2>
          </div>

          {/* User Profile Area */}
          <div className="dashboard-user-profile">
            <div className="dashboard-avatar">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div className="dashboard-user-info">
              <p className="dashboard-user-name">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </p>
              <p className="dashboard-signout-btn" onClick={handleSignOut}>
                Sign Out
              </p>
            </div>
          </div>

          <button 
            onClick={createNewChat} disabled={loading}
            className="dashboard-new-note-btn"
          >
            + New Note
          </button>
        </div>

        {/* Chat List Area */}
        <div className="dashboard-chat-list-container">
          <h3 className="dashboard-chat-list-title">
            Your Sessions
          </h3>
          
          <div className="dashboard-chat-list">
            {chats.map(chat => (
              <div 
                key={chat.id} onClick={() => handleActiveChat(chat.id, chat.content)}
                className={`dashboard-chat-item ${activeChatId === chat.id ? 'active' : ''}`}
              >
                {chat.title}
              </div>
            ))}
            
            {chats.length === 0 && !loading && (
              <p className="dashboard-no-sessions">
                No sessions yet.
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main View - Editor */}
      <main className="dashboard-main">
         <Editor chatId={activeChatId} initialContent={initialContent} />
      </main>

    </div>
  );
}
