import { FormEvent, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default function Login({ role: _role }: { role: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!res.ok) { setError("Identifiants invalides"); return; }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      window.location.href = "/";
    } catch {
      setError("Erreur de connexion au serveur");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-start md:items-center" style={{ paddingTop: "20vh" }}>
      <form onSubmit={handleSubmit} className="w-80 ml-6 md:ml-[12.5%] space-y-5">
        <div>
          <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Connexion</h1>
          <p className="text-detail text-swiss-muted mt-1">{_role}</p>
        </div>
        <div className="border-t border-swiss-border pt-5 space-y-4">
          {error && <p className="text-xs text-swiss-red border border-swiss-red px-3 py-2">{error}</p>}
          <input className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-swiss-accent text-white text-xs tracking-widest uppercase py-2 hover:opacity-90 transition-none">Se connecter</button>
        </div>
      </form>
    </div>
  );
}
