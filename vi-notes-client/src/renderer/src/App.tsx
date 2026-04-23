import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Login from './login'; // Note: Ensure this matches your file name exactly
import Dashboard from './components/Dashboard';
import './App.css';

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
      <div className="app-loading-container">
        <div className="app-loading-content">
          <div className="app-loading-spinner"></div>
          <p>Loading Vi-Notes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => { }} />;
  }

  // If we get past the loading and auth checks, show the dashboard!
  return <Dashboard user={user} />;
}

export default App;