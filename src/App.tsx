import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAdmin, RequireAuth } from './auth/RequireAuth';
import { Nav } from './components/Nav';
import { AdminPage } from './pages/AdminPage';
import { ChapterPage } from './pages/ChapterPage';
import { ExamPage } from './pages/ExamPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProgressPage } from './pages/ProgressPage';
import { QuizPage } from './pages/QuizPage';
import { RegisterPage } from './pages/RegisterPage';
import { SignsPage } from './pages/SignsPage';
import { StudyPage } from './pages/StudyPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Nav />
          <main className="main">
            <Routes>
              <Route path="/prisijungti" element={<LoginPage />} />
              <Route path="/registracija" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <HomePage />
                  </RequireAuth>
                }
              />
              <Route
                path="/mokytis"
                element={
                  <RequireAuth>
                    <StudyPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/mokytis/:chapterId"
                element={
                  <RequireAuth>
                    <ChapterPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/zenklai"
                element={
                  <RequireAuth>
                    <SignsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/korteles"
                element={
                  <RequireAuth>
                    <FlashcardsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/testas"
                element={
                  <RequireAuth>
                    <QuizPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/egzaminas"
                element={
                  <RequireAuth>
                    <ExamPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/pazanga"
                element={
                  <RequireAuth>
                    <ProgressPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminPage />
                  </RequireAdmin>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
