/**
 * Save a generated file to the visitor's device.
 * On a normal website this is a plain download link; the hook lets an
 * embedding host (like the Claude preview) supply its own save dialog.
 */
type Saver = (filename: string, blob: Blob) => Promise<boolean>;

let customSaver: Saver | null = null;
export function setSaver(fn: Saver | null) {
  customSaver = fn;
}

export async function saveFile(filename: string, blob: Blob): Promise<boolean> {
  if (customSaver) return customSaver(filename, blob);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
