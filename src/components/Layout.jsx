import SideNav from "./SideNav";
import Topbar from "./Topbar";

export default function Layout({ title, subtitle, actions, children }) {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-6">
          <SideNav />

          <main className="flex-1">
            <Topbar />

            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                {title ? <h1 className="text-xl font-semibold">{title}</h1> : null}
                {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
              </div>
              {actions ? <div className="flex gap-2">{actions}</div> : null}
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
