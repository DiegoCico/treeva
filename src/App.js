import logo from './logo.svg';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Auth from './pages/Auth';
import Homepage from './pages/Homepage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Auth />} />
        <Route path='/:userId/:workspaceCode' element={<Homepage />} />
      </Routes>
    </div>
  );
}

export default App;
