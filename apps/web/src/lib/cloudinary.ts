import { adminClientApi } from "@/lib/api/admin-client";

interface UploadSignResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export async function uploadToCloudinary(
  file: File,
): Promise<{ id: string; url: string }> {
  const sigRes = await adminClientApi.POST("/api/admin/uploads/sign", {});
  if (!sigRes.response.ok)
    throw new Error(`Sign failed: ${sigRes.response.status}`);
  if (!sigRes.data)
    throw new Error("Empty response from /api/admin/uploads/sign");
  const sig = sigRes.data as unknown as UploadSignResponse;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: form },
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const json = await res.json();
  return { id: json.public_id as string, url: json.secure_url as string };
}
