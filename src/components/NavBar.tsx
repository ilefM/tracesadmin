import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabase/supabaseClient";

export default function NavBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="max-w-[1000px] w-full flex justify-between items-center py-3">
      <NavLink to="/" className="cursor-pointer text-2xl">
        Traces Nouvelle France - Édition
      </NavLink>
      <div className="space-x-4">
        <NavLink
          to="/televerser-un-fichier"
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Téléverser des données
        </NavLink>

        <NavLink to="/a-propos" className="bg-gray-300 px-4 py-2 rounded">
          Aide
        </NavLink>

        {!user ? (
          <NavLink to="/se-connecter" className="bg-gray-300 px-4 py-2 rounded">
            Se connecter
          </NavLink>
        ) : (
          <button
            onClick={handleSignOut}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Se déconnecter
          </button>
        )}
      </div>
    </div>
  );
}
