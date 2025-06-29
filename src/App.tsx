import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import WelcomeScreen from './components/Welcome/WelcomeScreen';
import { AuthProvider } from './hooks/useAuth';
import { useWelcome } from './hooks/useWelcome';

const AppContent: React.FC = () => {
  const { showWelcome, dismissWelcome } = useWelcome();

  if (showWelcome) {
    return <WelcomeScreen onEnter={dismissWelcome} />;
  }

  return (
    <div className="min-h-screen bg-[#fcf8f3] flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<Admin />} />
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