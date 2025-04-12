// app/api/test-mongo/route.ts (App Router syntax)

import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(); // default DB from URI
    const collection = db.collection('feedback');

    const doc = await collection.insertOne({ message: 'Test OK', time: new Date() });

    return NextResponse.json({ success: true, insertedId: doc.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
