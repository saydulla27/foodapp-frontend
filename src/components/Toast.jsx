export default function Toast({ type = "info", text = "", onClose }) {
    if (!text) return null;
  
    const styles =
      type === "error"
        ? "bg-red-50 border-red-200 text-red-700"
        : type === "success"
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-slate-50 border-slate-200 text-slate-700";
  
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm ${styles}`}>
          <div className="text-sm">{text}</div>
          <button
            className="ml-2 rounded-lg px-2 py-1 text-xs hover:bg-black/5"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }
  