import { useEffect } from 'react';
import { AppStateAction } from '../../Utils/TypesExport';

export default function useOptionShortcut(
  isShown: boolean,
  dispatcher: React.Dispatch<AppStateAction>
) {
  // Update generated queries when options change
  useEffect(() => {
    if (isShown) {
      document.addEventListener('keydown', keyDownHandler);
    }

    function keyDownHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        dispatcher({ type: 'setOptionShown', payload: false });
      }
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [dispatcher, isShown]);
}
