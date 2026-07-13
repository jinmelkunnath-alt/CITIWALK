import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppRouter } from "@/routes/AppRouter";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  );
}
