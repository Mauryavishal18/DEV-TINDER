import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AboutPage from "./pages/AboutPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ConnectionsPage from "./pages/ConnectionsPage";
import RequestsPage from "./pages/RequestsPage";
import ChatPage from "./pages/ChatPage";
import AIPage from "./pages/AIPage";
import AICodeReviewPage from "./pages/AICodeReviewPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CollabPage from "./pages/CollabPage";
import JobsPage from "./pages/JobsPage";
import HackathonPage from "./pages/HackathonPage";
import ResumePage from "./pages/ResumePage";
import SettingsPage from "./pages/SettingsPage";
import OpenSourcePage from "./pages/OpenSourcePage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfilePage from "./pages/UserProfilePage";
import BlindDevDatePage from "./pages/BlindDevDatePage";
import DevDNAPage from "./pages/DevDNAPage";
import DevWorldCupPage from "./pages/DevWorldCupPage";
import DevGamesPage from "./pages/DevGamesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="chat/:userId?" element={<ChatPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="code-review" element={<AICodeReviewPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="collab" element={<CollabPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="hackathons" element={<HackathonPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="opensource" element={<OpenSourcePage />} />
        <Route path="user/:userId" element={<UserProfilePage />} />
        <Route path="blind-date" element={<BlindDevDatePage />} />
        <Route path="dev-dna" element={<DevDNAPage />} />
        <Route path="world-cup" element={<DevWorldCupPage />} />
        <Route path="games" element={<DevGamesPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
