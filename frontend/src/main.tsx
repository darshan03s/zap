import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "@/App";
import "@/index.css";
import { DarkModeProvider } from "@/features/dark-mode/DarkModeProvider";
import WebContainerProvider from "@/features/react-wc-workspace/webcontainer/WebContainerProvider";
import TerminalProvider from "@/features/react-wc-workspace/terminal/TerminalProvider";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <DarkModeProvider>
      <WebContainerProvider>
        <TerminalProvider>
          <App />
        </TerminalProvider>
      </WebContainerProvider>
    </DarkModeProvider>
  </BrowserRouter>
);
