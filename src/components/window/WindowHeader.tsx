'use client'

import { CloseButton } from "./icons/Close";
import { MaximizeButton } from "./icons/Maximize";
import { MinimizeButton } from "./icons/Minimize";
import { useWindowUI } from "./WindowContext";
import styles from '../../styles/Window.module.css'
import brandStyles from '../../styles/WindowBrand.module.css'
import controlStyles from '../../styles/WindowControls.module.css'
import { WindowHeaderProps } from "../../types";
import useIsMobile from "../../hooks/useIsMobile";
import { MOBILE_BREAKPOINT } from "../../store/constants";

export default function WindowHeader({ onClose, title, icon, canMinimize, canMaximize, canClose }: WindowHeaderProps) {
  const {
    drag,
    isMaximized,
    isMinimized,
    minimize,
    maximize,
    restore
  } = useWindowUI()

  const isMobile = useIsMobile(MOBILE_BREAKPOINT)

  return (
    <div
      className={`window-header ${styles.header}`}
      onMouseDown={drag}
    >
      <span className={`window-title ${brandStyles.title}`}>
        {icon && <span className={`window-icon ${brandStyles.windowIcon} ${brandStyles.brandText}`}>{icon}</span>}
        <span className={`brand-text ${brandStyles.brandText}`}>
          {title}
        </span>
      </span>

      <div className={`window-controls ${controlStyles.controls}`}>
        <MinimizeButton onClick={minimize} isMinimized={isMinimized} disabled={canMinimize === false} />
        <MaximizeButton onClick={isMaximized ? restore : maximize} isMaximized={isMaximized} disabled={canMaximize === false || isMobile} />
        <CloseButton onClose={onClose} disabled={canClose === false} />
      </div>
    </div>
  )
}