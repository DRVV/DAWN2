// app/api/getWords/route.ts
import { NextResponse } from 'next/server';

// Mock data example
const MOCK_WORDS = [
  { word: 'apple', vector: [0.1, 0.2, 0.7] },
  { word: 'banana', vector: [0.1, 0.2, 0.8] },
  { word: 'car', vector: [0.9, 0.1, 0.0] },
];

// Example similarity calculation (cosine similarity)
function cosineSimilarity(v1: number[], v2: number[]): number {
  const dot = v1.reduce((acc, val, i) => acc + val * v2[i], 0);
  const mag1 = Math.sqrt(v1.reduce((acc, val) => acc + val * val, 0));
  const mag2 = Math.sqrt(v2.reduce((acc, val) => acc + val * val, 0));
  return dot / (mag1 * mag2);
}

export async function GET() {
  try {
    // 1. In a real scenario, you'd query Milvus here. 
    //    For demonstration, we'll use MOCK_WORDS.
    const dataFromMilvus = MOCK_WORDS;

    // 2. Build nodes
    const nodes = dataFromMilvus.map((item, index) => ({
      id: index,
      label: item.word,
    }));

    // 3. Build edges based on threshold
    const threshold = 0.85;
    const edges = [];
    for (let i = 0; i < dataFromMilvus.length; i++) {
      for (let j = i + 1; j < dataFromMilvus.length; j++) {
        const sim = cosineSimilarity(
          dataFromMilvus[i].vector,
          dataFromMilvus[j].vector
        );
        if (sim > threshold) {
          edges.push({
            source: i,
            target: j,
            similarity: sim,
          });
        }
      }
    }

    // 4. Return the data as JSON using NextResponse
    return NextResponse.json({ nodes, links: edges });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
