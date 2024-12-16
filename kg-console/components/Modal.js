// components/Modal.js
import React from 'react';
import styles from './Modal.module.css';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {children}
        <button className={styles.closeButton} onClick={onClose}>x</button>
      </div>
    </div>
  );
}
