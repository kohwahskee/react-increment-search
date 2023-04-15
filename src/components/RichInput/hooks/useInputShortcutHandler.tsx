import { useEffect } from 'react';
import { InputState, SearchQuery } from '../../Utils/TypesExport';
import { parseSearchQuery } from '../Helpers';

export default function useInputShortcutHandler(
  inputState: InputState,
  setInputState: (state: InputState) => void,
  inputValue: string,
  selectedSpanRef: React.MutableRefObject<HTMLSpanElement | null>,
  inputValueSpans: React.MutableRefObject<HTMLSpanElement[]>,
  tempInputValue: React.MutableRefObject<string | null>,
  setSearchQuery: (query: SearchQuery) => void,
  numberInputSpans: React.MutableRefObject<HTMLSpanElement[]>
) {
  // Keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', keyDownHandler);

    function keyDownHandler(e: KeyboardEvent) {
      switch (e.key) {
        case '/': {
          e.preventDefault();
          setInputState('TYPING');
          break;
        }

        case 'Enter': {
          if (
            inputState === 'SELECTING' &&
            inputValue !== '' &&
            numberInputSpans.current.length > 0
          ) {
            tempInputValue.current = inputValue;
            setInputState('FINISHED');
            setSearchQuery(
              parseSearchQuery(selectedSpanRef.current, inputValueSpans.current)
            );
          }

          break;
        }

        default:
          break;
      }
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [
    inputState,
    inputValue,
    inputValueSpans,
    numberInputSpans,
    selectedSpanRef,
    setInputState,
    setSearchQuery,
    tempInputValue,
  ]);
}
