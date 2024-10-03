// components/FeedbackPanel.js

import { useState, useEffect, useRef } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'; // Import icons
import styles from './FeedbackPanel.module.css';


export default function FeedbackPanel({ element, onClose }) {
  const [feedback, setFeedback] = useState({
    name: '',
    affiliate: '',
    rating: '',
    comments: '',
  });
  const [panelStyle, setPanelStyle] = useState({});
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);

  // Load name and affiliate from sessionStorage on component mount
  useEffect(() => {
    const storedName = sessionStorage.getItem('userName') || '';
    const storedAffiliate = sessionStorage.getItem('userAffiliate') || '';
    setFeedback((prevFeedback) => ({
      ...prevFeedback,
      name: storedName,
      affiliate: storedAffiliate,
    }));
  }, []);

  // Positioning and visibility logic (same as before)
  useEffect(() => {
    if (element && element.position) {
      // Calculate panel position
      const panelWidth = 350;
      const panelHeight = 550;

      let top = element.position.y + 10;
      let left = element.position.x + 10;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left + panelWidth > viewportWidth) {
        left = viewportWidth - panelWidth - 20;
      }

      if (top + panelHeight > viewportHeight) {
        top = viewportHeight - panelHeight - 20;
      }

      setPanelStyle({
        top: top,
        left: left,
      });

      // Trigger the visibility for transition
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prevFeedback) => {
      const updatedFeedback = { ...prevFeedback, [name]: value };

      // Save name and affiliate to sessionStorage
      if (name === 'name') {
        sessionStorage.setItem('userName', value);
      } else if (name === 'affiliate') {
        sessionStorage.setItem('userAffiliate', value);
      }

      return updatedFeedback;
    });
  };

  const handleRatingClick = (rating) => {
    setFeedback({ ...feedback, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.rating || !feedback.name || !feedback.affiliate) {
      alert('Please fill in all required fields.');
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
        alert('Feedback submitted successfully.');
        setFeedback((prevFeedback) => ({
          ...prevFeedback,
          rating: '',
          comments: '',
        }));
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
        {/* Fields for name and affiliate */}
        <div className={styles.formGroup}>
          <label>Your Name:</label>
          <input
            type="text"
            name="name"
            className={styles.inputField}
            placeholder="Enter your name"
            value={feedback.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Your Affiliate:</label>
          <input
            type="text"
            name="affiliate"
            className={styles.inputField}
            placeholder="Enter your affiliate"
            value={feedback.affiliate}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Rating buttons */}
        <div className={styles.formGroup}>
          <label>Rating:</label>
          <div className={styles.buttonGroup}>
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

        {/* Comments field */}
        <div className={styles.formGroup}>
          <label>Comments:</label>
          <textarea
            className={styles.textArea}
            name="comments"
            placeholder="Enter your comments"
            value={feedback.comments}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
