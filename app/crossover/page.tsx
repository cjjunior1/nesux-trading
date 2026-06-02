import AudioCrossover from "@/components/audio-crossover";

export default function CrossoverPage() {
  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Crossover de audio</h1>
            <p className="text-slate-400 mt-3">
              Separa un archivo en tres vías según la configuración típica de 3 vías.
            </p>
          </div>
          <AudioCrossover />
        </div>
      </section>
    </div>
  );
}
