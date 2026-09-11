import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiZap } from "react-icons/fi";
import api from "../services/api";
import StatusPopup from "../components/StatusPopup";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const login = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data);
      setPopup({
        title: "Login successful",
        message: "You are now signed in. Continue to your chat dashboard.",
      });
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dark = theme === "dark";
  const infoMessage = location.state?.message;

  const handlePopupClose = () => {
    setPopup(null);
    navigate("/chat");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-10 transition-colors duration-300 ${
        dark
          ? "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_24%),#0b1020]"
          : "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_24%),#f3f5fb]"
      }`}
    >
      <div
        className={`grid w-full max-w-5xl overflow-hidden rounded-[30px] border shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)] md:grid-cols-[1.1fr_0.9fr] ${
          dark
            ? "border-white/10 bg-[#111827]/90"
            : "border-slate-200 bg-white/95"
        }`}
      >
        <div className="relative hidden flex-col justify-between p-8 md:flex">
          <div>
            <div
              className={`inline-flex rounded-2xl p-3 ${
                dark ? "bg-sky-500/15 text-sky-300" : "bg-slate-900 text-white"
              }`}
            >
              <FiZap />
            </div>

            <h1 className={`mt-6 text-3xl font-semibold ${dark ? "text-white" : "text-slate-950"}`}>
              Welcome back to your AI workspace
            </h1>
            <p className={`mt-3 text-sm leading-7 ${dark ? "text-slate-300" : "text-slate-700"}`}>
              Log in to continue conversations, revisit saved chats, and get fast answers in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Save and resume your chats anytime",
              "Ask follow-up questions with a single click",
              "Switch themes and keep the experience focused",
            ].map((item) => (
              <div
                key={item}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                  dark ? "bg-white/4" : "bg-slate-50"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                <span className={`text-sm ${dark ? "text-white" : "text-slate-900"}`}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
                Log in
              </p>
              <h2 className={`mt-2 text-2xl font-semibold ${dark ? "text-white" : "text-slate-950"}`}>
                Access your account
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setTheme(dark ? "light" : "dark")}
              className={`rounded-xl px-3 py-2 text-sm font-medium ${
                dark ? "bg-sky-400 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              {dark ? "Light" : "Dark"}
            </button>
          </div>

          <form onSubmit={login} className="space-y-4">
            {infoMessage && (
              <p className="rounded-2xl bg-sky-500/10 px-4 py-3 text-sm text-sky-400">
                {infoMessage}
              </p>
            )}

            <div>
              <label className={`mb-2 block text-sm font-medium ${dark ? "text-white" : "text-slate-900"}`} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  dark
                    ? "border-white/10 bg-[#0f172a] text-white placeholder:text-slate-500 focus:border-sky-400"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
                }`}
              />
            </div>

            <div>
              <label className={`mb-2 block text-sm font-medium ${dark ? "text-white" : "text-slate-900"}`} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${
                  dark
                    ? "border-white/10 bg-[#0f172a] text-white placeholder:text-slate-500 focus:border-sky-400"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
                }`}
              />
            </div>

            {error && (
              <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                loading
                  ? "cursor-not-allowed bg-slate-300 text-slate-500"
                  : dark
                    ? "bg-sky-400 text-slate-950 hover:bg-sky-300"
                    : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {loading ? "Signing in..." : "Continue"}
              {!loading && <FiArrowRight />}
            </button>
          </form>

          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
              dark ? "border-white/10 bg-white/3" : "border-slate-200 bg-slate-50"
            }`}
          >
            <span className={dark ? "text-slate-300" : "text-slate-600"}>
              New here?{' '}
            </span>
            <Link to="/register" className="font-semibold text-sky-400">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {popup && (
        <StatusPopup
          title={popup.title}
          message={popup.message}
          dark={dark}
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
}

export default Login;