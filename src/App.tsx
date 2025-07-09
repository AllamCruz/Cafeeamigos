import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Waiter from './pages/Waiter';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import WelcomeScreen from './components/Welcome/WelcomeScreen';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useWelcome } from './hooks/useWelcome';

const AppContent: React.FC = () => {
  const { showWelcome, dismissWelcome } = useWelcome();
  const { isAuthenticated, isAdmin, isWaiter, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#532b1b]"></div>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomeScreen onEnter={dismissWelcome} />;
  }

  return (
    <div className="min-h-screen bg-[#fcf8f3] flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/admin/*" 
            element={
              <Admin />
            } 
          />
          <Route 
            path="/waiter" 
            element={
              <Waiter />
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;