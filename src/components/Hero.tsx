import { Canvas } from "@react-three/fiber";
import { Float, RoundedBox, Environment } from "@react-three/drei";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <header className="relative grid md:grid-cols-2 items-center gap-6 mb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <h1 className="text-4xl font-black leading-tight">PLAUD AI 녹음기<br/>도입 견적</h1>
        <p className="mt-3 text-white/60">영업 미팅·통화를 AI 요약으로 — 도입 총비용과 회수기간을 즉시 산출</p>
      </motion.div>
      <div className="h-64 no-print">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} />
          <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
            <RoundedBox args={[1, 1.7, 0.25]} radius={0.08}>
              <meshStandardMaterial color="#ff6a3d" metalness={0.4} roughness={0.3} />
            </RoundedBox>
          </Float>
          <Environment preset="city" />
        </Canvas>
      </div>
    </header>
  );
}
