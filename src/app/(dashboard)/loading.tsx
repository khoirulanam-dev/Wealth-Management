export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E4E8EF]/50">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-200 rounded" />
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="adm-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-4 bg-slate-200 rounded" />
            </div>
            <div className="h-8 w-40 bg-slate-200 rounded-md" />
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="h-2.5 w-20 bg-slate-100 rounded" />
              <div className="h-2.5 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 adm-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-7 w-36 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-64 w-full bg-slate-100 rounded-xl" />
        </div>
        <div className="adm-card p-6 space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-56 w-56 mx-auto rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

