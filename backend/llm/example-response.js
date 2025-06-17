export default `
<zapArtifact id="beautiful-home-page" title="Beautiful Home Page with Header">
<info>
I've created a beautiful home page with a header that includes the dark mode toggle. The design features a hero section, a simple features section, and a footer, all styled with Tailwind CSS and responsive for various screen sizes.
</info>
<zapAction type="shell">
mkdir -p src/components
</zapAction>
<zapAction type="file" filePath="src/components/Header.tsx">
import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton";
import { Link } from "react-router";
import { Home as HomeIcon } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <HomeIcon size={24} />
          My App
        </Link>
        <div className="flex items-center gap-4">
          {/* Add more nav links here if needed */}
          <DarkModeToggleButton />
        </div>
      </nav>
    </header>
  );
};
export default Header;
</zapAction>
<zapAction type="file" filePath="src/App.tsx">
import { Routes, Route } from "react-router";
import Home from "@/pages/Home";
import Header from "@/components/Header";

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
};
export default App;
</zapAction>
<zapAction type="file" filePath="src/pages/Home.tsx">
import { Link } from "react-router";
import { Zap, Sparkles, Rocket } from "lucide-react";

const Home = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative flex flex-1 items-center justify-center py-20 md:py-32 lg:py-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-gray-900 dark:text-white leading-tight">
            Welcome to <span className="text-indigo-600 dark:text-indigo-400">My Awesome App</span>
          </h1>
          <p className="mt-6 text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the future of productivity with our innovative solutions designed to simplify your life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="#"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Get Started
            </Link>
            <Link
              to="#"
              className="inline-flex items-center justify-center rounded-full border border-indigo-600 px-8 py-3 text-lg font-medium text-indigo-600 shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-800"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105">
              <Zap size={48} className="text-indigo-600 dark:text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blazing Fast</h3>
              <p className="text-center text-gray-700 dark:text-gray-300">
                Experience unparalleled speed and performance with our optimized platform.
              </p>
            </div>
            <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105">
              <Sparkles size={48} className="text-indigo-600 dark:text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Intuitive Design</h3>
              <p className="text-center text-gray-700 dark:text-gray-300">
                Enjoy a seamless user experience with our clean and modern interface.
              </p>
            </div>
            <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105">
              <Rocket size={48} className="text-indigo-600 dark:text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Future-Proof</h3>
              <p className="text-center text-gray-700 dark:text-gray-300">
                Built with scalability in mind to grow with your needs.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} My Awesome App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default Home;
</zapAction>
<zapAction type="shell">
pnpm install
</zapAction>
<zapAction type="shell">
pnpm run dev
</zapAction>
</zapArtifact>
`