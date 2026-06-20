import { useQuote } from "./hooks/useQuote";
import { InputPanel } from "./components/InputPanel";
import { ResultDashboard } from "./components/ResultDashboard";

export default function App() {
  const { input, result, set, setRoi } = useQuote();
  return (
    <main className="min-h-screen bg-ink text-white p-8 grid md:grid-cols-2 gap-8">
      <InputPanel input={input} set={set} setRoi={setRoi} />
      <ResultDashboard result={result} years={input.years} />
    </main>
  );
}
