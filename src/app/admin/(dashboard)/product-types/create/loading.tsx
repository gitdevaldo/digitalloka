export default function CreateProductTypeLoading() {
  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-56 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-80 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-40 bg-muted rounded-lg animate-pulse" />
          <div className="h-9 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="bg-card border-2 border-border rounded-xl shadow-[4px_4px_0_var(--shadow)] p-6">
        <div className="grid gap-4 p-[22px]">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
            </div>
          ))}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-border">
            <div className="h-9 w-20 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-28 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
