import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { Leaderboards } from './pages/Leaderboards';
import { Challenges } from './pages/Challenges';
import { ChallengeDetail } from './pages/ChallengeDetail';
import { Coach } from './pages/Coach';
import { TrainerDashboard } from './pages/TrainerDashboard';
import { PublicProfile } from './pages/PublicProfile';
import { Settings } from './pages/Settings';
import { Friends } from './pages/Friends';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { useAuthStore } from './lib/auth';
import { initializeProfileSync, useAppStore } from './data/store';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, allowUnonboarded = false }: { children: React.ReactNode, allowUnonboarded?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();
  const isOnboarded = useAppStore(state => state.isOnboarded);
  
  // Check if we are trying to access a demo profile
  const match = location.pathname.match(/^\/profile\/([^/]+)/);
  const isDemoProfile = match && ['musaveer', 'dhavanesh', 'sumith'].includes(match[1]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Allow unauthenticated access ONLY to demo profiles
  if (!isAuthenticated || !user) {
    if (isDemoProfile) {
      return <>{children}</>;
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (!allowUnonboarded && !isOnboarded) {
    // Don't redirect demo profiles to onboarding
    if (isDemoProfile) return <>{children}</>;
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AppShellWrapper() {
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (user?.id) {
      initializeProfileSync(user.id);
    }
  }, [user?.id]);

  // Prevent users from accessing other profiles by URL tweaking
  // We force them to use their own profile ID based on auth
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (user?.id) {
      const match = location.pathname.match(/^\/profile\/([^/]+)/);
      if (match && match[1] !== user.id && match[1] !== 'demo') {
         // Replace with their true ID
         navigate(location.pathname.replace(`/profile/${match[1]}`, `/profile/${user.id}`), { replace: true });
      }
    }
  }, [location, user, navigate]);

  return (
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
        <Route path="leaderboards" element={<Leaderboards />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="challenges/:slug" element={<ChallengeDetail />} />
        <Route path="coach" element={<Coach />} />
        <Route path="trainer" element={<TrainerDashboard />} />
        <Route path="friends" element={<Friends />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </AppShell>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute allowUnonboarded={true}>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/:profileId/*",
    element: (
      <ProtectedRoute>
        <AppShellWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: "/u/:username",
    element: (
      <ProtectedRoute>
        <AppShell>
          <PublicProfile />
        </AppShell>
      </ProtectedRoute>
    )
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  }
]);

function App() {
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <RouterProvider router={router} />;
}

export default App;
