import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Welcome from './pages/Welcome';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ChatWidget from './components/ChatWidget';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-neutral-100">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
          </Routes>
          <ChatWidget />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
