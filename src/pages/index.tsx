import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import NotFound from './404NotFound';
import AboutMe from './AboutMe';
import Homepage from './Homepage';
import Projects from './Projects';
import Railways from './Railways';
import Terminal from './Terminal';

export default function Pages() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Homepage />} />
                    <Route path="/terminal" element={<Terminal />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/railways" element={<Railways />} />
                    <Route path="/about" element={<AboutMe />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}