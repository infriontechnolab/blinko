import { useEffect, useState } from "react";
import { MapPin, LocateFixed, X, Loader2, Check } from "lucide-react";

type Coords = { lat: number; lon: number };

// A few preset delivery areas with rough coordinates for the map preview.
const PRESETS: { label: string; coords: Coords }[] = [
  { label: "21 Queen Mary Drive, Brampton ON L7A 1X7", coords: { lat: 43.7305, lon: -79.7791 } },
  { label: "Connaught Place, Delhi", coords: { lat: 28.6315, lon: 77.2167 } },
  { label: "Cyber Hub, Gurugram", coords: { lat: 28.4949, lon: 77.089 } },
  { label: "Bandra, Mumbai", coords: { lat: 19.0596, lon: 72.8295 } },
  { label: "Koramangala, Bengaluru", coords: { lat: 12.9352, lon: 77.6245 } },
];

function osmEmbed({ lat, lon }: Coords) {
  const d = 0.012;
  const bbox = `${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
}

export function LocationPicker({
  open,
  value,
  onClose,
  onSelect,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (label: string) => void;
}) {
  const [coords, setCoords] = useState<Coords>(PRESETS[0].coords);
  const [label, setLabel] = useState(value);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLabel(value);
      setError(null);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  const detect = () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation isn't available in this browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(c);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&zoom=16&lat=${c.lat}&lon=${c.lon}`,
          );
          const data = await res.json();
          const a = data.address ?? {};
          const area =
            a.suburb ||
            a.neighbourhood ||
            a.city_district ||
            a.town ||
            a.village ||
            a.city ||
            (typeof data.display_name === "string" ? data.display_name.split(",")[0] : null) ||
            "Current location";
          setLabel(a.postcode ? `${area} ${a.postcode}` : area);
        } catch {
          setLabel("Current location");
        }
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Pick an area below instead."
            : "Couldn't detect your location. Pick an area below.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-hidden />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Delivery location
            </p>
            <h2 className="font-heading text-xl font-bold">Where should we deliver?</h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <button
            onClick={detect}
            disabled={detecting}
            className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-70"
          >
            {detecting ? (
              <Loader2 className="size-5 shrink-0 animate-spin" />
            ) : (
              <LocateFixed className="size-5 shrink-0" />
            )}
            {detecting ? "Detecting your location…" : "Use my current location"}
          </button>

          {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

          {/* Map preview */}
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <iframe
              key={`${coords.lat},${coords.lon}`}
              title="Delivery location map"
              src={osmEmbed(coords)}
              className="h-56 w-full"
              loading="lazy"
            />
          </div>

          {/* Selected label */}
          <label className="mt-4 block text-xs font-semibold text-muted-foreground">
            Delivering to
          </label>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-border px-3">
            <MapPin className="size-4 shrink-0 text-primary" />
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-11 flex-1 bg-transparent text-sm outline-none"
              placeholder="Area, landmark or PIN code"
            />
          </div>

          {/* Presets */}
          <p className="mt-5 text-xs font-semibold text-muted-foreground">Popular areas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setCoords(p.coords);
                  setLabel(p.label);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  label === p.label
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <footer className="border-t border-border p-4">
          <button
            onClick={() => onSelect(label.trim() || "Current location")}
            disabled={!label.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check className="size-4" /> Deliver here
          </button>
        </footer>
      </div>
    </div>
  );
}
