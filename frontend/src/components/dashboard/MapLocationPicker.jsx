import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [22.9734, 78.6569]; // India
const SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const MIN_GAP_MS = 1100; // the free OpenStreetMap service allows one request per second

// our own pin, so we don't depend on Leaflet's default marker images (they break in some Vite setups)
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;background:#dc2626;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px #0005"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function ClickToPick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.latitude, position.longitude], Math.max(map.getZoom(), 16));
  }, [map, position]);
  return null;
}

// A map inside a freshly opened dialog can measure itself as 0px wide. This makes it measure again.
function FixSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/**
 * A dialog for choosing the exact spot of a problem.
 * It has NO <form> inside: it is rendered next to the complaint form (never inside it),
 * and Search is a plain button, so it can never submit the complaint or reload the page.
 *
 * initial   { latitude, longitude, location } to start from (optional)
 * onConfirm({ latitude, longitude, location, locationAccuracy })
 * onCancel()
 */
export default function MapLocationPicker({ initial = null, onConfirm, onCancel }) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(
    initial?.latitude != null ? { latitude: initial.latitude, longitude: initial.longitude } : null
  );
  const [address, setAddress] = useState(initial?.latitude != null ? initial.location ?? "" : "");
  const [busy, setBusy] = useState(""); // "search" | "address" | ""
  const [error, setError] = useState("");
  const gate = useRef({ last: 0, ticket: 0 });
  const inputRef = useRef(null);

  // Escape closes the dialog; the page behind it does not scroll while it is open.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onCancel]);

  // We wait our turn instead of showing an error when two lookups come close together.
  const waitTurn = async () => {
    const wait = Math.max(0, MIN_GAP_MS - (Date.now() - gate.current.last));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    gate.current.last = Date.now();
  };

  const search = async () => {
    const text = query.trim();
    if (!text) return setError("Enter an area, street or landmark.");

    const ticket = ++gate.current.ticket; // only the newest request is allowed to update the screen
    setBusy("search");
    setError("");
    try {
      await waitTurn();
      const params = new URLSearchParams({ format: "jsonv2", q: text, limit: "1", countrycodes: "in" });
      const res = await fetch(`${SEARCH_URL}?${params}`);
      if (!res.ok) throw new Error("Address search isn't available right now. You can tap the map instead.");
      const [hit] = await res.json();
      if (ticket !== gate.current.ticket) return;
      if (!hit) return setError("No match found. Try a nearby landmark, or tap the map.");
      setPosition({ latitude: Number(hit.lat), longitude: Number(hit.lon) });
      setAddress(hit.display_name);
    } catch (e) {
      if (ticket === gate.current.ticket) setError(e.message || "Couldn't search for that address.");
    } finally {
      if (ticket === gate.current.ticket) setBusy("");
    }
  };

  const pick = async (point) => {
    const ticket = ++gate.current.ticket;
    setPosition(point);
    setAddress(`Selected point (${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)})`);
    setError("");
    setBusy("address");
    try {
      await waitTurn();
      const params = new URLSearchParams({ format: "jsonv2", lat: String(point.latitude), lon: String(point.longitude) });
      const res = await fetch(`${REVERSE_URL}?${params}`);
      if (!res.ok) throw new Error("lookup failed");
      const hit = await res.json();
      if (ticket !== gate.current.ticket) return;
      if (hit.display_name) setAddress(hit.display_name);
    } catch {
      if (ticket === gate.current.ticket) {
        setError("The spot is saved, but its address couldn't be found. You can still confirm it, or type the address yourself.");
      }
    } finally {
      if (ticket === gate.current.ticket) setBusy("");
    }
  };

  const confirm = () => {
    if (!position) return setError("Search for a place or tap the map first.");
    onConfirm({ ...position, location: address, locationAccuracy: null });
  };

  return createPortal(
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[#0b1f4d]/50 sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-picker-title"
        className="flex max-h-[94vh] w-full max-w-[640px] flex-col overflow-y-auto rounded-t-[28px] bg-white p-4 text-[#14305e] shadow-[0_24px_60px_rgba(18,48,106,0.4)] sm:rounded-[28px_28px_28px_10px] sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="map-picker-title" className="text-[1.1rem] font-bold">Choose the problem location</h3>
            <p className="mt-0.5 text-[0.8rem] text-[#5b7396]">Search for the place, then tap the map to move the pin to the exact spot.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close map"
            className="h-8 w-8 shrink-0 cursor-pointer rounded-full bg-[#eef5ff] font-bold text-[#1f55b8] hover:bg-[#dfeaff]"
          >
            ×
          </button>
        </div>

        {/* a plain row, not a <form>: Enter and the Search button both just run the search */}
        <div role="search" className="mt-3 flex gap-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Area, road, house, landmark…"
            aria-label="Search for a problem location"
            className="h-11 min-w-0 flex-1 rounded-full border-2 border-[#cfe0f5] bg-white px-4 text-[0.86rem] font-medium outline-none transition placeholder:text-[#9fb2cc] focus:border-[#2f6fe0] focus:ring-4 focus:ring-[#2f6fe0]/15"
          />
          <button
            type="button"
            onClick={search}
            disabled={busy === "search"}
            className="h-11 shrink-0 cursor-pointer rounded-full bg-linear-to-br from-[#4b8bf0] to-[#2457c5] px-5 text-[0.84rem] font-semibold text-white shadow-[0_8px_18px_rgba(47,111,224,0.3)] disabled:cursor-wait disabled:opacity-70"
          >
            {busy === "search" ? "Searching…" : "Search"}
          </button>
        </div>

        {/* "isolate" keeps the map's own layers from floating above the dialog's buttons */}
        <div className="isolate mt-3 h-[min(380px,48vh)] overflow-hidden rounded-[20px] border-2 border-[#cfe0f5]">
          <MapContainer
            center={position ? [position.latitude, position.longitude] : DEFAULT_CENTER}
            zoom={position ? 16 : 5}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FixSize />
            <ClickToPick onPick={pick} />
            <Recenter position={position} />
            {position && (
              <Marker
                position={[position.latitude, position.longitude]}
                icon={pinIcon}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const ll = e.target.getLatLng();
                    pick({ latitude: ll.lat, longitude: ll.lng });
                  },
                }}
              />
            )}
          </MapContainer>
        </div>

        <div aria-live="polite" className="mt-3 rounded-[16px] bg-[#f4f9ff] px-3.5 py-3 text-[0.82rem]">
          <p className="font-semibold">
            Selected address {busy === "address" && <span className="font-normal text-[#5b7396]">· finding the address…</span>}
          </p>
          <p className="mt-0.5 break-words text-[#5b7396]">{address || "Search for a place, or tap the map."}</p>
          {position && (
            <p className="mt-1.5 text-[0.72rem] text-[#5b7396]">
              Latitude {position.latitude.toFixed(6)} · Longitude {position.longitude.toFixed(6)}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-2 text-[0.78rem] text-[#c4284d]">
            {error}
          </p>
        )}

        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 cursor-pointer rounded-full border-2 border-[#cfe0f5] px-5 text-[0.84rem] font-semibold text-[#1f55b8] hover:bg-[#f4f9ff]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!position}
            className="h-11 cursor-pointer rounded-full bg-linear-to-br from-[#4b8bf0] to-[#2457c5] px-5 text-[0.84rem] font-semibold text-white shadow-[0_8px_18px_rgba(47,111,224,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm location
          </button>
        </div>

        <p className="mt-3 text-[0.7rem] text-[#8ea2bf]">Map data © OpenStreetMap contributors. Addresses may be approximate.</p>
      </div>
    </div>,
    document.body
  );
}
