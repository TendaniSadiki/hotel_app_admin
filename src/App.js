import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css'; // Import CSS file for styling
import { auth } from './config/firebase';
import Login from './Components/login/login';
// import Signup from './Components/signup/signup';

const Home = lazy(() => import('./Components/Home/home'));
const Rooms = lazy(() => import('./Components/rooms/rooms'));
const Booked = lazy(() => import('./Components/booked/booked'));
const Users = lazy(() => import('./Components/users/users'));

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Add authentication state change listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, update the user state
        setUser(user);
      } else {
        // User is signed out, set the user state to null
        setUser(null);
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    auth.signOut().then(() => {
      // User is signed out, handle any additional cleanup or redirection
      console.log('User signed out');
    }).catch((error) => {
      // An error occurred while signing out
      console.log('Error signing out:', error);
    });
  };

  const PrivateRoute = ({ element, path }) => {
    if (!user) {
      // User is not logged in, redirect to the login page
      return <Navigate to="/login" />;
    }

    // User is logged in, render the specified element
    return element;
  };

  return (
    <BrowserRouter>
      <nav>
        <input type="checkbox" id="menu-toggle" />
        <label htmlFor="menu-toggle" className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </label>
        <div className="logo">
          <Link to="/">Logo</Link>
        </div>
        <ul className="menu">
          {user && (
            <>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/rooms">Rooms</Link>
              </li>
              <li>
                <Link to="/users">Users</Link>
              </li>
              <li>
                <Link to="/booked">Booked</Link>
              </li>
            </>
          )}
          {!user ? (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                {/* <Link to="/signup">Signup</Link> */}
              </li>
            </>
          ) : (
            <li>
              <button onClick={handleSignOut}>Sign Out</button>
            </li>
          )}
        </ul>
      </nav>

      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              {/* <Route path="/signup" element={<Signup />} /> */}
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/users" element={<Users />} />
              <Route path="/booked" element={<Booked />} />
              <Route path="*" element={<Navigate to="/"/>} />

            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
