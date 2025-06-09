import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton";
import WCWorkspace from "@/features/react-wc-workspace";
const Home = () => {
  return (
    <div className="min-h-screen h-full flex items-center justify-center p-2 dark:bg-gray-900 bg-gray-100">
      <div className="fixed top-2 right-2">
        <DarkModeToggleButton />
      </div>
      <div className="w-[70%] h-[600px]">
        <WCWorkspace />
      </div>
    </div>
  );
};

export default Home;
