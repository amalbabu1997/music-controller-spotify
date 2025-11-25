import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./HomePage";
import JoinRoom from "./JoinRoom";
import CreateRoom from "./CreateRoom";
import Room from "./Room";

const App = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.log(" Current route:", location.pathname);
  }, [location.pathname]);

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
