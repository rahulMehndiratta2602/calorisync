"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Camera,
  Mic,
  Type,
  Upload,
  Loader2,
  Check,
  X,
  Sparkles,
  Edit3,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ParsedItem {
  name: string;
  grams: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  confidence: number;
}

interface ParseResult {
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "other";
  summary: string;
  items: ParsedItem[];
  overall_confidence: number;
  notes?: string;
}

export function LogMealClient() {
  const router = useRouter();
  const [tab, setTab] = React.useState<"photo" | "voice" | "text" | "manual">("photo");
  const [parsing, setParsing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [result, setResult] = React.useState<ParseResult | null>(null);
  const [source, setSource] = React.useState<"photo" | "voice" | "text" | "manual">("photo");

  async function parse(args: {
    mode: "photo" | "text";
    text?: string;
    imageBase64?: string;
    imageMimeType?: string;
  }) {
    setParsing(true);
    setResult(null);
    try {
      const res = await fetch("/api/meals/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "AI couldn't parse that. Try again or use text mode.");
        return;
      }
      setResult(json.parsed);
      if (json.parsed.overall_confidence >= 0.7) {
        toast.success(
          `Parsed in ${Math.round((json.usage?.output_tokens ?? 0) / 50)}s — review and save.`,
        );
      } else {
        toast.info("Low confidence — review and edit before saving.");
      }
    } catch (err) {
      toast.error("Network error parsing meal.");
      console.error(err);
    } finally {
      setParsing(false);
    }
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/meals/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          meal_type: result.meal_type,
          source,
          summary: result.summary,
          items: result.items,
          overall_confidence: result.overall_confidence,
          note: result.notes,
          ai_raw: result as unknown as Record<string, unknown>,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "Couldn't save meal.");
        return;
      }
      toast.success(`Logged ${json.totals.kcal} kcal.`);
      router.push("/console");
      router.refresh();
    } catch (err) {
      toast.error("Network error saving meal.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as typeof tab);
          setSource(v as typeof source);
          setResult(null);
        }}
      >
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="photo">
            <Camera className="size-3.5" /> Photo
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="size-3.5" /> Voice
          </TabsTrigger>
          <TabsTrigger value="text">
            <Type className="size-3.5" /> Text
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Plus className="size-3.5" /> Quick add
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photo">
          <PhotoPanel parsing={parsing} onParse={parse} />
        </TabsContent>
        <TabsContent value="voice">
          <VoicePanel parsing={parsing} onParse={(t) => parse({ mode: "text", text: t })} />
        </TabsContent>
        <TabsContent value="text">
          <TextPanel parsing={parsing} onParse={(t) => parse({ mode: "text", text: t })} />
        </TabsContent>
        <TabsContent value="manual">
          <ManualPanel router={router} />
        </TabsContent>
      </Tabs>

      {parsing && <ParsingSkeleton />}

      {result && !parsing && (
        <ResultCard result={result} setResult={setResult} onSave={save} saving={saving} />
      )}
    </div>
  );
}

// ───────── Photo panel ─────────

