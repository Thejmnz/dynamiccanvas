const MAX_DIMENSION = 2200;
const JPEG_QUALITY = 0.92;

export async function resizeImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const img = await loadImageElement(file);
  const maxDim = Math.max(img.width, img.height);

  if (maxDim <= MAX_DIMENSION) return file;

  const scale = MAX_DIMENSION / maxDim;
  const targetWidth = Math.round(img.width * scale);
  const targetHeight = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const isPng = file.type === "image/png";
  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b!),
      isPng ? "image/png" : "image/jpeg",
      isPng ? undefined : JPEG_QUALITY,
    );
  });

  const ext = isPng ? ".png" : ".jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], baseName + ext, { type: isPng ? "image/png" : "image/jpeg" });
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
