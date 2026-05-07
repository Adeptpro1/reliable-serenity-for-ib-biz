import React from 'react';

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal">
        <div className="modern-modal-header">
          <h2 className="modern-modal-title">{title}</h2>
          <button onClick={onClose} className="modern-modal-close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="modern-modal-close-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="modern-modal-content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
