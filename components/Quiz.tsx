"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import Image from "next/image";

type Q = {
  id: string;
  label: string;
  type: "choice" | "text";
  options?: string[];
};

const BRAND = "#7b4b2a";

const QUESTIONS: Q[] = [
  { id: "goal", label: "What is your primary objective?", type: "choice", options: [
    "Wholesale green coffee (import/export)",
    "Retail green coffee (home roaster/hobbyist)",
    "White Label for specialty coffee shops",
    "White Label for organizations",
    "Contract roasting",
    "Brand launch & marketing (tech-enabled)",
    "Planting / origin partnership"
  ]},
  { id: "volume", label: "Approximate monthly volume (metric tons / pounds)", type: "choice", options: [
    "Under 500 kg (≈ 1,100 lb)",
    "500 kg–2 t (≈ 1,100–4,400 lb)",
    "2–10 t (metric tons, ≈ 4,400–22,000 lb)",
    "10–50 t (metric tons, ≈ 22,000–110,000 lb)",
    "50 t+ (metric tons, ≈ 110,000+ lb)"
  ]},
  { id: "originPref", label: "Preferred origins", type: "choice", options: [
    "Colombia","Brazil","Central America","Puerto Rico","Dominican Republic","Open to recommendations","Other (write-in)"
  ]},
  { id: "process", label: "Processing preference", type: "choice", options: ["Washed", "Natural", "Honey", "Experimental", "No preference"] },
  { id: "certs", label: "Certifications needed", type: "choice", options: ["Organic", "Fairtrade", "Rainforest", "None"] },
  { id: "roastProfile", label: "Roast profile", type: "choice", options: ["Light", "Medium", "Dark", "Multiple/Custom", "N/A"] },
  { id: "packaging", label: "Packaging requirement", type: "choice", options: ["250 g", "12 oz / 340 g", "1 kg", "5 lb", "Custom", "N/A"] },
  { id: "incoterm", label: "Incoterms/shipping", type: "choice", options: ["EXW", "FOB", "CIF", "DDP", "Unsure/Discuss"] },
  { id: "timeline", label: "When do you want to start?", type: "choice", options: ["ASAP", "1–3 months", "3+ months"] },
  { id: "priceTier", label: "Price tier", type: "choice", options: ["Value-focused", "Mid-range", "Premium/micro-lot", "Undecided"] },
  { id: "name", label: "Name", type: "text" },
  { id: "email", label: "Email", type: "text" },
  { id: "phone", label: "Phone", type: "text" }
];

const LeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  consent: z.boolean().refine((v) => v === true)
});

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ path: string; summary: string[] } | null>(null);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", consent: false });
  const [submitting, setSubmitting] = useState(false);

  const current = QUESTIONS[step];
  const progress = useMemo(() => Math.round((step / QUESTIONS.length) * 100), [step]);

  function onSelect(value: string) {
    setAnswers((a) => ({ ...a, [current.id]: value }));
  }

  function onText(value: string) {
    setAnswers((a) => ({ ...a, [current.id]: value }));
    if (current.id === "name") setLead((l) => ({ ...l, name: value }));
    if (current.id === "email") setLead((l) => ({ ...l, email: value }));
    if (current.id === "phone") setLead((l) => ({ ...l, phone: value }));
  }

  useEffect(() => {
    const h = document.documentElement.scrollHeight || document.body.scrollHeight;
    try {
      window.parent.postMessage({ type: "QUIZ_HEIGHT", height: h }, "*");
    } catch {}
  }, [step, result]);

  async function next() {
    if (!answers[current.id]) return;
    if (current.id === "originPref" && answers.originPref === "Other (write-in)" && !answers.originOther) return;
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setSubmitting(true);
      const res = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setResult(data);
      setSubmitting(false);
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function submitLead() {
    const parse = LeadSchema.safeParse(lead);
    if (!parse.success) return;
    setSubmitting(true);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, result, lead })
    });
    setSubmitting(false);
    setResult({ path: result?.path || "submitted", summary: ["Thank you. Our team will contact you shortly."] });
  }

  const recTitle =
    result?.path === "green_trade_wholesale" ? "Recommendation: Wholesale Green Coffee (Import/Export)" :
    result?.path === "green_trade_retail" ? "Recommendation: Retail Green Coffee" :
    result?.path === "white_label_shops" ? "Recommendation: White Label for Specialty Coffee Shops" :
    result?.path === "white_label_orgs" ? "Recommendation: White Label for Organizations" :
    result?.path === "roasting_services" ? "Recommendation: Contract Roasting" :
    result?.path === "brand_tech" ? "Recommendation: Brand Launch & Marketing" :
    result?.path === "origin_programs" ? "Recommendation: Planting / Origin Partnership" :
    "Preliminary result";

  if (result) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden bg-white">
          <div className="px-6 py-6 border-b">
            <h1 className="text-2xl font-semibold" style={{ color: BRAND }}>{recTitle}</h1>
            <p className="mt-2 text-sm text-neutral-600">Based on your answers. Not formal advice.</p>
          </div>
          <div className="px-6 py-6 space-y-4">
            <ul className="space-y-2">
              {result.summary.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border p-6 space-y-4">
              <h2 className="text-lg font-medium" style={{ color: BRAND }}>Request a consultation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="rounded-xl border px-4 py-3" placeholder="Name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                <input className="rounded-xl border px-4 py-3" placeholder="Email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                <input className="rounded-xl border px-4 py-3 md:col-span-2" placeholder="Phone" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} />
                <span>I agree to be contacted by phone, email, or SMS.</span>
              </label>
              <button disabled={submitting} onClick={submitLead} className="w-full rounded-xl px-6 py-4 text-white" style={{ backgroundColor: BRAND }}>
                {submitting ? "Submitting..." : "Request consultation"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden bg-white">
        <div className="relative p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium" style={{ color: BRAND }}>Question {step + 1} of {QUESTIONS.length}</div>
            <div className="h-14 w-14 ring-2 bg-white rounded-full overflow-hidden relative" style={{ borderColor: BRAND }}>
              <Image src="/cafentity-logo.png" alt="Cafentity Logo" fill className="object-contain p-2" priority />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold ${i <= step ? "text-white" : "bg-neutral-200 text-neutral-600"}`} style={i <= step ? { backgroundColor: BRAND } : {}}>{i + 1}</div>
            ))}
          </div>
          <div className="absolute inset-x-0 -bottom-[1px] h-1" style={{ backgroundColor: BRAND, width: `${progress}%` }} />
        </div>

        <div className="p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-center" style={{ color: BRAND }}>{current.label}</h1>

          {current.type === "choice" && (
            <div className="mt-8 grid gap-4">
              {current.options!.map((opt) => {
                const active = answers[current.id] === opt;
                const isOther = current.id === "originPref" && opt === "Other (write-in)";
                return (
                  <div key={opt} className="space-y-3">
                    <button
                      onClick={() => onSelect(opt)}
                      className={`w-full rounded-full px-6 py-4 border-2 text-lg transition ${active ? "bg-neutral-100" : "border-neutral-300 hover:border-neutral-500"}`}
                      style={active ? { borderColor: BRAND } : {}}
                    >
                      {opt}
                    </button>
                    {isOther && active && (
                      <input
                        className="w-full rounded-xl border px-4 py-3"
                        placeholder="Type preferred origin"
                        value={answers.originOther || ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, originOther: e.target.value }))}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {current.type === "text" && (
            <div className="mt-8">
              <input
                className="w-full rounded-xl border px-4 py-3 text-lg"
                placeholder="Type your answer"
                value={answers[current.id] || ""}
                onChange={(e) => onText(e.target.value)}
              />
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button onClick={back} className="rounded-xl border px-5 py-3">Back</button>
            <button onClick={next} disabled={!answers[current.id] || submitting} className="rounded-xl px-6 py-3 text-white" style={{ backgroundColor: BRAND }}>
              {step === QUESTIONS.length - 1 ? "See results" : "Continue"}
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm" style={{ color: BRAND }}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">☕</span>
            <span>You’ll receive a proposal aligned to your needs and volume.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
