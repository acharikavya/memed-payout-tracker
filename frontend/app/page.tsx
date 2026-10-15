"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthResponse = {
  message?: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "brand" | "creator";
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function Home() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"brand" | "creator">("creator");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isSignup ? { name: name.trim(), role } : {}),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Authentication failed");
      }

      const result = data as AuthResponse;

      // Temporary development storage; replace with a more secure
      // authentication strategy before production deployment.
      sessionStorage.setItem("meme_token", result.token);
      sessionStorage.setItem("meme_user", JSON.stringify(result.user));

      router.push(
        result.user.role === "brand" ? "/brand" : "/creator"
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f4ef] px-4 py-10 text-[#171717]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <section className="flex flex-col justify-between bg-[#172b25] p-8 text-white sm:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d3ed91]">
              Meme&apos;d
            </p>
            <h1 className="mt-12 text-4xl font-bold leading-tight sm:text-5xl">
              Turn views into value.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-gray-300">
              A simple workspace for brands to launch meme campaigns
              and creators to earn rewards for performance.
            </p>
          </div>

          <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-sm text-gray-300">Campaign payouts</p>
            <p className="mt-2 text-2xl font-semibold">
              Transparent. Milestone-based.
            </p>
          </div>
        </section>

        <section className="p-8 sm:p-12">
          <p className="text-sm font-medium text-gray-500">
            {isSignup ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {isSignup ? "Join Meme'd" : "Sign in"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isSignup
              ? "Choose your role to get started."
              : "Sign in to continue to your workspace."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isSignup && (
              <>
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Full name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#416c50] focus:ring-2 focus:ring-[#416c50]/20"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-medium">
                    I am a
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as "brand" | "creator")
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#416c50]"
                  >
                    <option value="creator">Creator</option>
                    <option value="brand">Brand</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#416c50] focus:ring-2 focus:ring-[#416c50]/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                maxLength={72}
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#416c50] focus:ring-2 focus:ring-[#416c50]/20"
                placeholder="At least 8 characters"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#172b25] px-4 py-3 font-semibold text-white transition hover:bg-[#29463b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isSignup ? "Already have an account?" : "New to Meme'd?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="font-semibold text-[#315c42] hover:underline"
            >
              {isSignup ? "Sign in" : "Create account"}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}