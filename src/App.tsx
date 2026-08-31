import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

import { Home } from './pages/Home';
import { Overview } from './pages/Overview';
import { Today } from './pages/Today';
import { Workout } from './pages/Workout';
import { Running } from './pages/Running';
import { Nutrition } from './pages/Nutrition';
import { Progress } from './pages/Progress';
import { CalendarView } from './pages/CalendarView';
import { Journal } from './pages/Journal';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/profile/:profileId/*" element={
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="today" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="today" element={<Today />} />
              <Route path="workout" element={<Workout />} />
              <Route path="running" element={<Running />} />
              <Route path="nutrition" element={<Nutrition />} />
              <Route path="progress" element={<Progress />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="journal" element={<Journal />} />
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
