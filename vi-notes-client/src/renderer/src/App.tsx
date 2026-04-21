import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Login from './login'; // Note: Ensure this matches your file name exactly
import Dashboard from './components/Dashboard';

// Main App Component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'system-ui' 
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{
            width: '30px', height: '30px', border: '3px solid #e5e7eb',
            borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 16px auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{"@keyframes spin { 100% { transform: rotate(360deg); } }"}</style>
          <p>Loading Vi-Notes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  // If we get past the loading and auth checks, show the dashboard!
  return <Dashboard user={user} />;
}

export default App;