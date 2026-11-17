import { BrowserRouter, Route, Routes } from "react-router-dom";

import GalleryPage from "./pages/GalleryPage";
import UploadPage from "./pages/UploadPage";
import NotFound from "./pages/NotFound";
import { ZertuhPage } from "./pages/ZertuhPage";
import { Layout } from "./pages/Layout";

export const AppRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<GalleryPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="zertuh" element={<ZertuhPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
