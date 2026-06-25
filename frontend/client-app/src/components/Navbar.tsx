import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-swiss-border">
      <div className="mx-auto px-6" style={{ maxWidth: "1280px" }}>
        <div className="flex items-center justify-between h-12">
          <Link to="/" className="font-bold text-sm tracking-widest uppercase text-swiss-text">
            Parking
          </Link>
          <Link
            to="/"
            className="px-3 py-2 text-xs tracking-wider uppercase text-swiss-muted hover:text-swiss-text"
          >
            Accueil
          </Link>
        </div>
      </div>
    </nav>
  );
}
