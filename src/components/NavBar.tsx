import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { supabase } from "../supabase/supabaseClient";

export default function NavBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  const handleBeforeLoginNav = () => {
    localStorage.setItem(
      "lastVisitedPath",
      location.pathname + location.search
    );
  };

  return (
    <div className="max-w-[1200px] w-full flex justify-between items-center py-3">
      <div className="flex flex-col ">
        <NavLink to="/" className="cursor-pointer text-xl">
          Traces Nouvelle France - Édition
        </NavLink>
        {user && (
          <div className="text-sm text-gray-600 mr-4">
            Connecté en tant que <strong>{user.email}</strong>
          </div>
        )}
      </div>

      <div className="space-x-4">
        <NavLink
          to="/televerser-un-fichier"
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Téléverser des données
        </NavLink>

        {!user ? (
          <NavLink
            to="/se-connecter"
            onClick={handleBeforeLoginNav}
            className="bg-gray-300 px-4 py-2 rounded"
          >
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

        <NavLink to="/a-propos" className="bg-gray-300 px-4 py-2 rounded">
          Aide
        </NavLink>
      </div>
    </div>
  );
}
