import Layout from '../components/Layout';
import NotFound from './404NotFound';
import Homepage from './Homepage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Terminal from './Terminal';

export default function Pages() {
    return (
        <Router>
            <Layout>
                <Routes>      
                    <Route path="*" element={<NotFound />} />      
                    <Route path="/" element={<Homepage />} />
                    <Route path="/terminal" element={<Terminal />} />
                </Routes>
            </Layout>
        </Router>
    );
}