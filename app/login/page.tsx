"use client"; // Add at the very top if not already present
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError(""); // clear previous errors
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Redirect to dashboard after successful login
      window.location.href = "/dashboard";
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded px-4 py-3 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded px-4 py-3 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-purple-700 text-white py-3 rounded w-full"
        >
          Login
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
      <p className="text-center mt-4 text-gray-500">
        Don't have an account? <a href="/register" className="text-purple-700">Register</a>
      </p>
    </main>
  );
}