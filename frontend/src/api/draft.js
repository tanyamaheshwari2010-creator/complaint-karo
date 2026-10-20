// What a visitor wrote on the home page, kept while they sign up or log in.
// The photo (a File) can't go into storage, so it is held in memory. That works because moving
// between /signup, /login and /dashboard doesn't reload the page. If the page IS reloaded,
// the text and the map pin survive (sessionStorage) but the photo does not.
const KEY = "complaintDraft";
let memory = null;

export function saveDraft({
  description = "",
  location = "",
  photo = null,
  latitude = null,
  longitude = null,
  locationAccuracy = null,
}) {
  memory = { description, location, photo, latitude, longitude, locationAccuracy };
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ description, location, latitude, longitude, locationAccuracy }));
  } catch {
    /* storage may be blocked; the in-memory copy still works */
  }
}

// Reading does not delete it (React may render twice in development). It is deleted by clearDraft().
export function peekDraft() {
  if (memory) return memory;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...JSON.parse(raw), photo: null } : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  memory = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
