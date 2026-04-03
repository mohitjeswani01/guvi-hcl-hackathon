const API_URL = "https://hcl-idp-backend.onrender.com/api/document-analyze";

export interface AnalyzeResponse {
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  entities: {
    names: string[];
    dates: string[];
    organizations: string[];
    amounts: string[];
  };
  raw: Record<string, unknown>;
}

export async function analyzeDocument(
  base64: string,
  fileName: string,
  apiKey: string
): Promise<AnalyzeResponse> {
  const fileType = fileName.split('.').pop() || 'image';
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ fileName, fileType, fileBase64: base64 }),
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
