import { BrowserRouter, Route, RouterProvider, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import Body from "./Body";
import Login from "./Login";
import Profile from "./Profile";

function App(){
  return (
    <>
<RouterProvider
    <BrowserRouter basename="/">
     <Routes>
      <Route path="/" element={<Body/>}>
      <Route path="/login" element={<Login/>}/>
     <Route path="/profile" element={<Profile/>}/>
     </Route>
     </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;