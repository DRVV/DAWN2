'use client';

import { useState, useEffect } from 'react';

export default function FeedbackTestPage() {
  const [reviewerId, setReviewerId] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedback_result, setfeedback_result] = useState<'OK' | 'NG'>('OK');
  const [feedbackList, setFeedbackList] = useState([]);

  const submitFeedback = async () => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewer_id: reviewerId,
        reviewer_name: reviewerName,
        feedback_text: feedbackText,
        feedback_result: feedback_result,
      }),
    });

    setReviewerId('');
    setReviewerName('');
    setFeedbackText('');
    setfeedback_result('OK');
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
          placeholder="Reviewer ID"
          value={reviewerId}
          onChange={(e) => setReviewerId(e.target.value)}
          style={{ marginRight: 10 }}
        />
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
          style={{ marginRight: 10 }}
        />
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <label>
            <input
              type="radio"
              value="OK"
              checked={feedback_result === 'OK'}
              onChange={() => setfeedback_result('OK')}
              style={{ marginRight: 5 }}
            />
            OK
          </label>
          <label style={{ marginLeft: 20 }}>
            <input
              type="radio"
              value="NG"
              checked={feedback_result === 'NG'}
              onChange={() => setfeedback_result('NG')}
              style={{ marginRight: 5 }}
            />
            NG
          </label>
        </div>
        <button onClick={submitFeedback}>Submit</button>
      </div>

      <h3>Recent Feedback (Latest per Reviewer)</h3>
      <ul>
        {feedbackList.map((fb: any) => {
          const jstDate = new Date(fb.submitted_at + 'Z');
          const jstString = jstDate
            .toLocaleString('ja-JP', {
              timeZone: 'Asia/Tokyo',
              hour12: false,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
            .replace(/\//g, '-') + ' JST';

          return (
            <li key={fb.id}>
              <strong>{fb.reviewer_name}</strong> ({fb.reviewer_id}) — 
              <span style={{ color: fb.feedback_result === 'OK' ? 'green' : 'red', marginLeft: 5 }}>
                [{fb.feedback_result}]
              </span>: {fb.feedback_text}
              <em style={{ marginLeft: 10 }}>（{jstString}）</em>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
