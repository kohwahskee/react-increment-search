import { useEffect } from 'react';
import { InputState } from '../../Utils/TypesExport';
import { parseSearchQuery, shortenQuery } from '../Helpers';

export default function useInputStateHandler(
  inputState: InputState,
  setInputValue: (value: string) => void,
  inputValue: string,
  inputRef: React.MutableRefObject<HTMLDivElement | null>,
  selectedSpanRef: React.MutableRefObject<HTMLSpanElement | null>,
  inputValueSpans: React.MutableRefObject<HTMLSpanElement[]>,
  tempInputValue: React.MutableRefObject<string | null>
) {
  // Handle input state change
  useEffect(() => {
    switch (inputState) {
      case 'TYPING':
        inputTypingHandler();
        break;
      case 'SELECTING':
        inputSelectingHandler();
        break;
      case 'FINISHED':
        inputFinishedHandler();
        break;
      default:
        break;
    }

    function inputFinishedHandler() {
      const searchQuery = parseSearchQuery(
        selectedSpanRef.current,
        inputValueSpans.current
      );
      const STRING_LENGTH_LIMIT = 25;
      const shortenedString = shortenQuery(searchQuery, STRING_LENGTH_LIMIT);

      // tempInputValue.current = inputValue;

      if (inputValue.length > STRING_LENGTH_LIMIT) {
        setInputValue(shortenedString);
        (inputRef.current as HTMLDivElement).innerText = shortenedString;
      }
    }

    function inputTypingHandler() {
      inputRef.current?.focus();

      if (tempInputValue.current !== null) {
        setInputValue(tempInputValue.current);
        (inputRef.current as HTMLDivElement).innerText = tempInputValue.current;
        tempInputValue.current = null;
      }
    }

    function inputSelectingHandler() {
      inputRef.current?.blur();
    }
  }, [
    inputRef,
    inputState,
    inputValue,
    inputValueSpans,
    selectedSpanRef,
    setInputValue,
    tempInputValue,
  ]);
}
