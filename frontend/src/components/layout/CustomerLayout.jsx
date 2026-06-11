import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const CustomerLayout = () => (
  <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-6">
      <Outlet />
    </main>
    <Footer />
  </div>
);
export default CustomerLayout;
