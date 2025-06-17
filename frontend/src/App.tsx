import { Routes, Route, Navigate } from "react-router-dom";
import { Home, Chat, Auth } from "@/pages";
import { useAuth } from "./features/auth";
import { Toaster } from "./components/ui/sonner";

const NotFound = () => {
  return <div className="flex items-center justify-center h-screen bg-white text-black dark:text-white dark:bg-black text-xl">
    Page Not Found!
  </div>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, authLoading } = useAuth();

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return children;
};

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
