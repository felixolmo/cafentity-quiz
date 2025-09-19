"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import Image from "next/image";

type QOption = { value: string; labelEn: string; labelEs: string };
type Q = { id: string; labelEn: string; labelEs: string; type: "choice" | "text"; options?: QOption[] };

const BRAND = "#7b4b2a";

const QUESTIONS: Q[] = [
  {
    id: "goal",
    labelEn: "What is your primary objective?",
    labelEs: "¿Cuál es su objetivo principal?",
    type: "choice",
    options: [
      { value: "wholesale_green", labelEn: "Wholesale green coffee (import/export)", labelEs: "Café verde al por mayor (importación/exportación)" },
      { value: "retail_green", labelEn: "Retail green coffee (home roaster/hobbyist)", labelEs: "Café verde minorista (tostador en casa/aficionado)" },
      { value: "white_label_shops", labelEn: "White Label for specialty coffee shops", labelEs: "Marca blanca para cafeterías de especialidad" },
      { value: "white_label_orgs", labelEn: "White Label for organizations", labelEs: "Marca blanca para organizaciones" },
      { value: "contract_roasting", labelEn: "Contract roasting", labelEs: "Tostado por contrato" },
      { value: "brand_tech", labelEn: "Brand launch & marketing (tech-enabled)", labelEs: "Lanzamiento de marca y marketing (con tecnología)" },
      { value: "origin_partnership", labelEn: "Planting / origin partnership", labelEs: "Siembra / alianza en origen" }
    ]
  },
  {
    id: "volume",
    labelEn: "Approximate monthly volume (metric tons / pounds)",
    labelEs: "Volumen mensual aproximado (toneladas métricas / libras)",
    type: "choice",
    options: [
      { value: "under_500kg", labelEn: "Under 500 kg (≈ 1,100 lb)", labelEs: "Menos de 500 kg (≈ 1,100 lb)" },
      { value: "500kg_2t", labelEn: "500 kg–2 t (≈ 1,100–4,400 lb)", labelEs: "500 kg–2 t (≈ 1,100–4,400 lb)" },
      { value: "2_10t", labelEn: "2–10 t (metric tons, ≈ 4,400–22,000 lb)", labelEs: "2–10 t (toneladas métricas, ≈ 4,400–22,000 lb)" },
      { value: "10_50t", labelEn: "10–50 t (metric tons, ≈ 22,000–110,000 lb)", labelEs: "10–50 t (toneladas métricas, ≈ 22,000–110,000 lb)" },
      { value: "50t_plus", labelEn: "50 t+ (metric tons, ≈ 110,000+ lb)", labelEs: "50 t+ (toneladas métricas, ≈ 110,000+ lb)" }
    ]
  },
  {
    id: "originPref",
    labelEn: "Preferred origins",
    labelEs: "Orígenes preferidos",
    type: "choice",
    options: [
      { value: "colombia", labelEn: "Colombia", labelEs: "Colombia" },
      { value: "brazil", labelEn: "Brazil", labelEs: "Brasil" },
      { value: "central_america", labelEn: "Central America", labelEs: "Centroamérica" },
      { value: "puerto_rico", labelEn: "Puerto Rico", labelEs: "Puerto Rico" },
      { value: "dominican_republic", labelEn: "Dominican Republic", labelEs: "República Dominicana" },
      { value: "open", labelEn: "Open to recommendations", labelEs: "Abierto a recomendaciones" },
      { value: "other", labelEn: "Other (write-in)", labelEs: "Otro (especificar)" }
    ]
  },
  {
    id: "process",
    labelEn: "Processing preference",
    labelEs: "Preferencia de proceso",
    type: "choice",
    options: [
      { value: "washed", labelEn: "Washed", labelEs: "Lavado" },
      { value: "natural", labelEn: "Natural", labelEs: "Natural" },
      { value: "honey", labelEn: "Honey", labelEs: "Honey" },
      { value: "experimental", labelEn: "Experimental", labelEs: "Experimental" },
      { value: "none", labelEn: "No preference", labelEs: "Sin preferencia" }
    ]
  },
  {
    id: "certs",
    labelEn: "Certifications needed",
    labelEs: "Certificaciones necesarias",
    type: "choice",
    options: [
      { value: "organic", labelEn: "Organic", labelEs: "Orgánico" },
      { value: "fairtrade", labelEn: "Fairtrade", labelEs: "Comercio Justo" },
      { value: "rainforest", labelEn: "Rainforest", labelEs: "Rainforest" },
      { value: "none", labelEn: "None", labelEs: "Ninguna" }
    ]
  },
  {
    id: "roastProfile",
    labelEn: "Roast profile",
    labelEs: "Perfil de tueste",
    type: "choice",
    options: [
      { value: "light", labelEn: "Light", labelEs: "Claro" },
      { value: "medium", labelEn: "Medium", labelEs: "Medio" },
      { value: "dark", labelEn: "Dark", labelEs: "Oscuro" },
      { value: "multiple", labelEn: "Multiple/Custom", labelEs: "Múltiple/Personalizado" },
      { value: "na", labelEn: "N/A", labelEs: "N/A" }
    ]
  },
  {
    id: "packaging",
    labelEn: "Packaging requirement",
    labelEs: "Requisito de empaque",
    type: "choice",
    options: [
      { value: "250g", labelEn: "250 g", labelEs: "250 g" },
      { value: "12oz_340g", labelEn: "12 oz / 340 g", labelEs: "12 oz / 340 g" },
      { value: "1kg", labelEn: "1 kg", labelEs: "1 kg" },
      { value: "5lb", labelEn: "5 lb", labelEs: "5 lb" },
      { value: "custom", labelEn: "Custom", labelEs: "Personalizado" },
      { value: "na", labelEn: "N/A", labelEs: "N/A" }
    ]
  },
  {
    id: "incoterm",
    labelEn: "Incoterms/shipping",
    labelEs: "Incoterms/envío",
    type: "choice",
    options: [
      { value: "EXW", labelEn: "EXW", labelEs: "EXW" },
      { value: "FOB", labelEn: "FOB", labelEs: "FOB" },
      { value: "CIF", labelEn: "CIF", labelEs: "CIF" },
      { value: "DDP", labelEn: "DDP", labelEs: "DDP" },
      { value: "unsure", labelEn: "Unsure/Discuss", labelEs: "No seguro/Hablar" }
    ]
  },
  {
    id: "timeline",
    labelEn: "When do you want to start?",
    labelEs: "¿Cuándo desea comenzar?",
    type: "choice",
    options: [
      { value: "asap", labelEn: "ASAP", labelEs: "Lo antes posible" },
      { value: "1_3_months", labelEn: "1–3 months", labelEs: "1–3 meses" },
      { value: "3_plus_months", labelEn: "3+ months", labelEs: "Más de 3 meses" }
    ]
  },
  {
    id: "priceTier",
    labelEn: "Price tier",
    labelEs: "Rango de precio",
    type: "choice",
    options: [
      { value: "value", labelEn: "Value-focused", labelEs: "Enfocado en valor" },
      { value: "mid", labelEn: "Mid-range", labelEs: "Gama media" },
      { value: "premium", labelEn: "Premium/micro-lot", labelEs: "Premium/micro-lote" },
      { value: "undecided", labelEn: "Undecided", labelEs: "Indeciso" }
    ]
  },
  { id: "name", labelEn: "Name", labelEs: "Nombre", type: "text" },
  { id: "email", labelEn: "Email", labelEs: "Correo electrónico", type: "text" },
  { id: "phone", labelEn: "Phone", labelEs: "Teléfono", type: "text" }
];

const LeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  consent: z.boolean().refine((v) => v === true)
});

export default function Quiz() {
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") === "es" ? "es" : "en";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ path: string; summary: string[] } | null>(null);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", consent: false });
  const [submitting, setSubmitting] = useState(false);

  const current = QUESTIONS[step];
  const progress = useMemo(() => Math.round((step / QUESTIONS.length) * 100), [step]);

  const L = {
    qOf: lang === "es" ? "Pregunta" : "Question",
    basedOn: lang === "es" ? "Según sus respuestas. No es asesoría formal." : "Based on your answers. Not formal advice.",
    consult: lang === "es" ? "Solicitar una consulta" : "Request a consultation",
    agree: lang === "es" ? "Acepto ser contactado por teléfono, correo o SMS." : "I agree to be contacted by phone, email, or SMS.",
    continue: lang === "es" ? "Continuar" : "Continue",
    back: lang === "es" ? "Atrás" : "Back",
    seeResults: lang === "es" ? "Ver resultados" : "See results",
    submitting: lang === "es" ? "Enviando..." : "Submitting...",
    info: lang === "es" ? "Recibirá una propuesta alineada a sus necesidades y volumen." : "You’ll receive a proposal aligned to your needs and volume.",
    placeholderAnswer: lang === "es" ? "Escriba su respuesta" : "Type your answer"
  };

  function optLabel(o: QOption) {
    return lang === "es" ? o.labelEs : o.labelEn;
  }

  function qLabel(q: Q) {
    return lang === "es" ? q.labelEs : q.labelEn;
  }

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
    if (current.id === "originPref" && answers.originPref === "other" && !answers.originOther) return;
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setSubmitting(true);
      const res = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, lang })
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
      body: JSON.stringify({ answers, result, lead, lang })
    });
    setSubmitting(false);
    setResult({ path: result?.path || "submitted", summary: [lang === "es" ? "Gracias. Nuestro equipo se pondrá en contacto pronto." : "Thank you. Our team will contact you shortly."] });
  }

  const recTitle =
    result?.path === "green_trade_wholesale" ? (lang === "es" ? "Recomendación: Café verde al por mayor (importación/exportación)" : "Recommendation: Wholesale Green Coffee (Import/Export)") :
    result?.path === "green_trade_retail" ? (lang === "es" ? "Recomendación: Café verde minorista" : "Recommendation: Retail Green Coffee") :
    result?.path === "white_label_shops" ? (lang === "es" ? "Recomendación: Marca blanca para cafeterías de especialidad" : "Recommendation: White Label for Specialty Coffee Shops") :
    result?.path === "white_label_orgs" ? (lang === "es" ? "Recomendación: Marca blanca para organizaciones" : "Recommendation: White Label for Organizations") :
    result?.path === "roasting_services" ? (lang === "es" ? "Recomendación: Tostado por contrato" : "Recommendation: Contract Roasting") :
    result?.path === "brand_tech" ? (lang === "es" ? "Recomendación: Lanzamiento de marca y marketing" : "Recommendation: Brand Launch & Marketing") :
    result?.path === "origin_programs" ? (lang === "es" ? "Recomendación: Siembra / alianza en origen" : "Recommendation: Planting / Origin Partnership") :
    lang === "es" ? "Resultado preliminar" : "Preliminary result";

  if (result) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden bg-white">
          <div className="px-6 py-6 border-b">
            <h1 className="text-2xl font-semibold" style={{ color: BRAND }}>{recTitle}</h1>
            <p className="mt-2 text-sm text-neutral-600">{L.basedOn}</p>
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
              <h2 className="text-lg font-medium" style={{ color: BRAND }}>{L.consult}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="rounded-xl border px-4 py-3" placeholder={lang === "es" ? "Nombre" : "Name"} value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                <input className="rounded-xl border px-4 py-3" placeholder={lang === "es" ? "Correo electrónico" : "Email"} value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                <input className="rounded-xl border px-4 py-3 md:col-span-2" placeholder={lang === "es" ? "Teléfono" : "Phone"} value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} />
                <span>{L.agree}</span>
              </label>
              <button disabled={submitting} onClick={submitLead} className="w-full rounded-xl px-6 py-4 text-white" style={{ backgroundColor: BRAND }}>
                {submitting ? L.submitting : L.consult}
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
            <div className="text-sm font-medium" style={{ color: BRAND }}>{L.qOf} {step + 1} / {QUESTIONS.length}</div>
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
          <h1 className="text-3xl md:text-4xl font-semibold text-center" style={{ color: BRAND }}>{qLabel(current)}</h1>

          {current.type === "choice" && current.options && (
            <div className="mt-8 grid gap-4">
              {current.options.map((opt) => {
                const active = answers[current.id] === opt.value;
                const isOther = current.id === "originPref" && opt.value === "other";
                return (
                  <div key={opt.value} className="space-y-3">
                    <button
                      onClick={() => onSelect(opt.value)}
                      className={`w-full rounded-full px-6 py-4 border-2 text-lg transition ${active ? "bg-neutral-100" : "border-neutral-300 hover:border-neutral-500"}`}
                      style={active ? { borderColor: BRAND } : {}}
                    >
                      {optLabel(opt)}
                    </button>
                    {isOther && active && (
                      <input
                        className="w-full rounded-xl border px-4 py-3"
                        placeholder={lang === "es" ? "Escriba el origen preferido" : "Type preferred origin"}
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
                placeholder={L.placeholderAnswer}
                value={answers[current.id] || ""}
                onChange={(e) => onText(e.target.value)}
              />
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button onClick={back} className="rounded-xl border px-5 py-3">{L.back}</button>
            <button onClick={next} disabled={!answers[current.id] || (current.id === "originPref" && answers.originPref === "other" && !answers.originOther) || submitting} className="rounded-xl px-6 py-3 text-white" style={{ backgroundColor: BRAND }}>
              {step === QUESTIONS.length - 1 ? L.seeResults : L.continue}
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm" style={{ color: BRAND }}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">☕</span>
            <span>{L.info}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
