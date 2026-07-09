import React, { useState } from 'react';

const WORKFLOW_STEPS = [
  { id: 'research', label: 'Executing live financial search via Tavily' },
  { id: 'risks', label: 'Evaluating systematic vulnerabilities via Gemini LLM' },
  { id: 'evaluate', label: 'Compiling structural investment thesis parameters' }
];

const palette = {
  text: '#1C1B22',
  textMuted: '#63616E',
  textFaint: '#9694A0',
  hairline: 'rgba(28,27,34,0.10)',
  hairlineSoft: 'rgba(28,27,34,0.06)',
  glass: 'rgba(255,255,255,0.50)',
  glassStrong: 'rgba(255,255,255,0.68)',
  glassFaint: 'rgba(255,255,255,0.32)',
  gold: '#B4862E',
  goldGlass: 'rgba(196,152,58,0.16)',
  coral: '#C85A44',
  coralGlass: 'rgba(200,90,68,0.14)',
  teal: '#1F8C81'
};

export default function App() {
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('thesis');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleTriggerAnalysis = async (e) => {
    e.preventDefault();
    if (!company.trim()) return;

    setIsLoading(true);
    setResult(null);
    setErrorMessage(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < WORKFLOW_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second fallback threshold

    try {
      // Targets the hardcoded port 7000 pipeline route layout explicitly
      const response = await fetch('http://127.0.0.1:7000/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company: company.trim() }),
        signal: controller.signal
      });

      clearInterval(stepInterval);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Server status fault: ${response.status}`);
      }

      const data = await response.json();
      setCurrentStep(WORKFLOW_STEPS.length);
      setResult(data);

    } catch (error) {
      clearInterval(stepInterval);
      clearTimeout(timeoutId);
      console.error('Network request failed:', error);

      if (error.name === 'AbortError') {
        setErrorMessage('Pipeline execution timed out. The workflow took too long to complete — check your backend terminal.');
      } else {
        setErrorMessage(
          error.message === 'Failed to fetch'
            ? 'Cannot reach the backend engine. Confirm server.js is active and listening on port 7000.'
            : `Audit pipeline interrupted: ${error.message}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verdictIsPositive = result?.verdict === 'Invest';

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#F3F2F6' }} className="flex flex-col font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');

        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-mono-ledger { font-family: 'IBM Plex Mono', monospace; }
        .font-sans { font-family: 'Inter', sans-serif; }

        .glass-panel {
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.85),
            inset 0 0 0 1px rgba(255,255,255,0.35),
            0 8px 32px -12px rgba(28,27,34,0.18),
            0 2px 8px -2px rgba(28,27,34,0.08);
        }

        .glass-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(70px);
          opacity: 0.55;
          pointer-events: none;
        }

        details.dossier-card summary::-webkit-details-marker { display: none; }
        details.dossier-card summary { list-style: none; }

        @keyframes pulse-dash {
          0% { stroke-dashoffset: 240; }
          100% { stroke-dashoffset: 0; }
        }
        .seismo-line { stroke-dasharray: 240; animation: pulse-dash 2.4s linear infinite; }

        @keyframes soft-glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .glow-dot { animation: soft-glow 1.6s ease-in-out infinite; }

        .tab-underline { transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease; }
        .glass-input:focus { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 2px rgba(180,134,46,0.35); }
        .glass-btn:hover { filter: brightness(1.04); }
        a.source-link:hover { opacity: 0.75; }
      `}</style>

      {/* Ambient color mesh behind the glass */}
      <div className="glass-blob" style={{ width: 420, height: 420, top: -140, left: -100, background: '#FFD9A0' }} />
      <div className="glass-blob" style={{ width: 380, height: 380, top: 80, right: -140, background: '#A8D8FF' }} />
      <div className="glass-blob" style={{ width: 340, height: 340, bottom: -160, left: '30%', background: '#C9F2E8' }} />
      <div className="glass-blob" style={{ width: 260, height: 260, bottom: 40, right: '10%', background: '#F3B7C6' }} />

      {/* Masthead */}
      <header
        className="glass-panel sticky top-0 z-50"
        style={{ background: palette.glassStrong, borderBottom: `1px solid ${palette.hairline}` }}
      >
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-end justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl tracking-tight" style={{ color: palette.text }}>
              The Alpha Ledger
            </span>
            <span className="font-mono-ledger text-[11px] uppercase tracking-widest" style={{ color: palette.textFaint }}>
              research desk
            </span>
          </div>
          <span
            className="font-mono-ledger text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              color: result ? palette.gold : isLoading ? palette.teal : palette.textFaint,
              background: result ? palette.goldGlass : isLoading ? 'rgba(31,140,129,0.12)' : 'rgba(28,27,34,0.05)',
              border: `1px solid ${palette.hairline}`
            }}
          >
            {result ? 'Dossier Filed' : isLoading ? 'Intake In Progress' : 'Awaiting Target'}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14 relative z-10">

        {/* Error Banner */}
        {errorMessage && (
          <div
            className="glass-panel text-sm rounded-2xl p-4 mb-8"
            style={{ background: palette.coralGlass, color: '#8A3F2E' }}
          >
            <span className="font-mono-ledger uppercase tracking-wider text-xs font-semibold mr-2" style={{ color: palette.coral }}>
              Status —
            </span>
            {errorMessage}
          </div>
        )}

        {/* Intake Panel */}
        <section className="glass-panel rounded-3xl p-7 mb-10" style={{ background: palette.glass }}>
          <span className="font-mono-ledger text-[11px] uppercase tracking-widest" style={{ color: palette.textFaint }}>
            Dossier Intake · No. {new Date().getFullYear()}-A
          </span>
          <h1 className="font-display text-2xl mt-1 mb-2" style={{ color: palette.text }}>
            Open a new research file
          </h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: palette.textMuted }}>
            Name a target company. We'll run a live search sweep before drafting a structured investment thesis.
          </p>

          <form onSubmit={handleTriggerAnalysis} className="flex gap-3">
            <input
              type="text"
              disabled={isLoading}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. NVIDIA, Apple, Tata Motors..."
              className="glass-input flex-1 rounded-2xl px-4 py-3 text-sm focus:outline-none disabled:opacity-50 transition-shadow"
              style={{
                background: palette.glassFaint,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), inset 0 0 0 1px ${palette.hairline}`,
                color: palette.text
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !company.trim()}
              className="glass-btn font-mono-ledger text-xs uppercase tracking-wider px-6 py-3 rounded-2xl transition-all whitespace-nowrap disabled:opacity-30"
              style={{
                background: `linear-gradient(180deg, #C89B3C, ${palette.gold})`,
                color: '#FFFDF8',
                fontWeight: 600,
                boxShadow: '0 6px 16px -6px rgba(180,134,46,0.55), inset 0 1px 0 rgba(255,255,255,0.4)'
              }}
            >
              {isLoading ? 'Filing…' : 'Open File →'}
            </button>
          </form>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="glass-panel rounded-3xl p-8 flex flex-col items-center gap-7" style={{ background: palette.glass }}>
            <svg viewBox="0 0 240 40" width="220" height="40">
              <path
                d="M0 20 L50 20 L60 4 L70 36 L80 20 L130 20 L140 8 L150 32 L160 20 L240 20"
                fill="none"
                stroke={palette.gold}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="seismo-line"
              />
            </svg>

            <div className="w-full max-w-sm space-y-3.5">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isCompleted = currentStep > idx;
                const isActive = currentStep === idx;
                return (
                  <div key={step.id} className="flex items-start gap-3">
                    <span
                      className="font-mono-ledger text-[11px] mt-0.5 w-5 shrink-0"
                      style={{ color: isCompleted ? palette.gold : isActive ? palette.teal : palette.textFaint }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={isActive ? 'glow-dot' : ''}
                      style={{
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        color: isCompleted ? palette.textMuted : isActive ? palette.text : palette.textFaint,
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        textDecorationColor: palette.textFaint
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result Dossier */}
        {result && !isLoading && (
          <article className="glass-panel rounded-3xl overflow-hidden" style={{ background: palette.glass }}>
            <div
              className="p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
              style={{ borderBottom: `1px solid ${palette.hairline}` }}
            >
              <div>
                <span className="font-mono-ledger text-[11px] uppercase tracking-widest" style={{ color: palette.textFaint }}>
                  Filed Dossier
                </span>
                <h2 className="font-display text-3xl mt-1" style={{ color: palette.text }}>
                  {result.companyName}
                </h2>
              </div>

              <div
                className="shrink-0 rounded-full flex flex-col items-center justify-center text-center"
                style={{
                  width: '88px',
                  height: '88px',
                  transform: 'rotate(-6deg)',
                  border: `2px solid ${verdictIsPositive ? palette.gold : palette.coral}`,
                  outline: `1px solid ${palette.hairline}`,
                  outlineOffset: '4px',
                  background: verdictIsPositive ? palette.goldGlass : palette.coralGlass,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 14px -6px rgba(28,27,34,0.2)'
                }}
              >
                <span
                  className="font-mono-ledger text-[9px] uppercase tracking-wider"
                  style={{ color: verdictIsPositive ? palette.gold : palette.coral }}
                >
                  Verdict
                </span>
                <span
                  className="font-display text-sm leading-tight px-1"
                  style={{ color: verdictIsPositive ? palette.gold : palette.coral, fontWeight: 600 }}
                >
                  {result.verdict || 'Review'}
                </span>
              </div>
            </div>

            {/* Folder Tabs */}
            <div className="flex px-3 pt-3 gap-1" style={{ background: 'rgba(28,27,34,0.03)' }}>
              {[
                { key: 'thesis', label: 'Thesis & Risks' },
                { key: 'sources', label: `Sources (${(result.rawData || []).length})` }
              ].map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="tab-underline font-mono-ledger text-xs uppercase tracking-wider px-5 py-3 rounded-t-2xl"
                    style={{
                      color: active ? palette.gold : palette.textMuted,
                      background: active ? palette.glassStrong : 'transparent',
                      boxShadow: active ? `inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 0 1px ${palette.hairline}` : 'none',
                      marginBottom: '-1px'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-7" style={{ borderTop: `1px solid ${palette.hairline}` }}>
              {activeTab === 'thesis' ? (
                <div className="space-y-9">
                  <section>
                    <h3 className="font-mono-ledger text-[11px] uppercase tracking-widest mb-3" style={{ color: palette.textFaint }}>
                      Executive Reasoning
                    </h3>
                    <p className="text-[15px] leading-relaxed" style={{ color: palette.text, fontFamily: "'Inter', sans-serif" }}>
                      {result.reasoningSummary}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-mono-ledger text-[11px] uppercase tracking-widest mb-3" style={{ color: palette.textFaint }}>
                      Flagged Risks ({(result.risks || []).length})
                    </h3>
                    {result.risks && result.risks.length > 0 ? (
                      <ul className="space-y-3 pl-0 list-none">
                        {result.risks.map((risk, index) => (
                          <li key={index} className="flex items-start text-sm leading-relaxed" style={{ color: palette.textMuted }}>
                            <span className="font-mono-ledger mr-3 mt-0.5 shrink-0" style={{ color: palette.coral }}>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm italic" style={{ color: palette.textFaint }}>
                        No material risks surfaced this cycle.
                      </p>
                    )}
                  </section>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.rawData && result.rawData.length > 0 ? (
                    result.rawData.map((source, index) => (
                      <details
                        key={index}
                        className="dossier-card rounded-2xl overflow-hidden"
                        style={{ background: palette.glassFaint, boxShadow: `inset 0 0 0 1px ${palette.hairlineSoft}` }}
                      >
                        <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                          <div className="flex items-start gap-3 pr-4 min-w-0">
                            <span className="font-mono-ledger text-xs mt-0.5 shrink-0" style={{ color: palette.textFaint }}>
                              [{String(index + 1).padStart(2, '0')}]
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-sm truncate" style={{ color: palette.text }}>
                                {source.source}
                              </span>
                              <span className="font-mono-ledger text-xs mt-0.5 truncate" style={{ color: palette.textFaint }}>
                                {source.url}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono-ledger text-xs shrink-0" style={{ color: palette.textFaint }}>
                            ▾
                          </span>
                        </summary>

                        <div className="px-4 pb-4 pt-1" style={{ borderTop: `1px solid ${palette.hairlineSoft}` }}>
                          <p
                            className="pl-3 text-sm italic leading-relaxed mt-3"
                            style={{ borderLeft: `2px solid ${palette.hairline}`, color: palette.textMuted }}
                          >
                            {source.snippet}
                          </p>
                          <div className="mt-3 flex justify-end">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="source-link font-mono-ledger text-xs underline transition-opacity"
                              style={{ color: palette.teal }}
                            >
                              Open source ↗
                            </a>
                          </div>
                        </div>
                      </details>
                    ))
                  ) : (
                    <p className="text-sm italic" style={{ color: palette.textFaint }}>
                      No sources indexed for this entry.
                    </p>
                  )}
                </div>
              )}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}