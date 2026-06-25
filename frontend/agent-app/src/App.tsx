import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import CheckOut from "./pages/CheckOut";
import Payment from "./pages/Payment";
import Tickets from "./pages/Tickets";
import Login from "@shared/components/Login";

function App() {
  const token = localStorage.getItem("token");
  // ponytail: login guard is UX-only. Backend enforces auth via require_role().
  if (!token) return <Login role="Agent" />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto px-6 py-6" style={{ maxWidth: "1280px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/check-out" element={<CheckOut />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/tickets" element={<Tickets />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
