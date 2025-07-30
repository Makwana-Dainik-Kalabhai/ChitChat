import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './App.css'
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Toaster } from "react-hot-toast";
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function App() {
  const { authUser } = useContext(AuthContext);

  const router = createBrowserRouter([
    {
      path: '/',
      element: authUser ? <Home /> : <Navigate to="/login" />
    },
    {
      path: '/login',
      element: !authUser ? <Login /> : <Navigate to="/" />
    },
    {
      path: '/profile',
      element: authUser ? <Profile /> : <Navigate to="/login" />
    }
  ]);

  return <div className="bg-[url('/bgImage.svg')] bg-contain">
    <Toaster />
    <RouterProvider router={router} />
  </div>
}

export default App
