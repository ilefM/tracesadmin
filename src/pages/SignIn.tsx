import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../supabase/supabaseClient";

export default function SignIn() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (login === "" || password === "") {
      setError("Les champs ne doivent pas être vides.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: login,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      const lastPath = localStorage.getItem("lastVisitedPath") || "/";
      localStorage.removeItem("lastVisitedPath");
      navigate(lastPath, { replace: true });
    }
  }

  return (
    <form
      onSubmit={handleSignIn}
      className="w-[400px] mx-auto rounded-2xl mt-20 flex p-4 flex-col items-center bg-[#dcdcdc] shadow-xl"
    >
      <h1 className="text-xl mb-4">Se connecter</h1>
      <p className="text-red-400 text-sm">{error}</p>
      <div className="flex flex-col w-full mt-2">
        <label htmlFor="email">Adresse courriel</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Adresse courriel"
          className="border border-gray-300 text-black rounded-md p-2 mt-1"
          onChange={(e) => setLogin(e.target.value)}
        />
      </div>
      <div className="flex flex-col mt-4 w-full">
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Mot de passe"
          className="border border-gray-300 text-black rounded-md p-2 mt-1"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        className="bg-[#323232] text-lg text-white font-semibold cursor-pointer w-full rounded-lg p-2 mt-10 hover:underline"
        type="submit"
      >
        Confirmer
      </button>
    </form>
  );
}
