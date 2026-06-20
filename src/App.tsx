import { useQuote } from "./hooks/useQuote";
import { InputPanel } from "./components/InputPanel";
import { ResultDashboard } from "./components/ResultDashboard";
import { Hero } from "./components/Hero";
import { AuroraBackground } from "./components/AuroraBackground";

export default function App() {
  const { input, result, set, setRoi } = useQuote();
  return (
    <main className="min-h-screen bg-ink text-white p-8 max-w-6xl mx-auto">
      <AuroraBackground />
      <Hero />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="no-print"><InputPanel input={input} set={set} setRoi={setRoi} /></div>
        <ResultDashboard result={result} years={input.years} />
      </div>
      <button onClick={() => window.print()}
        className="no-print mt-8 px-5 py-2 rounded-lg bg-accent text-black font-semibold">🖨️ 인쇄 / PDF</button>
    </main>
  );
}
