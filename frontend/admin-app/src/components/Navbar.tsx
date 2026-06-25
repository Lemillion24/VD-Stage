import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard" },
  { path: "/parkings", label: "Parkings" },
  { path: "/tickets", label: "Tickets" },
  { path: "/employees", label: "Employes" },
  { path: "/tarifs", label: "Tarifs" },
  { path: "/reports", label: "Rapports" },
];

export default function Navbar() {
  const location = useLocation();

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/auth/logout`, { method: "POST", credentials: "include" });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <nav className="bg-white border-b border-swiss-border">
      <div className="mx-auto px-6" style={{ maxWidth: "1280px" }}>
        <div className="flex items-center justify-between h-12">
          <Link to="/" className="font-bold text-sm tracking-widest uppercase text-swiss-text">
            Parking Admin
          </Link>
          <div className="flex gap-1 items-center">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-xs tracking-wider uppercase ${
                  location.pathname === item.path
                    ? "text-swiss-accent"
                    : "text-swiss-muted hover:text-swiss-text"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <span className="w-px h-4 bg-swiss-border mx-1" />
            <button onClick={logout} className="px-3 py-2 text-xs uppercase text-swiss-red border border-swiss-red hover:bg-swiss-red hover:text-white">
              Deconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
