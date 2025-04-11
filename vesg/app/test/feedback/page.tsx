'use client';

import { useState, useEffect } from 'react';

export default function FeedbackTestPage() {
  const [reviewerName, setReviewerName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);

  const submitFeedback = async () => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer_name: reviewerName, feedback_text: feedbackText }),
    });
    setReviewerName('');
    setFeedbackText('');
    fetchFeedback();
  };

  const fetchFeedback = async () => {
    const res = await fetch('/api/feedback');
    const data = await res.json();
    setFeedbackList(data);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Feedback Form</h2>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Reviewer Name"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Your Feedback"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />
        <button onClick={submitFeedback} style={{ marginLeft: 10 }}>Submit</button>
      </div>

      <h3>Recent Feedback (Latest per Reviewer)</h3>
      <ul>
        {feedbackList.map((fb: any) => {
          const jstDate = new Date(fb.submitted_at + 'Z'); // Parse as UTC

          const pad = (n: number) => n.toString().padStart(2, '0');

          const jstDateStr = jstDate.toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          // Convert "2024/04/12 15:00:00" to "2024-04-12 15:00:00 JST"
          const isoStyleStr = jstDateStr.replace(/\//g, '-').replace(' ', ' ') + ' JST';

          return (
            <li key={fb.id}>
              <strong>{fb.reviewer_name}:</strong> {fb.feedback_text} <em>（{isoStyleStr}）</em>
            </li>
          );
        })}

      </ul>
    </div>
  );
}
