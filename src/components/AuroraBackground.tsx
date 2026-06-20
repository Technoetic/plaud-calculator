export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      {/* 오렌지 메인 글로우 */}
      <div
        className="absolute -top-1/4 -left-[5%] h-[75vh] w-[70vw] rounded-full blur-[120px] opacity-60 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, #ff6a3d 0%, rgba(255,106,61,0.35) 45%, transparent 72%)",
          animation: "drift 16s ease-in-out infinite",
        }}
      />
      {/* 블루 보조 글로우 */}
      <div
        className="absolute top-1/4 right-[-8%] h-[70vh] w-[60vw] rounded-full blur-[120px] opacity-55 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, #3da5ff 0%, rgba(61,165,255,0.3) 45%, transparent 72%)",
          animation: "drift 22s ease-in-out infinite reverse",
        }}
      />
      {/* 핑크/마젠타 액센트 글로우 (깊이감) */}
      <div
        className="absolute bottom-[-15%] left-1/3 h-[55vh] w-[50vw] rounded-full blur-[140px] opacity-45 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, #b84dff 0%, rgba(184,77,255,0.25) 50%, transparent 75%)",
          animation: "drift 19s ease-in-out infinite",
        }}
      />
      {/* 상단 비네팅으로 텍스트 가독성 보호 */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(11,18,32,0.55) 100%)" }} />
    </div>
  );
}
