import { BrowserRouter } from "react-router-dom";
import { AppErrorBoundary } from "@/components/errors/AppErrorBoundary";
import { ConnectionStatus } from "@/components/errors/ConnectionStatus";
import { AppProviders } from "@/components/providers/AppProviders";
import { PwaUpdatePrompt } from "@/components/pwa/PwaUpdatePrompt";
import { AppRouter } from "@/routes/AppRouter";

export default function App() {
  return (
    <AppProviders>
      <AppErrorBoundary>
        <BrowserRouter>
          <AppRouter />
          <ConnectionStatus />
          <PwaUpdatePrompt />
        </BrowserRouter>
      </AppErrorBoundary>
    </AppProviders>
  );
}
