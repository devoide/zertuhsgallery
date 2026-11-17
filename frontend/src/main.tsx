import { createRoot } from "react-dom/client";
import { Provider } from "./components/ui/provider";
import { AppRoute } from "./Router";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <AppRoute />
  </Provider>
);
