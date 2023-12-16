import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home';
import Thought from './Pages/Thought';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/thought/:ID" element={<Thought />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}