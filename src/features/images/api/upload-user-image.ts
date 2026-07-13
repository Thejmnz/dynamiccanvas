export type UploadedUserImage = {
  id: string;
  name: string;
  path: string;
  url: string;
};

export async function uploadUserImage(file: File): Promise<UploadedUserImage> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/user-uploads", {
    method: "POST",
    body: formData,
  });
  const data = await response.json() as UploadedUserImage & { error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error || "Could not upload image");
  }

  return data;
}
