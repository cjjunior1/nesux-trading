"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

const SUB_CUTOFF_HZ = 80;
const MID_LOW_CUTOFF_HZ = 80;
const MID_HIGH_CUTOFF_HZ = 2500;
const HIGH_CUTOFF_HZ = 2500;
const FILTER_CASCADE = 2;

type CrossoverResult = {
  subUrl: string | null;
  midUrl: string | null;
  highUrl: string | null;
};

const createFilterChain = (
  context: BaseAudioContext,
  type: BiquadFilterType,
  frequency: number,
  cascade: number,
  input: AudioNode
) => {
  let node: AudioNode = input;

  for (let i = 0; i < cascade; i += 1) {
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.707;
    node.connect(filter);
    node = filter;
  }

  return node;
};

const renderBand = async (buffer: AudioBuffer, band: "sub" | "mid" | "high") => {
  const offline = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  const source = offline.createBufferSource();
  source.buffer = buffer;

  let node: AudioNode = source;

  if (band === "sub") {
    node = createFilterChain(offline, "lowpass", SUB_CUTOFF_HZ, FILTER_CASCADE, node);
  }

  if (band === "mid") {
    node = createFilterChain(offline, "highpass", MID_LOW_CUTOFF_HZ, FILTER_CASCADE, node);
    node = createFilterChain(offline, "lowpass", MID_HIGH_CUTOFF_HZ, FILTER_CASCADE, node);
  }

  if (band === "high") {
    node = createFilterChain(offline, "highpass", HIGH_CUTOFF_HZ, FILTER_CASCADE, node);
  }

  node.connect(offline.destination);
  source.start(0);

  return offline.startRendering();
};

const audioBufferToWav = (buffer: AudioBuffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numFrames; i += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const sample = buffer.getChannelData(channel)[i] ?? 0;
      const clamped = Math.max(-1, Math.min(1, sample));
      const value = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, value, true);
      offset += bytesPerSample;
    }
  }

  return arrayBuffer;
};

