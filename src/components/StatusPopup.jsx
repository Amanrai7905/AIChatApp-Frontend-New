import { FiCheckCircle, FiX } from "react-icons/fi";

function StatusPopup({ title, message, onClose, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div
        className={`w-full max-w-md rounded-[28px] border p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)] ${
          dark
            ? "border-white/10 bg-[#111827]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-500/15 p-2 text-emerald-400">
              <FiCheckCircle />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${dark ? "text-white" : "text-slate-950"}`}>
                {title}
              </h3>
              <p className={`mt-2 text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                {message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl p-2 ${
              dark ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"
            }`}
            aria-label="Close popup"
          >
            <FiX />
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              dark
                ? "bg-sky-400 text-slate-950 hover:bg-sky-300"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusPopup;
