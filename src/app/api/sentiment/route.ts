import { NextResponse } from 'next/server';

type SentimentLabel = 'negative' | 'neutral' | 'positive';

function mapCardiffScoreToLabel(scores: number[]): SentimentLabel {
  // cardiffnlp/twitter-roberta-base-sentiment returns scores in order: negative, neutral, positive
  const idx = scores.indexOf(Math.max(...scores));
  return idx === 0 ? 'negative' : idx === 1 ? 'neutral' : 'positive';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body?.text ?? '').toString();
    const language = (body?.language ?? '').toString();

    if (!text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (language === 'bn') {
      // Call Bangla sentiment API
      const res = await fetch('https://eyasir2047-bangla-waste-sentiment-api.hf.space/predict', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const t = await res.text();
        return NextResponse.json({ error: 'Bangla API error', details: t }, { status: 502 });
      }

      const data = await res.json();
      // Normalize to a consistent output shape
      // Expecting { text, sentiment, confidence }
      return NextResponse.json({ source: 'bangla', result: data });
    }

    const hfKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGING_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN;
    if (!hfKey) {
      return NextResponse.json({ error: 'Hugging Face API key not configured' }, { status: 500 });
    }

      // Call Hugging Face Inference API for English
      const hfRes = await fetch('https://router.huggingface.co/inference', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'cardiffnlp/twitter-roberta-base-sentiment',
          inputs: text,
        }),
      });

    if (!hfRes.ok) {
      const t = await hfRes.text();
      return NextResponse.json({ error: 'HF API error', details: t }, { status: 502 });
    }

    const hfData = await hfRes.json();
    // HF may return array of array of {label, score} or logits depending on the model hub configuration.
    // Normalize a few common shapes.
    let label: SentimentLabel | undefined;
    let scores: number[] | undefined;

    if (Array.isArray(hfData) && Array.isArray(hfData[0])) {
      // shape: [[{label, score}, ...]]
      const first = hfData[0];
      const byLabel: Record<string, number> = {};
      for (const item of first) {
        if (item && typeof item.label === 'string' && typeof item.score === 'number') {
          byLabel[item.label.toLowerCase()] = item.score;
        }
      }
      scores = [byLabel['negative'] ?? 0, byLabel['neutral'] ?? 0, byLabel['positive'] ?? 0];
      label = mapCardiffScoreToLabel(scores);
    } else if (Array.isArray(hfData) && hfData.length === 3 && typeof hfData[0] === 'number') {
      // shape: [neg, neu, pos]
      scores = hfData as number[];
      label = mapCardiffScoreToLabel(scores);
    }

    // Confidence: take max score among classes
    const confidence = scores ? Math.max(...scores) : undefined;
    return NextResponse.json({ source: 'huggingface', result: { text, sentiment: label, confidence, scores, raw: hfData } });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err?.message ?? err) }, { status: 500 });
  }
}
