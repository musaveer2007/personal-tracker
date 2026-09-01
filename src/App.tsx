import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

import { Home } from './pages/Home';
import { Overview as CommandCenter } from './pages/Overview';
import { Today } from './pages/Today';
import { Workout } from './pages/Workout';
import { Running } from './pages/Running';
import { Nutrition } from './pages/Nutrition';
import { Water } from './pages/Water';
import { Body } from './pages/Body';
import { Recovery } from './pages/Recovery';
import { Skincare } from './pages/Skincare';
import { Haircare } from './pages/Haircare';
import { Progress } from './pages/Progress';
import { CalendarView } from './pages/CalendarView';
import { Journal } from './pages/Journal';
import { Achievements } from './pages/Achievements';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/profile/:profileId/*" element={
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="command-center" replace />} />
              <Route path="command-center" element={<CommandCenter />} />
              <Route path="today" element={<Today />} />
              <Route path="workout" element={<Workout />} />
              <Route path="running" element={<Running />} />
              <Route path="nutrition" element={<Nutrition />} />
              <Route path="water" element={<Water />} />
              <Route path="body" element={<Body />} />
              <Route path="recovery" element={<Recovery />} />
              <Route path="skincare" element={<Skincare />} />
              <Route path="haircare" element={<Haircare />} />
              <Route path="progress" element={<Progress />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="journal" element={<Journal />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </AppShell>
        } />
        
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
