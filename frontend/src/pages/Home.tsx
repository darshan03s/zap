import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton";
import WCWorkspace from "@/features/react-wc-workspace";
import { streamApi } from "@/api/streamApi";

const Home = () => {
  const handleTestStream = async () => {
    try {
      await streamApi("Create a simple React component");
    } catch (error) {
      console.error('Failed to stream:', error);
    }
  };
  return (
    <div className="min-h-screen h-full flex items-center justify-center p-2 dark:bg-gray-900 bg-gray-100">
      <div className="fixed top-2 right-2">
        <DarkModeToggleButton />
        <button onClick={handleTestStream} className="bg-blue-500 text-white p-2 rounded-md">
          Test Stream
        </button>
      </div>
      <div className="w-[70%] h-[600px]">
        <WCWorkspace />
      </div>
    </div>
  );
};

export default Home;
