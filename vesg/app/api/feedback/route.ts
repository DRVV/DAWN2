import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { reviewer_name, feedback_text } = await req.json();
  const stmt = db.prepare(`
    INSERT INTO feedback (reviewer_name, feedback_text)
    VALUES (?, ?)
  `);
  stmt.run(reviewer_name, feedback_text);
  return NextResponse.json({ status: 'ok' });
}

export async function GET(req: NextRequest) {
    const reviewer = req.nextUrl.searchParams.get('reviewer_name');
  
    if (reviewer) {
      const stmt = db.prepare(`
        SELECT *
        FROM feedback
        WHERE reviewer_name = ?
        ORDER BY submitted_at DESC
        LIMIT 1
      `);
      const row = stmt.get(reviewer);
      return NextResponse.json(row ?? {});
    }
  
    // Default: latest per reviewer
    const stmt = db.prepare(`
      SELECT *
      FROM (
        SELECT *
        FROM feedback
        ORDER BY submitted_at DESC
      )
      GROUP BY reviewer_name
    `);
    const rows = stmt.all();
    return NextResponse.json(rows);
  }
  