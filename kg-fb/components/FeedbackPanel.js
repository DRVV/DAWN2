// components/FeedbackPanel.js
import { useState, useEffect, useRef } from 'react';
import styles from './FeedbackPanel.module.css';

export default function FeedbackPanel({ element, onClose, position }) {
  const [feedback, setFeedback] = useState({ rating: '', comments: '' });
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    // Trigger the visibility for transition after mounting
    setTimeout(() => {
      setVisible(true);
    }, 10);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the transition duration
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.rating) {
      alert('Please select a rating.');
      return;
    }

    const feedbackData = {
      elementType: element.type,
      elementId: element.id,
      rating: feedback.rating,
      comments: feedback.comments,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        alert('Feedback submitted successfully.');
        setFeedback({ rating: '', comments: '' });
        handleClose();
      } else {
        alert('Failed to submit feedback.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('An error occurred while submitting feedback.');
    }
  };

  // Calculate position styles from props
  const panelStyle = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    zIndex: 1000,
  };

  return (
    <div
      className={`${styles.panel} ${visible ? styles.panelVisible : ''}`}
      style={panelStyle}
      ref={panelRef}
    >
      <div className={styles.header}>
        <span className={styles.title}>
          Feedback for {element.type} {element.id}
        </span>
        <button className={styles.closeButton} onClick={handleClose}>
          &times;
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Rating:</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="rating"
                value="good"
                checked={feedback.rating === 'good'}
                onChange={(e) =>
                  setFeedback({ ...feedback, rating: e.target.value })
                }
              />
              Good
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="rating"
                value="bad"
                checked={feedback.rating === 'bad'}
                onChange={(e) =>
                  setFeedback({ ...feedback, rating: e.target.value })
                }
              />
              Bad
            </label>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Comments:</label>
          <textarea
            className={styles.textArea}
            placeholder="Enter your comments"
            value={feedback.comments}
            onChange={(e) =>
              setFeedback({ ...feedback, comments: e.target.value })
            }
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
