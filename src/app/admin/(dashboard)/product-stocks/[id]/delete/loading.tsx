export default function DeleteStockLoading() {
  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-48 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="bg-card border-2 border-border rounded-xl shadow-[4px_4px_0_var(--shadow)] p-6">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="h-5 w-72 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-80 bg-muted rounded-lg animate-pulse" />
          <div className="flex gap-3 mt-4">
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-36 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
