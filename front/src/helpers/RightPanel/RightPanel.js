import { i18n } from '../../i18n/i18n';
import { useState, useEffect } from 'react';
import './RightPanel.css';
import { toast } from 'react-toastify';

export const RightPanel = (p) => {
  const { children, onClose, mainAction } = p;
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        onClose?.();
        resolve();
      }, 300); // Correspond à la durée de l'animation
    });
  };

  return (
    <div className={`rightPanel ${isClosing ? 'closing' : ''}`}>
      <div className="rightPanelContent">{children}</div>
      <div className="rightPanelClose">
        <button className="whiteButton" onClick={handleClose}>
          {i18n.t('close')}
        </button>
        {mainAction && mainAction(handleClose)}
      </div>
    </div>
  );
};
