import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        "Content-Type": file.type || "audio/webm", // use the correct MIME type
      },
      body: file,
    }
  );

  const raw = await res.text();

  if (!res.ok) {
    return NextResponse.json({ error: raw }, { status: res.status });
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from Hugging Face" },
      { status: 500 }
    );
  }

  const transcript = data.text || data[0]?.generated_text || "";
  return NextResponse.json({ transcript });
}
