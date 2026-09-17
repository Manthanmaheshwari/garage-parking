import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { GarageProvider } from './context/GarageContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { AttendantPortal } from './pages/AttendantPortal';
import { AdminConsole } from './pages/AdminConsole';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <GarageProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/attendant" element={<AttendantPortal />} />
                <Route path="/admin" element={<AdminConsole />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </GarageProvider>
    </ThemeProvider>
  );
};

export default App;