function PhotoPanel({
  parsing,
  onParse,
}: {
  parsing: boolean;
  onParse: (args: { mode: "photo"; imageBase64: string; imageMimeType: string }) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  async function handleFile(file: File) {
    if (file.size > 12 * 1024 * 1024) {
      toast.error("Photo too large (max 12 MB).");
      return;
    }
    const { dataUrl, base64, mime } = await resizeImage(file, 1280);
    setPreview(dataUrl);
    onParse({ mode: "photo", imageBase64: base64, imageMimeType: mime });
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div
          className={cn(
            "relative flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors",
            dragOver && "border-primary bg-primary/5",
            parsing && "opacity-60",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Meal preview"
              className="max-h-72 w-auto rounded-xl object-cover shadow-md"
            />
          ) : (
            <>
              <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Camera className="size-6" />
              </div>
              <div>
                <p className="font-medium">Drop a photo here</p>
                <p className="text-sm text-muted-foreground">
                  Or click below — JPEG/PNG/WebP up to 12 MB
                </p>
              </div>
            </>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={parsing}
              size="lg"
            >
              <Upload className="size-4" />
              {preview ? "Replace photo" : "Choose photo"}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                disabled={parsing}
              >
                Clear
              </Button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ───────── Voice panel ─────────

function VoicePanel({
  parsing,
  onParse,
}: {
  parsing: boolean;
  onParse: (text: string) => void;
}) {
  const [supported, setSupported] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const recogRef = React.useRef<unknown>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: { new (): SpeechRecognitionLike };
      webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  function start() {
    const w = window as unknown as {
      SpeechRecognition?: { new (): SpeechRecognitionLike };
      webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (event) => {
      const text = Array.from(event.results)
        .map((res) => res[0].transcript)
        .join(" ");
      setTranscript(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => {
      setListening(false);
      toast.error("Couldn't transcribe. Try again or use text mode.");
    };
    r.start();
    setListening(true);
    recogRef.current = r;
  }

  function stop() {
    (recogRef.current as SpeechRecognitionLike | null)?.stop();
    setListening(false);
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 p-8">
        {!supported && (
          <p className="text-sm text-muted-foreground">
            Voice not supported in this browser. Use Chrome, Edge, or Safari.
          </p>
        )}

        <div className="relative">
          {listening && <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />}
          <button
            type="button"
            disabled={!supported || parsing}
            onClick={listening ? stop : start}
            className={cn(
              "relative grid size-24 place-items-center rounded-full text-primary-foreground shadow-lg transition-all",
              listening ? "bg-destructive shadow-destructive/30" : "bg-primary shadow-primary/30",
              "disabled:opacity-50",
            )}
            aria-label={listening ? "Stop listening" : "Start listening"}
          >
            <Mic className="size-9" />
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {listening ? "Listening — describe what you ate" : "Tap to start"}
        </p>

        {transcript && (
          <div className="w-full max-w-md rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Transcript</p>
            <p className="mt-1">{transcript}</p>
          </div>
        )}

        {transcript && !listening && (
          <Button size="lg" onClick={() => onParse(transcript)} disabled={parsing}>
            <Sparkles className="size-4" /> Parse with AI
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start(): void;
  stop(): void;
}

// ───────── Text panel ─────────

function TextPanel({
  parsing,
  onParse,
}: {
  parsing: boolean;
  onParse: (text: string) => void;
}) {
  const [text, setText] = React.useState("");
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <Textarea
          rows={6}
          placeholder="Describe your meal. Example: 'Two slices of sourdough toast with avocado, a poached egg, and a shot of espresso.'"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={parsing}
          className="text-base"
        />
        <Button
          type="button"
          size="lg"
          onClick={() => onParse(text)}
          disabled={parsing || text.trim().length < 4}
          className="self-start"
        >
          <Sparkles className="size-4" /> Parse with AI
        </Button>
      </CardContent>
    </Card>
  );
}

// ───────── Parsing skeleton ─────────

function ParsingSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-6">
        <Loader2 className="size-5 animate-spin text-primary" />
        <div>
          <p className="text-sm font-medium">AI is parsing your meal...</p>
          <p className="text-xs text-muted-foreground">Usually takes 3–7 seconds.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ───────── Result card ─────────

function ResultCard({
  result,
  setResult,
  onSave,
  saving,
}: {
  result: ParseResult;
  setResult: (r: ParseResult | null) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const totals = result.items.reduce(
    (acc, it) => ({
      kcal: acc.kcal + it.kcal,
      protein: acc.protein + it.protein_g,
      carbs: acc.carbs + it.carbs_g,
      fat: acc.fat + it.fat_g,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const lowConfidence = result.overall_confidence < 0.7;

  function updateItem(idx: number, patch: Partial<ParsedItem>) {
    const items = result.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    setResult({ ...result, items });
  }

  function removeItem(idx: number) {
    setResult({ ...result, items: result.items.filter((_, i) => i !== idx) });
  }

  return (
    <Card className={cn("border-2", lowConfidence && "border-amber-500/40")}>
      <CardContent className="p-6 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant={lowConfidence ? "soft" : "success"} className="mb-2">
              {lowConfidence ? (
                <>
                  <Edit3 className="size-3" />
                  Review suggested ({Math.round(result.overall_confidence * 100)}% confidence)
                </>
              ) : (
                <>
                  <Sparkles className="size-3" />
                  {Math.round(result.overall_confidence * 100)}% confidence
                </>
              )}
            </Badge>
            <h3 className="font-display text-2xl font-medium tracking-tight">{result.summary}</h3>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {result.meal_type} · {result.items.length} item{result.items.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
            <p className="font-display text-3xl font-medium tabular-nums">
              {Math.round(totals.kcal)} kcal
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F{" "}
              {Math.round(totals.fat)}g
            </p>
          </div>
        </header>

        {result.notes && (
          <div className="mt-4 rounded-xl bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {result.notes}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {result.items.map((it, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_4rem_5rem_2rem] items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
            >
              <div className="min-w-0">
                <Input
                  value={it.name}
                  onChange={(e) => updateItem(idx, { name: e.target.value })}
                  className="h-8 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:bg-card focus-visible:px-2"
                />
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  P {Math.round(it.protein_g)}g · C {Math.round(it.carbs_g)}g · F{" "}
                  {Math.round(it.fat_g)}g · {Math.round(it.confidence * 100)}%
                </p>
              </div>
              <Input
                type="number"
                value={it.grams}
                onChange={(e) =>
                  updateItem(idx, { grams: Math.max(0, Number(e.target.value) || 0) })
                }
                className="h-8 px-1.5 text-center text-xs"
                aria-label="grams"
              />
              <Input
                type="number"
                value={Math.round(it.kcal)}
                onChange={(e) =>
                  updateItem(idx, { kcal: Math.max(0, Number(e.target.value) || 0) })
                }
                className="h-8 px-1.5 text-center text-xs"
                aria-label="calories"
              />
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => removeItem(idx)}
                className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={onSave} size="lg" disabled={saving || result.items.length === 0}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="size-4" />
                Save meal
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={() => setResult(null)} disabled={saving}>
            Discard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ───────── Manual quick-add panel ─────────

function ManualPanel({ router }: { router: ReturnType<typeof useRouter> }) {
  const [name, setName] = React.useState("");
  const [grams, setGrams] = React.useState("100");
  const [kcal, setKcal] = React.useState("");
  const [protein, setProtein] = React.useState("");
  const [carbs, setCarbs] = React.useState("");
  const [fat, setFat] = React.useState("");
  const [mealType, setMealType] = React.useState<"breakfast" | "lunch" | "dinner" | "snack" | "other">("other");
  const [saving, setSaving] = React.useState(false);

  async function onSave() {
    if (!name || !kcal) {
      toast.error("Name and calories are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/meals/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          meal_type: mealType,
          source: "manual",
          summary: name,
          overall_confidence: 1.0,
          items: [
            {
              name,
              grams: Number(grams) || 0,
              kcal: Number(kcal) || 0,
              protein_g: Number(protein) || 0,
              carbs_g: Number(carbs) || 0,
              fat_g: Number(fat) || 0,
              confidence: 1.0,
            },
          ],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "Couldn't save.");
        return;
      }
      toast.success(`Logged ${json.totals.kcal} kcal.`);
      router.push("/console");
      router.refresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Food name
          </label>
          <Input
            placeholder="e.g. Brown rice (cooked)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Serving (g)" value={grams} onChange={setGrams} placeholder="100" />
          <Field label="Calories" value={kcal} onChange={setKcal} placeholder="215" required />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Protein (g)" value={protein} onChange={setProtein} placeholder="5" />
          <Field label="Carbs (g)" value={carbs} onChange={setCarbs} placeholder="45" />
          <Field label="Fat (g)" value={fat} onChange={setFat} placeholder="2" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Meal type
          </label>
          <div className="flex flex-wrap gap-2">
            {(["breakfast", "lunch", "dinner", "snack", "other"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  mealType === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setMealType(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Button size="lg" onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="size-4" /> Log meal
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ───────── Image resize helper ─────────

async function resizeImage(
  file: File,
  maxDim: number,
): Promise<{ dataUrl: string; base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const ratio = Math.min(1, maxDim / Math.max(width, height));
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas 2d unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const mime = "image/jpeg";
      const dataUrl = canvas.toDataURL(mime, 0.86);
      const base64 = dataUrl.split(",")[1];
      resolve({ dataUrl, base64, mime });
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = URL.createObjectURL(file);
  });
}
