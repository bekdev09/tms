export function getFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const fileNameMatch = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(disposition);
  const encoded = fileNameMatch?.[1] ?? fileNameMatch?.[2] ?? fileNameMatch?.[3];
  return encoded ? decodeURIComponent(encoded) : null;
}