export default function AudioCrossover() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrossoverResult>({
    subUrl: null,
    midUrl: null,
    highUrl: null,
  });

  const cleanupUrls = useCallback(() => {
    if (result.subUrl) URL.revokeObjectURL(result.subUrl);
    if (result.midUrl) URL.revokeObjectURL(result.midUrl);
    if (result.highUrl) URL.revokeObjectURL(result.highUrl);
  }, [result]);

  useEffect(() => {
    return () => cleanupUrls();
  }, [cleanupUrls]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
    setStatus(null);
    cleanupUrls();
    setResult({ subUrl: null, midUrl: null, highUrl: null });
  };

  const canProcess = useMemo(() => Boolean(file) && !processing, [file, processing]);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setStatus("Decodificando audio...");
    cleanupUrls();
    setResult({ subUrl: null, midUrl: null, highUrl: null });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      await audioContext.close();

      setStatus("Procesando subwoofer...");
      const subBuffer = await renderBand(decoded, "sub");
      const subWav = audioBufferToWav(subBuffer);
      const subUrl = URL.createObjectURL(new Blob([subWav], { type: "audio/wav" }));

      setStatus("Procesando medio-bajo...");
      const midBuffer = await renderBand(decoded, "mid");
      const midWav = audioBufferToWav(midBuffer);
      const midUrl = URL.createObjectURL(new Blob([midWav], { type: "audio/wav" }));

      setStatus("Procesando tweeter...");
      const highBuffer = await renderBand(decoded, "high");
      const highWav = audioBufferToWav(highBuffer);
      const highUrl = URL.createObjectURL(new Blob([highWav], { type: "audio/wav" }));

      setResult({ subUrl, midUrl, highUrl });
      setStatus("Listo. Puedes reproducir o descargar cada vía.");
    } catch (err) {
      console.error(err);
      setError("No se pudo procesar el audio. Verifica el archivo e inténtalo de nuevo.");
      setStatus(null);
    } finally {
      setProcessing(false);
    }
  }, [file, cleanupUrls]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Crossover 3 vías</h2>
          <p className="text-slate-400 mt-2">
            Subwoofer hasta 80 Hz · Medio-bajo 80 Hz – 2.5 kHz · Tweeter desde 2.5 kHz
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-sm font-semibold text-slate-200">Esquemático (visual)</p>
          <p className="text-xs text-slate-400 mt-1">
            Ruta de señal y cortes de frecuencia.
          </p>
          <div className="mt-4 overflow-x-auto">
            <svg
              viewBox="0 0 820 180"
              className="h-40 min-w-[820px] text-slate-300"
              role="img"
              aria-label="Diagrama de crossover 3 vías"
            >
              <defs>
                <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <rect x="10" y="20" width="120" height="40" rx="8" fill="#0f172a" stroke="#334155" />
              <text x="70" y="45" textAnchor="middle" fontSize="12" fill="#e2e8f0">Entrada</text>

              <line x1="130" y1="40" x2="240" y2="40" stroke="url(#line)" strokeWidth="3" />
              <circle cx="240" cy="40" r="5" fill="#22c55e" />
              <line x1="240" y1="40" x2="240" y2="140" stroke="#22c55e" strokeWidth="3" />

              <rect x="260" y="20" width="160" height="40" rx="8" fill="#0f172a" stroke="#334155" />
              <text x="340" y="45" textAnchor="middle" fontSize="12" fill="#e2e8f0">Low-pass 80 Hz</text>

              <rect x="260" y="120" width="160" height="40" rx="8" fill="#0f172a" stroke="#334155" />
              <text x="340" y="145" textAnchor="middle" fontSize="12" fill="#e2e8f0">High-pass 80 Hz</text>

              <line x1="420" y1="40" x2="520" y2="40" stroke="#22c55e" strokeWidth="3" />
              <rect x="520" y="20" width="160" height="40" rx="8" fill="#0f172a" stroke="#334155" />
              <text x="600" y="45" textAnchor="middle" fontSize="12" fill="#e2e8f0">Subwoofer ≤ 80 Hz</text>

              <line x1="420" y1="140" x2="520" y2="140" stroke="#38bdf8" strokeWidth="3" />
              <rect x="520" y="120" width="160" height="40" rx="8" fill="#0f172a" stroke="#334155" />
              <text x="600" y="145" textAnchor="middle" fontSize="12" fill="#e2e8f0">Band-pass 80–2.5 kHz</text>

              <line x1="240" y1="40" x2="240" y2="40" stroke="#38bdf8" strokeWidth="0" />
              <line x1="240" y1="40" x2="240" y2="140" stroke="#38bdf8" strokeWidth="0" />
              <line x1="420" y1="140" x2="420" y2="140" stroke="#38bdf8" strokeWidth="0" />

              <rect x="520" y="70" width="160" height="40" rx="8" fill="#0f172a" stroke="#334155" />
              <text x="600" y="95" textAnchor="middle" fontSize="12" fill="#e2e8f0">High-pass 2.5 kHz</text>
              <line x1="420" y1="140" x2="520" y2="90" stroke="#f472b6" strokeWidth="3" />
              <rect x="690" y="70" width="120" height="40" rx="8" fill="#0f172a" stroke="#334155" />
              <text x="750" y="95" textAnchor="middle" fontSize="12" fill="#e2e8f0">Tweeter ≥ 2.5 kHz</text>
              <line x1="680" y1="90" x2="690" y2="90" stroke="#f472b6" strokeWidth="3" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-slate-300">Archivo de audio (WAV/MP3)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-slate-100 hover:file:bg-slate-700"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleProcess}
            disabled={!canProcess}
            className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {processing ? "Procesando..." : "Generar crossover"}
          </button>
          {status && <span className="text-sm text-slate-300 self-center">{status}</span>}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold text-slate-200">Subwoofer · ≤ 80 Hz</h3>
            {result.subUrl ? (
              <div className="mt-3 space-y-3">
                <audio controls src={result.subUrl} className="w-full" />
                <a
                  href={result.subUrl}
                  download="subwoofer.wav"
                  className="inline-flex text-sm text-emerald-300 hover:text-emerald-200"
                >
                  Descargar WAV
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Aún no generado.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold text-slate-200">Medio-bajo · 80 Hz – 2.5 kHz</h3>
            {result.midUrl ? (
              <div className="mt-3 space-y-3">
                <audio controls src={result.midUrl} className="w-full" />
                <a
                  href={result.midUrl}
                  download="midwoofer.wav"
                  className="inline-flex text-sm text-emerald-300 hover:text-emerald-200"
                >
                  Descargar WAV
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Aún no generado.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold text-slate-200">Tweeter · ≥ 2.5 kHz</h3>
            {result.highUrl ? (
              <div className="mt-3 space-y-3">
                <audio controls src={result.highUrl} className="w-full" />
                <a
                  href={result.highUrl}
                  download="tweeter.wav"
                  className="inline-flex text-sm text-emerald-300 hover:text-emerald-200"
                >
                  Descargar WAV
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Aún no generado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
