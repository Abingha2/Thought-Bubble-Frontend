import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home';
import Thought from './Pages/Thought';
import Update from './Pages/Update';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/thought/:ID" element={<Thought />} />
        <Route path="/update/:ID" element={<Update />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}