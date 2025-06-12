import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import ImageDetailsPage from "./pages/ImageDetailsPage"; // make sure this exists

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/details/:id" element={<ImageDetailsPage />} />
      <Route
        path="*"
        element={
          <div style={{ textAlign: "center", padding: "50px" }}>
            404 Not Found
          </div>
        }
      />
    </Routes>
  );
}

