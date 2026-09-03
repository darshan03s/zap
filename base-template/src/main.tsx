import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Router } from './Router'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toast'
import { TooltipProvider } from './components/ui/tooltip'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <TooltipProvider>
    <BrowserRouter>
      <ThemeProvider disableTransitionOnChange attribute="class">
        <Router />
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  </TooltipProvider>
)
