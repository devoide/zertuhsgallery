import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider";
import { AudioPlayerProvider } from "./audio";
import { AppRoute } from "./Router";

createRoot(document.getElementById("root")!).render(
  <Provider>
    {/* above the router so playback survives page changes */}
    <AudioPlayerProvider>
      <AppRoute />
    </AudioPlayerProvider>
  </Provider>
);
