import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./features/auth";
import { Toaster } from "./components/ui/sonner";
import { Home } from "./pages";
import React, { useEffect } from "react";
import Sidebar from "./components/sidebar/index.tsx";
import { toast } from "sonner";
import { useRootContext } from "./contexts/root-context/useRootContext.ts";

const Chat = React.lazy(() => import("./pages/chat/Chat.tsx"));
const Auth = React.lazy(() => import("./pages/auth/Auth.tsx"));

const NotFound = () => {
  return <div className="flex items-center justify-center h-screen bg-white text-black dark:text-white dark:bg-black text-xl">
    Page Not Found!
  </div>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!session && !authLoading) {
    navigate("/auth");
  }

  return children;
};

const App = () => {
  const { session, authLoading } = useAuth();
  const { setChats } = useRootContext();
  const baseUrl = import.meta.env.VITE_API_URL;

  const getChats = async () => {
    if (!session) {
      setChats([]);
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/all-chats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
      });

      if (!response.ok) {
        toast.error("Error during chats retrieval");
        return;
      }

      const data = await response.json();
      console.log(data);
      if (data.errorMessage) {
        toast.error(data.errorMessage);
        return;
      }
      setChats(data.chats);
    } catch (error) {
      console.error("Error during chats retrieval:", error);
      toast.error("Error during chats retrieval");
    }
  }

  useEffect(() => {
    getChats();
  }, [authLoading, session]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
      <Sidebar />
      <Toaster />
    </>
  );
};

export default App;
