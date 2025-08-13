import { Outlet } from "react-router";
import Navbar from "../components/NavBar";

export default function Layout() {
  return (
    <div className="flex flex-col items-center h-full w-full">
      <Navbar />
      <div className="max-w-[1200px] w-full h-full font-dosis my-8">
        <Outlet />
      </div>
    </div>
  );
}
