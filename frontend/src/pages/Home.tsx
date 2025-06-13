import Chat from "@/components/chat";
import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton";
import WCWorkspace from "@/features/react-wc-workspace";
import { useWebContainer } from "@/features/react-wc-workspace/webcontainer/useWebContainer";
import { useEffect } from "react";
const Home = () => {
  const { setWcFiles } = useWebContainer();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const projectTemplateUrl = `${baseUrl}/project-template`;

    async function getProjectTemplate() {
      const response = await fetch(projectTemplateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ template: "reacttsx" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWcFiles(data);

    }
    getProjectTemplate();
  }, []);

  return (
    <>
      <div
        className="header bg-gray-100 dark:bg-gray-900 dark:text-white flex items-center justify-between px-2 w-full h-[40px]">
        <div className="header-left"></div>
        <div className="header-right">
          <DarkModeToggleButton />
        </div>
      </div>
      <div className="main min-h-[calc(100vh-40px)] w-full flex items-center gap-4 justify-between px-8 py-4 bg-white dark:bg-gray-900">
        <div className="main-left w-[30%] h-[600px]">
          <Chat />
        </div>
        <div className="main-right w-[70%] h-[600px] rounded-lg">
          <WCWorkspace />
        </div>
      </div>
    </>
  );
};

export default Home;
