import type { RouteObject } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";

import GalleryPage from "./pages/GalleryPage";
import UploadPage from "./pages/UploadPage";
import NotFound from "./pages/NotFound";
import { ZertuhPage } from "./pages/ZertuhPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <GalleryPage />,
  },
  {
    path: "/upload",
    element: <UploadPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/zertuh",
    element: <ZertuhPage />,
  },
];

export const router = createBrowserRouter(routes);
