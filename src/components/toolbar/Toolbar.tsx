import { useWindows, useWindowActions } from '../../store/window-system-context'
import useToolbar from '../../hooks/useToolbar'
import { ToolbarProps } from './common/toolbarTypes'
import ToolbarDesktop from './desktop/ToolbarDesktop'
import ToolbarMobile from './mobile/ToolbarMobile'
import useIsMobile from '../../hooks/useIsMobile'

/**
 * Main toolbar component. Provides all options available to open windows.
 * @param windows - Array of window instances to be displayed in the toolbar.
 */
export default function Toolbar({ toolbarItems, ...props }: ToolbarProps) {

  const { openWindow, closeWindow } = useWindowActions()
  const currentWindows = useWindows()
  const { isOpen, toggleOpen, setIsOpen } = useToolbar()
  const isMobile = useIsMobile()

  return (
    <>
      {
        isMobile ? (
          <ToolbarMobile
            openWindow={openWindow}
            toolbarItems={toolbarItems}
            currentWindows={currentWindows}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            setIsOpen={setIsOpen}
          />
        ) : (
          <ToolbarDesktop
            openWindow={openWindow}
            closeWindow={closeWindow}
            toolbarItems={toolbarItems}
            currentWindows={currentWindows}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            setIsOpen={setIsOpen}
            showLogo={props.showLogo}
          />
        )}
    </>
  )
}