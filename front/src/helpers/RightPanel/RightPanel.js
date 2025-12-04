import { i18n } from '../../i18n/i18n';
import { useState } from 'react';
import './RightPanel.css';

export const RightPanel = (p) => {
  const { children, onClose } = p;
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // Correspond à la durée de l'animation
  };

  return (
    <div className={`rightPanel ${isClosing ? 'closing' : ''}`}>
      <div className="rightPanelContent">{children}</div>
      <div className="rightPanelClose">
        <button onClick={handleClose}>{i18n.t('close')}</button>
      </div>
    </div>
  );
};
