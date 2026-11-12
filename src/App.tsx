import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './landing/LandingPage';
import { AuthPage } from './auth/AuthPage';
import { SignUpPage } from './auth/SignUpPage';
import { RequireRole } from './auth/RequireRole';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { ProviderDashboard } from './provider/ProviderDashboard';
import { EventsPage } from './provider/EventsPage';
import { EventPage } from './provider/EventPage';
import { SessionPage } from './provider/SessionPage';
import { ProviderSessionsPage } from './provider/ProviderSessionsPage';
import { ProviderSearchPage } from './provider/ProviderSearchPage';
import { ParticipantHome } from './participant/ParticipantHome';
import { ParticipantEventsPage } from './participant/ParticipantEventsPage';
import { ParticipantSessionsPage } from './participant/ParticipantSessionsPage';
import { ParticipantSearchPage } from './participant/ParticipantSearchPage';
import { ExploreEventsPage } from './participant/ExploreEventsPage';
import { ParticipantEventPage } from './participant/ParticipantEventPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/provider"
        element={
          <RequireRole role="provider">
            <ProviderDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/provider/events"
        element={
          <RequireRole role="provider">
            <EventsPage />
          </RequireRole>
        }
      />
      <Route
        path="/provider/events/:eventId"
        element={
          <RequireRole role="provider">
            <EventPage />
          </RequireRole>
        }
      />
      <Route
        path="/provider/sessions"
        element={
          <RequireRole role="provider">
            <ProviderSessionsPage />
          </RequireRole>
        }
      />
      <Route
        path="/provider/sessions/:sessionId"
        element={
          <RequireRole role="provider">
            <SessionPage />
          </RequireRole>
        }
      />
      <Route
        path="/provider/search"
        element={
          <RequireRole role="provider">
            <ProviderSearchPage />
          </RequireRole>
        }
      />
      <Route
        path="/provider/profile"
        element={
          <RequireRole role="provider">
            <ProfilePage role="provider" />
          </RequireRole>
        }
      />
      <Route
        path="/provider/settings"
        element={
          <RequireRole role="provider">
            <SettingsPage role="provider" />
          </RequireRole>
        }
      />
      <Route
        path="/participant"
        element={
          <RequireRole role="participant">
            <ParticipantHome />
          </RequireRole>
        }
      />
      <Route
        path="/participant/explore"
        element={
          <RequireRole role="participant">
            <ExploreEventsPage />
          </RequireRole>
        }
      />
      <Route
        path="/participant/events/:id"
        element={
          <RequireRole role="participant">
            <ParticipantEventPage />
          </RequireRole>
        }
      />
      <Route
        path="/participant/events"
        element={
          <RequireRole role="participant">
            <ParticipantEventsPage />
          </RequireRole>
        }
      />
      <Route
        path="/participant/sessions"
        element={
          <RequireRole role="participant">
            <ParticipantSessionsPage />
          </RequireRole>
        }
      />
      <Route
        path="/participant/search"
        element={
          <RequireRole role="participant">
            <ParticipantSearchPage />
          </RequireRole>
        }
      />
      <Route
        path="/participant/profile"
        element={
          <RequireRole role="participant">
            <ProfilePage role="participant" />
          </RequireRole>
        }
      />
      <Route
        path="/participant/settings"
        element={
          <RequireRole role="participant">
            <SettingsPage role="participant" />
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
