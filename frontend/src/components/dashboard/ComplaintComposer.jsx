import { useEffect, useState } from "react";
import useVoiceInput from "../../hooks/useVoiceInput.js";

const chipBase =
  "inline-flex h-10 cursor-pointer items-center gap-[7px] rounded-full border-2 px-4 text-[0.8rem] font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50";
const chipIdle = `${chipBase} border-[#cfe0f5] bg-[#f4f9ff] text-[#1f55b8] hover:border-[#a9c8f2] hover:bg-[#e6f1ff]`;
const fieldFocus =
  "outline-none transition focus:border-[#2f6fe0] focus:ring-4 focus:ring-[#2f6fe0]/15 placeholder:text-[#9fb2cc]";

const MAX_PHOTO_MB = 5;

/**
 * onSubmit({ description, location, photo }) must return a promise.
 * Throw an Error inside it to show a message under the button.
 */
export default function ComplaintComposer({ onSubmit }) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [lang, setLang] = useState("en-IN");
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const voice = useVoiceInput({ lang, onTranscript: setDescription });

  // preview for the optional photo
  useEffect(() => {
    if (!photo) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";                       // lets the same file be chosen again
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrors((x) => ({ ...x, photo: "Please choose an image file." }));
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setErrors((x) => ({ ...x, photo: `Photo is too large. Max ${MAX_PHOTO_MB} MB.` }));
    setErrors((x) => ({ ...x, photo: "" }));
    setPhoto(file);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setErrors((x) => ({ ...x, loc: "Your browser can't share location. Please type it." }));
    setErrors((x) => ({ ...x, loc: "" }));
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // Turning coordinates into a street name needs a geocoding service later.
        setLocation(`Current location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
        setLocating(false);
      },
      () => {
        setErrors((x) => ({ ...x, loc: "Couldn't get your location. Please type it instead." }));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (voice.listening) voice.stop();

    const text = description.trim();
    const place = location.trim();
    const next = {
      desc: text.length < 10 ? "Please describe the problem in a few words." : "",
      loc: place ? "" : "Please tell us where the problem is.",
    };
    setErrors(next);
    if (next.desc || next.loc) return;

    setSubmitting(true);
    try {
      await onSubmit({ description: text, location: place, photo });
      setDescription("");
      setLocation("");
      setPhoto(null);
    } catch (err) {
      setErrors({ form: err.message || "Couldn't submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // the small helper line under the voice/photo buttons
  const note = !voice.supported
    ? { text: "Voice typing isn't supported in this browser. You can still type your complaint.", err: false }
    : voice.error
    ? { text: voice.error, err: true }
    : voice.listening
    ? { text: "Speak now. You can edit the text before submitting.", err: false }
    : errors.photo
    ? { text: errors.photo, err: true }
    : { text: "Photo is optional.", err: false };

  return (
    <aside
      aria-labelledby="composer-title"
      className="rounded-[36px_36px_36px_12px] bg-white/90 px-6 pb-[22px] pt-6 shadow-[0_18px_44px_rgba(47,111,184,0.22)] max-[920px]:order-first"
    >
      <h2 id="composer-title" className="text-[1.25rem] font-bold">What's the problem?</h2>
      <p className="mb-3.5 mt-0.5 text-[0.8rem] text-[#5b7396]">Tell us what's happening. We'll try to solve it.</p>

      <form onSubmit={handleSubmit} noValidate>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Describe your complaint"
          placeholder="Describe the problem… e.g. Garbage hasn't been collected on Main Market Road for 4 days."
          className={`min-h-28 w-full resize-y rounded-[20px] border-2 border-[#cfe0f5] bg-white px-4 py-3.5 text-[0.88rem] font-medium leading-normal text-[#14305e] ${fieldFocus}`}
        />
        <p className="ml-1 min-h-[1.1em] text-[0.72rem] text-[#c4284d]">{errors.desc}</p>

        <div className="mb-1 mt-2.5 flex flex-wrap items-center gap-2">
          {/* voice */}
          <button
            type="button"
            disabled={!voice.supported}
            aria-pressed={voice.listening}
            onClick={() => (voice.listening ? voice.stop() : voice.start(description))}
            className={
              voice.listening
                ? `${chipBase} mic-on border-[#ff9fb6] bg-[#ffe9ee] text-[#c4284d]`
                : chipIdle
            }
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1A7 7 0 0 0 19 12h-2Z" />
            </svg>
            {voice.listening && (
              <span className="inline-flex h-4 items-center gap-0.5" aria-hidden="true">
                <i className="eq-bar" /><i className="eq-bar" /><i className="eq-bar" /><i className="eq-bar" />
              </span>
            )}
            {voice.listening ? "Listening… tap to stop" : "Speak"}
          </button>

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={!voice.supported || voice.listening}
            aria-label="Voice language"
            className="h-10 rounded-full border-2 border-[#cfe0f5] bg-white px-2.5 text-[0.78rem] font-semibold text-[#14305e] disabled:opacity-50"
          >
            <option value="en-IN">English</option>
            <option value="hi-IN">हिन्दी</option>
          </select>

          {/* optional photo */}
          <label className={chipIdle}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
            Add photo
            <input type="file" accept="image/*" onChange={handlePhoto} hidden />
          </label>
        </div>

        <p className={`ml-1 min-h-[1.1em] text-[0.72rem] ${note.err ? "text-[#c4284d]" : "text-[#5b7396]"}`}>{note.text}</p>

        {photo && (
          <div className="mt-2.5 flex items-center gap-2.5">
            <img src={previewUrl} alt="Selected photo preview" className="h-16 w-16 rounded-[16px_16px_16px_5px] border-2 border-[#cfe0f5] object-cover" />
            <span className="flex-1 truncate text-[0.76rem] text-[#5b7396]">{photo.name}</span>
            <button
              type="button"
              onClick={() => setPhoto(null)}
              aria-label="Remove photo"
              className="h-7 w-7 cursor-pointer rounded-full border-0 bg-[#ffe9ee] font-bold text-[#c4284d]"
            >
              ×
            </button>
          </div>
        )}

        {/* required location */}
        <div className="mt-3 flex gap-2 max-[480px]:flex-col">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location"
            placeholder={locating ? "Finding you…" : "Where is it? (area, street, landmark)"}
            className={`h-[46px] w-full rounded-full border-2 border-[#cfe0f5] bg-white px-[18px] text-[0.88rem] font-medium text-[#14305e] ${fieldFocus}`}
          />
          <button type="button" onClick={useMyLocation} disabled={locating} className={`${chipIdle} !h-[46px] shrink-0 max-[480px]:!h-10 max-[480px]:self-start`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.9 3A9 9 0 0 0 13 3.1V1h-2v2.1A9 9 0 0 0 3.1 11H1v2h2.1A9 9 0 0 0 11 20.9V23h2v-2.1a9 9 0 0 0 7.9-7.9H23v-2h-2.1ZM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
            </svg>
            Use my location
          </button>
        </div>
        <p className="ml-1 min-h-[1.1em] text-[0.72rem] text-[#c4284d]">{errors.loc}</p>

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 h-[50px] w-full cursor-pointer rounded-full bg-linear-to-br from-[#4b8bf0] to-[#2457c5] text-[0.98rem] font-semibold text-white shadow-[0_10px_24px_rgba(47,111,224,0.38)] transition hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(47,111,224,0.5)] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#2f6fe0]/45 active:scale-[0.985] disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Submitting…" : "Submit complaint"}
        </button>
        {errors.form && <p role="alert" className="mt-2 text-center text-[0.78rem] text-[#c4284d]">{errors.form}</p>}
      </form>
    </aside>
  );
}
