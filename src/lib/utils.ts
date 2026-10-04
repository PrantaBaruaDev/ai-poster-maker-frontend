export { cn } from "cn";

export function buildDownloadUrl(originalUrl: string, filename?: string): string {
  try {
    const url = new URL(originalUrl);

    if (!url.hostname.includes("res.cloudinary.com")) {
      return originalUrl;
    }

    const marker = "/image/upload/";
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return originalUrl;

    const before = url.pathname.slice(0, idx + marker.length);
    const after = url.pathname.slice(idx + marker.length);

    let flag = "fl_attachment";
    if (filename) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, ""); // Strips .png, .jpg, etc.
      flag = `fl_attachment:${encodeURIComponent(nameWithoutExt)}`;
    }

    url.pathname = `${before}${flag}/${after}`;
    return url.toString();
  } catch {
    return originalUrl;
  }
}

export async function downloadAsBlob(url: string, filename: string): Promise<void> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}