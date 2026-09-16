import React from 'react';
import { ProviderStatus } from '../adapters/types';

interface ProviderSelectorProps {
  providers: ProviderStatus[];
  currentProvider: string;
  onSelect: (providerId: string) => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  currentProvider,
  onSelect,
}) => {
  return (
    <div className="provider-selector">
      <h4>AI Provider</h4>
      <div className="provider-list">
        {providers.map((provider) => (
          <button
            key={provider.id}
            className={`provider-item ${
              currentProvider === provider.id ? 'active' : ''
            } ${!provider.supported ? 'unsupported' : ''}`}
            onClick={() => provider.supported && onSelect(provider.id)}
            disabled={!provider.supported}
            title={
              !provider.supported
                ? `${provider.name} is not available. Use Generic Mode.`
                : provider.detected
                ? `${provider.name} detected`
                : provider.name
            }
          >
            <div className="provider-info">
              <span className="provider-name">{provider.name}</span>
              <div className="provider-status">
                {provider.detected && (
                  <span className="status-detected">✓ Detected</span>
                )}
                {provider.autoInsert && (
                  <span className="status-auto">Auto-insert</span>
                )}
                {provider.autoDetect && (
                  <span className="status-auto">Auto-detect</span>
                )}
                {!provider.supported && (
                  <span className="status-unsupported">Not available</span>
                )}
              </div>
            </div>
            {currentProvider === provider.id && (
              <span className="provider-active">●</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
