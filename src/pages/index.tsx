import Layout from "../components/Layout";
import Homepage from "./Homepage";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function Pages() {
    return (
        <Router>
            <Layout>
                <Routes>            
                    <Route path="/" element={<Homepage />} />
                    <Route path="/homepage" element={<Homepage />} />
                </Routes>
            </Layout>
        </Router>
    );
}