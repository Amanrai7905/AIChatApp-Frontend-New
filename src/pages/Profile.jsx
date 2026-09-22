import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiLogOut,
  FiMoon,
  FiSun,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { getCurrentUser } from "../services/auth";

function Profile() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const dark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div
      className={`min-h-screen px-4 py-6 transition-colors duration-300 md:px-8 md:py-10 ${
        dark
          ? "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_28%),#0b1020] text-white"
          : "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_28%),#f3f5fb] text-slate-950"
      }`}
    >
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              dark
                ? "text-slate-300 hover:bg-white/8 hover:text-white"
                : "text-slate-600 hover:bg-white hover:text-slate-950"
            }`}
          >
            <FiArrowLeft />
            Back to chat
          </button>

          <button
            type="button"
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className={`rounded-xl p-2.5 transition ${
              dark
                ? "bg-white/8 text-slate-200 hover:bg-white/12"
                : "bg-white text-slate-700 shadow-sm hover:bg-slate-100"
            }`}
          >
            {dark ? <FiSun /> : <FiMoon />}
          </button>
        </header>

        <main className="mt-8">
          <div className="mb-8 flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                dark ? "bg-sky-400 text-slate-950" : "bg-slate-900 text-white"
              }`}
            >
              <FiUser size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                Account
              </p>
              <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
                Profile settings
              </h1>
            </div>
          </div>

          <section
            className={`overflow-hidden rounded-3xl border shadow-[0_30px_80px_-45px_rgba(15,23,42,0.5)] ${
              dark
                ? "border-white/10 bg-[#111827]/90"
                : "border-slate-200 bg-white/95"
            }`}
          >
            <div className="flex items-center gap-4 border-b border-inherit p-6 md:p-8">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${
                  dark ? "bg-sky-400 text-slate-950" : "bg-slate-900 text-white"
                }`}
              >
                <FiUser />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{currentUser?.name || "Your profile"}</h2>
                <p className={`mt-1 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {currentUser?.email || "Signed-in account"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
              <div
                className={`rounded-2xl border p-5 ${
                  dark ? "border-white/10 bg-white/4" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiZap className="text-sky-400" />
                  <h3 className="font-semibold">Assistant access</h3>
                </div>
                <p className={`mt-3 text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  Your conversations are ready to continue from the chat screen.
                </p>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  dark ? "border-white/10 bg-white/4" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {dark ? <FiMoon className="text-sky-400" /> : <FiSun className="text-sky-500" />}
                  <h3 className="font-semibold">Appearance</h3>
                </div>
                <p className={`mt-3 text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  Currently using {dark ? "dark" : "light"} theme.
                </p>
                <button
                  type="button"
                  onClick={() => setTheme(dark ? "light" : "dark")}
                  className={`mt-4 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    dark
                      ? "bg-white/10 text-white hover:bg-white/15"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  Switch to {dark ? "light" : "dark"} theme
                </button>
              </div>
            </div>

            <div className="border-t border-inherit p-6 md:px-8">
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/15"
              >
                <FiLogOut />
                Log out
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Profile;
