import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-950/90 border border-amber-800/80 px-3 py-1.5 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-xs">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Mode hors ligne actif — Données locales chiffrées & calculs 100% disponibles.</span>
    </div>
  );
};
