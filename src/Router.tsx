import { BrowserRouter, Route, Routes } from "react-router-dom";

import GalleryPage from "./pages/GalleryPage";
import UploadPage from "./pages/UploadPage";
import NotFound from "./pages/NotFound";
import { ZertuhPage } from "./pages/ZertuhPage";

export const AppRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="zertuh" element={<ZertuhPage />} />
      </Routes>
    </BrowserRouter>
  );
};
