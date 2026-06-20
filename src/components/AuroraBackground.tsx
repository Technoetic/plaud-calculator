export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/4 h-[60vh] w-[60vw] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #ff6a3d, transparent 60%)", animation: "drift 14s ease-in-out infinite" }} />
      <div className="absolute top-1/3 right-1/4 h-[50vh] w-[50vw] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, #3da5ff, transparent 60%)", animation: "drift 18s ease-in-out infinite reverse" }} />
    </div>
  );
}
