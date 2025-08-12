import { Route, Routes } from "react-router";
import Layout from "./Layout";
import Home from "../pages/Home";
import About from "../pages/About";
import SignIn from "../pages/SignIn";
import TownDetails from "../pages/TownDetails";
import CharacterDetails from "../pages/CharacterDetails";
import AddData from "../pages/AddData";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/televerser-un-fichier" element={<AddData />} />
        <Route path="a-propos" element={<About />} />
        <Route path="commune-details/:id" element={<TownDetails />} />
        <Route path="pionnier-details/:id" element={<CharacterDetails />} />
        <Route path="/se-connecter" element={<SignIn />} />
      </Route>
    </Routes>
  );
}
