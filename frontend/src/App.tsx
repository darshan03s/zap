import { Routes, Route } from "react-router";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";

const NotFound = () => {
  return <div className="flex items-center justify-center h-screen bg-white text-black dark:text-white dark:bg-black text-xl">
    Page Not Found!
  </div>;
};

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
