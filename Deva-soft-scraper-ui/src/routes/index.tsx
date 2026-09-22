import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
      meta: [
        { title: "Deva Soft Scraper — Find leads, start calls" },
        { name: "description", content: "Enter a niche and location. The system scrapes qualified businesses, evaluates their web presence, and calls them automatically." },
        { property: "og:title", content: "Deva Soft Scraper — Find leads, start calls" },
        { property: "og:description", content: "Enter a niche and location. The system scrapes qualified businesses, evaluates their web presence, and calls them automatically." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
  }),
  component: Index,
});

const WEBHOOK_URL = "https://asadullah-xyz.app.n8n.cloud/webhook-test/cold-call-campaign";

interface WebhookResponse {
  success: boolean;
  message: string;
  status: string;
  niche: string;
  location: string;
  maxResults: number;
  timestamp: string;
}

function LogoMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-[0.7rem] bg-forest">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h13" stroke="var(--cream)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 12h16" stroke="var(--cream)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 17h9" stroke="var(--cream)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 17v-2.5m0 0 2.5-2.5M18 14.5l-2.5-2.5" stroke="var(--cream)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function OutlinePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-surface px-4 py-2 text-[0.8rem] font-medium text-ink/70">
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-surface px-3.5 py-1.5 text-[0.78rem] font-medium text-ink/70">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
      {children}
    </span>
  );
}

type Status = "idle" | "loading" | "success" | "error";

function Field({ id, label, helper, error, required, ...props }: { id: string; label: string; helper: string; error?: string | undefined; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
          {required && <span className="ml-1 text-amber">*</span>}
        </label>
        <span className="text-right text-[0.72rem] text-ink/40">{helper}</span>
      </div>
      <input id={id} className="field-input" {...props} />
      {error && <p className="font-mono text-xs text-terracotta">{error}</p>}
    </div>
  );
}

const STEPS = ["Scraping Google Maps...", "Evaluating web presence...", "Preparing call queue..."];

const HINTS = [
  "Be specific with the niche for higher-quality matches.",
  "Include city, state and country for accurate targeting.",
  "Call scores land in your Google Sheet once the queue clears.",
];

function ResultRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-mono text-xs text-cream/45">{label}</span>
      <span className={`font-mono text-xs ${accent ? "text-amber" : "text-cream/85"}`}>{value}</span>
    </div>
  );
}

