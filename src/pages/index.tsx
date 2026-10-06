import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import { BrandLoader } from "../components/ui/BrandLoader";
import Homepage from "./Homepage";

// Homepage is the landing route, so it stays in the main bundle. Secondary routes
// are code-split and fetched on demand (the <Suspense> boundary lives in Layout).
const Projects = lazy(() => import("./Projects"));
const AboutMe = lazy(() => import("./AboutMe"));
const NotFound = lazy(() => import("./404NotFound"));
// The whole admin area is one lazy chunk — never shipped to public visitors.
const AdminApp = lazy(() => import("./admin/AdminApp"));

// The admin area sits outside Layout, so its fallback paints the page colour itself.
const RouteFallback = <BrandLoader fullscreen className="bg-[#09060f]" />;

export default function Pages() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="/admin/*"
          element={<Suspense fallback={RouteFallback}>{<AdminApp />}</Suspense>}
        />
      </Routes>
    </BrowserRouter>
  );
}
