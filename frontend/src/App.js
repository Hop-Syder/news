import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Annuaire from "@/pages/Annuaire";
import Contact from "@/pages/Contact";
import EmailConfirmation from "@/pages/EmailConfirmation";
import MaCarte from "@/pages/MaCarte";
import MonProfil from "@/pages/MonProfil";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jaune-soleil" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/annuaire" element={<Annuaire />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/confirmation-email" element={<EmailConfirmation />} />
              <Route
                path="/ma-carte"
                element={
                  <ProtectedRoute>
                    <MaCarte />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mon-profil"
                element={
                  <ProtectedRoute>
                    <MonProfil />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard" element={<Navigate to="/ma-carte" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
