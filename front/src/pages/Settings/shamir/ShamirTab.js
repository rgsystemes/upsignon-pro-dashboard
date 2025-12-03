import React, { useState, useEffect } from 'react';
import { NewShamirConfig } from './NewShamirConfig';
import { ShamirRequests } from './ShamirRequests';
import { CurrentConfig } from './CurrentConfig';
import { ShamirPresentation } from './ShamirPresentation';
import { toast } from 'react-toastify';
import { bankUrlFetch } from '../../../helpers/urlFetch';

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
  return (
    <div style={{ marginTop: 20 }}>
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
      {currentPage === shamirPages.currentConfig && <CurrentConfig currentConfig={currentConfig} />}
      {currentPage === shamirPages.requests && <ShamirRequests />}
      {currentPage === shamirPages.configurationHistory && <ConfigurationHistory />}
    </div>
  );
};
