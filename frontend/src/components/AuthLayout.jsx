import { Outlet } from "react-router-dom";
import Lamp from "./Lamp.jsx";

export default function AuthLayout() {
  return (
    <div className="font-sans text-white">
      <div className="brick-wall fixed inset-0" />
      <Lamp />
      {/* pt-36 leaves room for the lamp; overflow-y-auto keeps small phones scrollable */}
      <main className="fixed inset-0 z-5 flex overflow-y-auto px-4 pb-8 pt-36 max-[420px]:pt-32">
        <Outlet />
      </main>
    </div>
  );
}
