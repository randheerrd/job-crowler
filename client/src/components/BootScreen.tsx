import { useEffect, useRef, useState } from 'react';

const BANNER = String.raw`
     _  ___  ___    ___ ___    ___  _    _  ____ ___
  _ | |/ _ \| _ )  / __| _ \  /_\ \    / / |  __| _ \
 | || | (_) | _ \ | (__|   / / _ \ \/\/ /  | _||   /
  \__/ \___/|___/  \___|_|_\/_/ \_\_/\_/   |___|_|_\
`;

const LOG_LINES = [
  'INCOMING HTTP REQUEST DETECTED',
  'SERVICE WAKING UP',
  'ALLOCATING COMPUTE RESOURCES',
  'CONNECTING TO POSTGRES DATABASE',
  'PREPARING INSTANCE FOR INITIALIZATION',
  'STARTING THE INSTANCE',
  'ENVIRONMENT VARIABLES INJECTED',
  'LOADING JOB PORTALS',
  'FINALIZING STARTUP',
  'OPTIMIZING DEPLOYMENT',
  'STEADY HANDS. CLEAN LOGS. YOUR APP IS ALMOST LIVE',
];

function stamp(offsetSec: number): string {
  const d = new Date(Date.now() + offsetSec * 1000);
  return d.toTimeString().slice(0, 8);
}

export default function BootScreen() {
  const [visible, setVisible] = useState(0);
  const startRef = useRef(stamp(0));

  useEffect(() => {
    if (visible >= LOG_LINES.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), visible === 0 ? 200 : 380 + Math.random() * 260);
    return () => clearTimeout(t);
  }, [visible]);

  // re-derive stable timestamps from a fixed start
  const lines = LOG_LINES.map((text, i) => ({
    time: stamp(i * 3),
    text,
  }));
  void startRef;

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-50 overflow-hidden flex flex-col">
      {/* Brand */}
      <div className="px-8 pt-7 pb-4 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a]" />
        </span>
        <span className="text-white font-semibold text-lg tracking-tight">JobCrawler</span>
      </div>

      {/* Log stream */}
      <div className="flex-1 overflow-y-auto px-8 pb-10 font-mono text-sm">
        <div className="max-w-3xl space-y-5 pt-4">
          {lines.slice(0, visible).map((line, i) => (
            <div key={i} className="flex gap-4 animate-[fadeIn_0.3s_ease]">
              <span className="text-neutral-600 shrink-0 tabular-nums">{line.time}</span>
              <span className="text-neutral-300 uppercase tracking-wide">
                {line.text}
                {i === visible - 1 && visible < lines.length && (
                  <span className="inline-block w-2 h-4 ml-1 bg-neutral-400 animate-pulse align-middle" />
                )}
                {i < visible - 1 && ' ...'}
              </span>
            </div>
          ))}

          {/* ASCII banner appears after a couple of lines */}
          {visible >= 2 && (
            <pre className="text-neutral-700 text-[10px] leading-tight select-none py-4 animate-[fadeIn_0.5s_ease] overflow-x-auto">
              {BANNER}
            </pre>
          )}

          {/* Final ready line */}
          {visible >= lines.length && (
            <div className="flex gap-4 animate-[fadeIn_0.4s_ease] pt-2">
              <span className="text-emerald-600 shrink-0 tabular-nums">{stamp(lines.length * 3)}</span>
              <span className="text-emerald-400 uppercase tracking-wide font-semibold">
                ✓ APP IS LIVE — REDIRECTING YOU
                <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
