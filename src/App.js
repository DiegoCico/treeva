import logo from './logo.svg';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Auth from './pages/Auth';
import Homepage from './pages/Homepage';
import { ThemeProvider } from './ThemeContext.js'; 
import Welcome from './pages/Welcome.js'

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Routes>
          <Route path='/login' element={<Auth />} />
          <Route path='/:userId/:workspaceCode' element={<Homepage />} />
          <Route path='/' element={< Welcome/>} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
