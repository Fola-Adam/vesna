export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="font-body-main text-sm text-on-surface-variant">Loading...</p>
    </div>
  )
}