function Index() {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [maxResults, setMaxResults] = useState("");
  const [errors, setErrors] = useState<{ niche?: string; location?: string }>({});
  const [status, setStatus] = useState<Status>("idle");
  const [responseData, setResponseData] = useState<WebhookResponse | null>(null);

  const reset = () => { setNiche(""); setLocation(""); setMaxResults(""); setErrors({}); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: { niche?: string; location?: string } = {};
    if (!niche.trim()) next.niche = "This field is required";
    if (!location.trim()) next.location = "This field is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStatus("loading");
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), location: location.trim(), maxResults: maxResults ? Number(maxResults) : 20 }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data: WebhookResponse = await res.json();
      setResponseData(data);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const statusLabel = status === "loading" ? "Running" : status === "success" ? "Queued" : status === "error" ? "Failed" : "Ready";

  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-7 lg:px-10">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-[1.05rem] font-semibold text-ink">Deva Soft Scraper</span>
        </div>
        <OutlinePill>
          Workflow created by Asadullah
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 9L9 3M9 3H4M9 3v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </OutlinePill>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 pb-20 lg:px-10">
        <section className="max-w-[46rem] pt-10 lg:pt-16">
          <div className="fade-up" style={{ animationDelay: "0ms" }}>
            <Eyebrow>Automated cold-call workflow</Eyebrow>
          </div>
          <h1 className="fade-up mt-6 font-serif text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.03] tracking-tight text-ink" style={{ animationDelay: "80ms" }}>
            Turn strangers into <em className="italic text-forest">warm calls</em>, while you sleep.
          </h1>
          <p className="fade-up mt-6 max-w-[34rem] text-base leading-relaxed text-ink/60" style={{ animationDelay: "160ms" }}>
            Give us a niche and a location. The workflow scrapes qualified businesses, evaluates their web presence, and calls them one by one.
          </p>
        </section>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <form onSubmit={submit} noValidate className="fade-up card-soft p-6 sm:p-8" style={{ animationDelay: "240ms" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink/40">01 · Compose</p>
                <h2 className="mt-2 font-serif text-2xl text-ink">Brief the scraper</h2>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest/8 px-3 py-1.5 text-[0.72rem] font-medium text-forest">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${status === "error" ? "bg-terracotta" : "bg-amber"}`} />
                {statusLabel}
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-5">
              <Field id="niche" label="Business niche" required helper="The type of business to target" error={errors.niche} placeholder="e.g. plumbers, dentists, restaurants" value={niche} onChange={(e) => setNiche(e.target.value)} />
              <Field id="location" label="Location" required helper="City, state and country" error={errors.location} placeholder="e.g. Austin, TX, USA" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Field id="maxResults" label="Max results" helper="Optional · defaults to 20" type="number" min={1} max={100} placeholder="20" value={maxResults} onChange={(e) => setMaxResults(e.target.value)} />
            </div>

            <div className="my-7 h-px w-full bg-ink/8" />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[0.8rem] text-ink/50">Results are written to your Google Sheet.</p>
              <button type="submit" disabled={status === "loading"} className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:bg-ink active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                {status === "loading" ? "Running search" : "Run lead search"}
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3 9L9 3M9 3H4M9 3v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-4">
            <section className="fade-up rounded-[1.75rem] bg-forest p-6 sm:p-7" style={{ animationDelay: "320ms" }}>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cream/45">02 · Result</p>
              <h2 className="mt-2 font-serif text-2xl text-cream">Workflow output</h2>

              <div className="mt-5 rounded-[1.125rem] p-5" style={{ background: "oklch(1 0 0 / 0.07)" }}>
                {status === "idle" && (
                  <>
                    <p className="text-sm font-semibold text-cream">Waiting for your brief</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-cream/65">
                      Fill out the form and hit <span className="font-semibold text-cream">Run lead search</span>. Results from the n8n workflow appear here.
                    </p>
                  </>
                )}

                {status === "loading" && (
                  <>
                    <div className="shimmer-track h-2 w-full rounded-full" style={{ background: "oklch(1 0 0 / 0.1)" }} />
                    <div className="mt-5 flex flex-col gap-3">
                      {STEPS.map((step, i) => (
                        <div key={step} className="flex items-center gap-3">
                          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-amber" style={{ animationDelay: `${i * 240}ms` }} />
                          <span className="font-mono text-xs text-cream/75">{step}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {status === "success" && (
                  <div className="fade-up-scale">
                    <p className="text-sm font-semibold text-cream">Campaign started</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-cream/70">
                      {responseData?.message ?? "The desired leads are being scraped and will be called one by one. Please check your Google Sheet after 20 minutes to see the results and call scores."}
                    </p>
                    <div className="my-4 h-px w-full" style={{ background: "oklch(1 0 0 / 0.12)" }} />
                    <div className="flex flex-col gap-1.5">
                      <ResultRow label="niche" value={responseData?.niche ?? "—"} />
                      <ResultRow label="location" value={responseData?.location ?? "—"} />
                      <ResultRow label="status" value={responseData?.status ?? "CALLS IN PROGRESS"} accent />
                      <ResultRow label="timestamp" value={responseData?.timestamp ? new Date(responseData.timestamp).toLocaleString() : "—"} />
                    </div>
                    <button type="button" onClick={() => { setStatus("idle"); setResponseData(null); reset(); }} className="mt-5 text-xs font-semibold text-amber underline-offset-4 transition-opacity duration-240 hover:underline hover:opacity-80">
                      Run another search
                    </button>
                  </div>
                )}

                {status === "error" && (
                  <div className="fade-up-scale">
                    <p className="text-sm font-semibold text-cream">Something went wrong</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-cream/70">The search could not be started. Check your connection and try again.</p>
                    <div className="my-4 h-px w-full" style={{ background: "oklch(1 0 0 / 0.12)" }} />
                    <ResultRow label="status" value="REQUEST FAILED" accent />
                    <button type="button" onClick={() => setStatus("idle")} className="mt-5 text-xs font-semibold text-amber underline-offset-4 transition-opacity duration-240 hover:underline hover:opacity-80">
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </section>

            <aside className="fade-up card-soft p-5 sm:p-6" style={{ animationDelay: "400ms" }}>
              <ul className="flex flex-col gap-2.5">
                {HINTS.map((hint) => (
                  <li key={hint} className="flex gap-2.5 text-[0.82rem] leading-relaxed text-ink/65">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-amber" />
                    {hint}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-[1180px] px-6 pb-10 text-xs text-ink/40 lg:px-10">
        DevtaSoft AI System · Deva Soft Scraper
      </footer>
    </div>
  );
}
