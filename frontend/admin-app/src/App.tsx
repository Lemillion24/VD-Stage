import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Parkings from "./pages/Parkings";
import Tickets from "./pages/Tickets";
import Employees from "./pages/Employees";
import Tarifs from "./pages/Tarifs";
import Reports from "./pages/Reports";
import Login from "@shared/components/Login";

function App() {
  const token = localStorage.getItem("token");
  // ponytail: localStorage token check guards admin routes. Add route-level guard when pages don't share App state.
  if (!token) return <Login role="Admin" />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto px-6 py-6" style={{ maxWidth: "1280px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/parkings" element={<Parkings />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/tarifs" element={<Tarifs />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
