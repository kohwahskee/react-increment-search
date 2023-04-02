import { useEffect, useState } from 'react';

export default function useOptionToggle(isShown: boolean) {
  const [optionShown, setOptionShown] = useState(isShown);

  // Update generated queries when options change
  useEffect(() => {
    if (optionShown) {
      document.addEventListener('keydown', keyDownHandler);
    }

    function keyDownHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOptionShown(false);
      }
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [optionShown]);
  return [optionShown, setOptionShown] as const;
}
