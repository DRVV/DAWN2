// components/FeedbackPanel.js

import { useState, useEffect, useRef } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'; // Import icons
import styles from './FeedbackPanel.module.css';

export default function FeedbackPanel({ element, onClose }) {

  const [panelStyle, setPanelStyle] = useState({});
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);
  const [feedback, setFeedback] = useState({
    name: '',
    affiliate: '',
    rating: '',
    comments: '',
  });

  useEffect(() => {
    if (element && element.position) {
      const panelWidth = 300; // Must match the CSS width
      const panelHeight = 400; // Must match the CSS max-height

      let top = element.position.y + 10;
      let left = element.position.x + 10;

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust if panel exceeds viewport width
      if (left + panelWidth > viewportWidth) {
        left = viewportWidth - panelWidth - 20; // 20px padding
      }

      // Adjust if panel exceeds viewport height
      if (top + panelHeight > viewportHeight) {
        top = viewportHeight - panelHeight - 20; // 20px padding
      }

      setPanelStyle({
        top: top,
        left: left,
      });

      // Trigger the visibility for transition
      // Delay to allow the panel to be positioned before making it visible
      setTimeout(() => {
        setVisible(true);
      }, 10);
    }
  }, [element]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setVisible(false);
        setTimeout(() => {
          onClose();
        }, 300); // Match the transition duration
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleRatingClick = (rating) => {
    setFeedback({ ...feedback, rating });
  };


  // ... inside handleSubmit function

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!feedback.rating) {
    alert('Please select a rating.');
    return;
  }

  const feedbackData = {
    elementType: element.type,
    elementId: element.id,
    name: feedback.name,
    affiliate: feedback.affiliate,
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
      // alert('Feedback submitted successfully.');
      setFeedback({ name: '', affiliate: '', rating: '', comments: '' });
      setVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      alert('Failed to submit feedback.');
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert('An error occurred while submitting feedback.');
  }

  // ... rest of the code
};


  if (!element) return null;

  return (
    <div
      className={`${styles.panel} ${visible ? styles.panelVisible : ''}`}
      style={panelStyle}
      ref={panelRef}
      role="dialog"
      aria-labelledby="feedback-title"
    >
      <div className={styles.header}>
        <span className={styles.title}>
          Feedback for {element.type} {element.id}
        </span>
        <button
          className={styles.closeButton}
          onClick={() => {
            setVisible(false);
            setTimeout(() => {
              onClose();
            }, 300);
          }}
          aria-label="Close Feedback Panel"
        >
          &times;
        </button>
      </div>
      

      <form onSubmit={handleSubmit}>
        

        {/* Rating Field */}
        <div className={styles.formGroup}>
          <label>Rating:</label>
          <div className={styles.buttonGroup}>
            {/* ... existing rating buttons ... */}
            <button
              type="button"
              className={`${styles.ratingButton} ${
                feedback.rating === 'good' ? styles.selected : ''
              }`}
              onClick={() => handleRatingClick('good')}
              aria-label="Good"
            >
              <FaThumbsUp className={styles.icon} /> Good
            </button>
            <button
              type="button"
              className={`${styles.ratingButton} ${
                feedback.rating === 'bad' ? styles.selected : ''
              }`}
              onClick={() => handleRatingClick('bad')}
              aria-label="Bad"
            >
              <FaThumbsDown className={styles.icon} /> Bad
            </button>
          </div>
        </div>

        {/* Comments Field */}
        <div className={styles.formGroup}>
          <label htmlFor="comments">Comments:</label>
          <textarea
            id="comments"
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
