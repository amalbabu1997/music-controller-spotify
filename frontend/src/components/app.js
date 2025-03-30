import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import JoinRoom from "./JoinRoom";
import CreateRoom from "./CreateRoom";
import Room from "./Room";

const App = () => {
  return (
    <Routes className="center">
      <Route path="/" element={<HomePage />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/create" element={<CreateRoom />} />
      <Route path="/room/:roomCode" element={<Room />} />
    </Routes>
  );
};

export default App;
