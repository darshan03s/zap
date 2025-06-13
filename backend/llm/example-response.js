export default `<zapArtifact id="one-page-app" title="Simple One-Page React App">
  <zapAction type="file" filePath="src/App.tsx">
    import { Routes, Route } from "react-router";
    import Home from "@/pages/Home";

    const App = () => {
      return (
        <>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </>
      );
    };

    export default App;
  </zapAction>
  <zapAction type="file" filePath="src/main.tsx">
    import { createRoot } from "react-dom/client";
    import { BrowserRouter } from "react-router";
    import App from "@/App";
    import "@/index.css";
    import { DarkModeProvider } from "@/features/dark-mode/DarkModeProvider";

    createRoot(document.getElementById("root")!).render(
      <BrowserRouter>
        <DarkModeProvider>
          <App />
        </DarkModeProvider>
      </BrowserRouter>
    );
  </zapAction>
  <zapAction type="file" filePath="src/pages/Home.tsx">
    import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton";
    import { Sparkles } from "lucide-react";

    const Home = () => {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-300">
          <div className="fixed bottom-4 left-4">
            <DarkModeToggleButton />
          </div>

          <main className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <Sparkles size={64} className="text-indigo-600 dark:text-indigo-400 mb-6" />
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              Welcome to Your Amazing App
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              This is a beautifully crafted one-page application, designed with modern web standards and a focus on user experience. Enjoy the seamless dark mode toggle!
            </p>
            <button className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300">
              Get Started
            </button>
          </main>

          <footer className="absolute bottom-4 right-4 text-sm opacity-70">
            &copy; {new Date().getFullYear()} Zap App. All rights reserved.
          </footer>
        </div>
      );
    };

    export default Home;
  </zapAction>
  <zapAction type="shell">
    npm install
  </zapAction>
  <zapAction type="shell">
    npm run dev
  </zapAction>
</zapArtifact>`;
