import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { reviewer_id, reviewer_name, feedback_text, feedback_result } = await req.json();

  if (!reviewer_id || !reviewer_name || !feedback_text || !['OK', 'NG'].includes(feedback_result)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const stmt = db.prepare(`
    INSERT INTO feedback (reviewer_id, reviewer_name, feedback_text, feedback_result)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(reviewer_id, reviewer_name, feedback_text, feedback_result);
  return NextResponse.json({ status: 'ok' });
}

export async function GET(req: NextRequest) {
  const reviewerId = req.nextUrl.searchParams.get('reviewer_id');

  if (reviewerId) {
    const stmt = db.prepare(`
      SELECT *
      FROM feedback
      WHERE reviewer_id = ?
      ORDER BY submitted_at DESC
      LIMIT 1
    `);
    const row = stmt.get(reviewerId);
    return NextResponse.json(row ?? {});
  }

  // Return latest feedback per reviewer_id
  const stmt = db.prepare(`
    SELECT *
    FROM (
      SELECT *
      FROM feedback
      ORDER BY submitted_at DESC
    )
    GROUP BY reviewer_id
  `);
  const rows = stmt.all();
  return NextResponse.json(rows);
}
