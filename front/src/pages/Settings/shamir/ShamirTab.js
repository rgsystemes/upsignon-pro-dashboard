import React, { useState, useEffect } from 'react';
import { NewShamirConfig } from './NewShamirConfig';
import { ShamirRequests } from './ShamirRequests';
import { CurrentConfig } from './CurrentConfig';
import { ShamirPresentation } from './ShamirPresentation';
import { ConfigurationHistory } from './ConfigurationHistory';
import { toast } from 'react-toastify';
import { bankUrlFetch } from '../../../helpers/urlFetch';
import { i18n } from '../../../i18n/i18n';
import './ShamirTabs.css';
import { EditIcon } from '../../../helpers/icons/EditIcon';
import { PersonRoundIcon } from '../../../helpers/icons/PersonRoundIcon';
import { FileIcon } from '../../../helpers/icons/FileIcon';

const shamirPages = {
  presentation: 'presentation',
  currentConfig: 'currentConfig',
  newConfig: 'newConfig',
  requests: 'requests',
  configurationHistory: 'configurationHistory',
};

// Props : setIsLoading
export const ShamirTab = (p) => {
  const { setIsLoading } = p;
  const [currentPage, setCurrentPage] = useState(null);
  const cancelNewConfig = () => {
    setCurrentPage(shamirPages.presentation);
  };
  const onConfigCreated = () => {
    setCurrentPage('currentConfig');
  };

  const [currentConfig, setCurrentConfig] = useState(null);
  const fetchCurrentConfig = async () => {
    try {
      setIsLoading(true);
      const { currentConfig } = await bankUrlFetch('/api/shamir-current-config', 'POST', null);
      setCurrentConfig(currentConfig);
      if (!!currentConfig) {
        setCurrentPage(shamirPages.currentConfig);
      } else {
        setCurrentPage(shamirPages.presentation);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const showNav =
    currentPage === shamirPages.currentConfig ||
    currentPage === shamirPages.requests ||
    currentPage === shamirPages.configurationHistory;
  return (
    <div style={{ marginTop: 20 }} className="shamirTabs">
      {showNav && (
        <nav className="shamirTabsMenu">
          <button
            onClick={() => setCurrentPage(shamirPages.currentConfig)}
            className={`shamirTabItem ${currentPage === shamirPages.currentConfig ? 'current' : ''}`}
          >
            <span className="navIcon">
              <EditIcon size={16} />
            </span>
            {i18n.t('shamir_tab_config')}
          </button>
          <button
            onClick={() => setCurrentPage(shamirPages.requests)}
            className={`shamirTabItem ${currentPage === shamirPages.requests ? 'current' : ''}`}
          >
            <span className="navIcon">
              <PersonRoundIcon size={16} />
            </span>
            {i18n.t('shamir_tab_requests')}
          </button>
          <button
            onClick={() => setCurrentPage(shamirPages.configurationHistory)}
            className={`shamirTabItem ${currentPage === shamirPages.configurationHistory ? 'current' : ''}`}
          >
            <span className="navIcon">
              <FileIcon size={16} />
            </span>
            {i18n.t('shamir_tab_history')}
          </button>
        </nav>
      )}
      <div className="shamirTabContent">
        {currentPage === shamirPages.presentation && (
          <ShamirPresentation onStartConfig={() => setCurrentPage(shamirPages.newConfig)} />
        )}
        {currentPage === shamirPages.newConfig && (
          <NewShamirConfig
            setIsLoading={p.setIsLoading}
            onCancel={cancelNewConfig}
            onConfigCreated={onConfigCreated}
          />
        )}
        {currentPage === shamirPages.currentConfig && (
          <CurrentConfig currentConfig={currentConfig} />
        )}
        {currentPage === shamirPages.requests && <ShamirRequests />}
        {currentPage === shamirPages.configurationHistory && <ConfigurationHistory />}
      </div>
    </div>
  );
};
