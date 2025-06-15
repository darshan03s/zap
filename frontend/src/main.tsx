import { scan } from "react-scan";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "@/App";
import "@/index.css";
import { DarkModeProvider } from "@/features/dark-mode/DarkModeProvider";
import WebContainerProvider from "@/features/react-wc-workspace/webcontainer/WebContainerProvider";
import TerminalProvider from "@/features/react-wc-workspace/terminal/TerminalProvider";
import { RootProvider } from "@/contexts/root-context";

if (import.meta.env.DEV) {
  scan({
    enabled: true,
  });
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RootProvider>
      <DarkModeProvider>
        <WebContainerProvider>
          <TerminalProvider>
            <App />
          </TerminalProvider>
        </WebContainerProvider>
      </DarkModeProvider>
    </RootProvider>
  </BrowserRouter>
);
