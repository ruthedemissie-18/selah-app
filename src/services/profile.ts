// Profile persistence. There is no backend yet, so these resolve with the cleaned
// values the account would store; swap the bodies for API calls later.

export interface LocationFields {
  city: string;
  state: string;
  country: string;
}

export interface SavedLocation extends LocationFields {
  /** "City, State, Country" or "City, Country"; empty when no location is set. */
  display: string;
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const AVATAR_SIZE = 256;

/** A place name must contain at least one letter, so "123" or "--" are rejected. */
export function isValidPlace(value: string): boolean {
  return /\p{L}/u.test(value.trim());
}

export function isLocationEmpty({ city, state, country }: LocationFields): boolean {
  return !city.trim() && !state.trim() && !country.trim();
}

export interface LocationErrors {
  city?: string;
  state?: string;
  country?: string;
}

/** Empty is allowed (location not set). Otherwise City and Country are required and State is optional. */
export function validateLocation(fields: LocationFields): LocationErrors {
  if (isLocationEmpty(fields)) return {};
  const errors: LocationErrors = {};
  if (!isValidPlace(fields.city)) errors.city = 'Enter your city';
  if (fields.state.trim() && !isValidPlace(fields.state)) errors.state = 'Enter a valid state or region';
  if (!isValidPlace(fields.country)) errors.country = 'Enter your country';
  return errors;
}

export function formatLocation({ city, state, country }: LocationFields): string {
  return [city, state, country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

export async function saveLocation(fields: LocationFields): Promise<SavedLocation> {
  const clean = { city: fields.city.trim(), state: fields.state.trim(), country: fields.country.trim() };
  return { ...clean, display: formatLocation(clean) };
}

/** Returns an error message for files we won't accept, or null if the file is fine. */
export function checkPhotoFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Choose an image file';
  if (file.size > MAX_PHOTO_BYTES) return 'Photo must be 5 MB or smaller';
  return null;
}

/** Scales the image so its longest side is at most 256px and returns it as a data URL. */
export async function resizePhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, AVATAR_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // WebP keeps transparency; browsers without WebP encoding fall back to PNG.
    return canvas.toDataURL('image/webp', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function saveAvatar(dataUrl: string | null): Promise<string | null> {
  return dataUrl;
}
