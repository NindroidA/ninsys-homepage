import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import NotFound from "./404NotFound";
import AboutMe from "./AboutMe";
import Homepage from "./Homepage";
import Projects from "./Projects";

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
      </Routes>
    </BrowserRouter>
  );
}
