import { memo, useCallback } from 'react';
import ToolbarButton from '../common/ToolbarButton';
import { WindowDefinition, WindowInstance } from '../../../types';

export const OptionButtonItem = memo(({ window, currentWindows, openWindow }: {
  window: WindowDefinition,
  currentWindows: WindowInstance[],
  openWindow: (w: WindowDefinition) => void
}) => {
  const isActive = currentWindows.some((ow) => ow.id === window.id);
  const handleOpen = useCallback(() => openWindow(window), [openWindow, window]);

  return (
    <ToolbarButton
      icon={window.icon}
      label={window.title}
      onClick={handleOpen}
      isActive={isActive}
    />
  );
});
