import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TicketInfo from "./pages/TicketInfo";
import Payment from "./pages/Payment";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto px-6 py-6" style={{ maxWidth: "1280px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ticket/:ticketId" element={<TicketInfo />} />
            <Route path="/payment/:ticketId" element={<Payment />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
