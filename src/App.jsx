// import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";
import Home from "./components/pages/Home";
import Profile from "./components/pages/Profile";
import Offers from "./components/pages/Offers";
import Chat from "./components/pages/Chat";
import './App.css'


function App(){
  return (
    
    <Router>
{/* <nav className="p-4 bg-gray-200">
  <a href="/" className="mr-4">Home</a>
  <a href="/login" className="mr-4">Login</a>
  <a href="/signup" className="mr-4">Signup</a>
  <a href="/profile" className="mr-4">Profile</a>
  <a href="/offers" className="mr-4">Offers</a>
  <a href="/chat">Chat</a>
</nav> */}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}


export default App
