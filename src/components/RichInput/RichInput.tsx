import { animated } from '@react-spring/web';
import { FormEvent, useCallback, useEffect, useRef } from 'react';
import BubbleIndicator from './BubbleIndicator/BubbleIndicator';
import useInputAnimation from './useInputAnimation';
import './style.scss';
import { InputState } from '../Utils/TypesExport';

interface SearchQuery {
  firstHalf: string;
  secondHalf: string;
  incrementable: number;
}
interface Props {
  inputValue: [string, (value: string) => void];
  inputState: [InputState, (state: InputState) => void];
  setSearchQuery: (query: SearchQuery) => void;
}

export default function RichInput({
  inputValue: [inputValue, setInputValue],
  inputState: [inputState, setInputState],
  setSearchQuery,
}: Props) {
  const INPUT_PLACEHOLDER = 'Search...';
  const containerSpring = useInputAnimation(inputState);

  const selectedSpanRef = useRef<HTMLSpanElement | null>(null);

  const setSelectedSpan = (span: HTMLSpanElement | null) => {
    selectedSpanRef.current = span;
  };

  const tempInputValue = useRef<string | null>(
    (() => {
      const queryFromStorage = localStorage.getItem('lastQuery');
      if (queryFromStorage === null) return null;
      const parsedQueryFromStorage = JSON.parse(
        queryFromStorage
      ) as SearchQuery;
      const { firstHalf, secondHalf, incrementable } = parsedQueryFromStorage;

      return `${firstHalf}${incrementable}${secondHalf}`;
    })()
  );
  const inputRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const placeHolderRef = useRef<HTMLDivElement>(null);
  const numberInputSpans = useRef<HTMLSpanElement[]>([]);
  const inputValueSpans = useRef<HTMLSpanElement[]>([]);

  // To make sure input caret is in the center
  const DEFAULT_WIDTH = inputValue === '' ? '1rem' : '90%';

  const onInputHandler = useCallback(
    (e: FormEvent) => {
      const text = (e.target as HTMLDivElement).innerText;

      if (text === '\n') {
        // contentEditable will add <br> when empty
        setInputValue('');
        return;
      }

      setInputValue(text);
    },
    [setInputValue]
  );

  const onPasteHandler = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const plainText = e.clipboardData
      .getData('text/plain')
      .replaceAll(/\n+/g, ' ');
    document.execCommand('insertText', false, plainText);
  }, []);

  const inputEnterHandler = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        e.preventDefault();

        if (inputState === 'TYPING') {
          setInputState('SELECTING');
        }
      }
    },
    [inputState, setInputState]
  );

  function parseSearchQuery(
    currentSpan: HTMLSpanElement | null,
    spanList: HTMLSpanElement[]
  ) {
    let firstHalf = '';
    let secondHalf = '';
    const incrementable = parseInt(currentSpan?.innerText || '', 10);
    let flip = false;
    spanList.forEach((span) => {
      if (span === currentSpan) {
        flip = true;
        return;
      }

      if (!flip) {
        firstHalf += span.innerText;
      } else {
        secondHalf += span.innerText;
      }
    });
    return {
      firstHalf,
      secondHalf,
      incrementable,
    };
  }

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

      putCaretAtEnd(inputRef.current as HTMLDivElement);
    }

    function inputSelectingHandler() {
      inputRef.current?.blur();
    }
  }, [inputState, inputValue, setInputValue, setSearchQuery]);

  //  Set container's height dynamically
  useEffect(() => {
    if (!containerRef.current || !inputRef.current) return;
    containerRef.current.style.height = `${inputRef.current.offsetHeight}px`;
  }, [inputValue]);

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
  }, [inputState, inputValue, setInputState, setSearchQuery]);

  return (
    <animated.div
      style={containerSpring}
      className={`rich-input-container ${
        inputState !== 'TYPING' ? 'not-typing' : ''
      } ${inputState === 'FINISHED' ? 'result-screen' : ''} `}
      ref={containerRef}
    >
      <div
        className={`text-container ${
          inputState === 'SELECTING' && inputValue.length > 0 ? 'selecting' : ''
        }`}
        onClick={() => {
          setInputState('TYPING');
        }}
      >
        <span
          ref={placeHolderRef}
          style={{
            color: inputValue === '' ? 'rgba(255,255,255,.5)' : 'transparent',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          id="input-placeholder"
        >
          {INPUT_PLACEHOLDER}
        </span>

        <div className="span-container" style={{ width: DEFAULT_WIDTH }}>
          {(() => {
            numberInputSpans.current = [];
            inputValueSpans.current = [];
            return generateSpans(
              inputValueSpans,
              numberInputSpans,
              inputValue,
              inputState
            );
          })()}
        </div>

        <div
          className="rich-input"
          style={{ width: DEFAULT_WIDTH }}
          ref={inputRef}
          onInput={onInputHandler}
          onKeyDown={inputEnterHandler}
          onBlur={() => setInputState('SELECTING')}
          onFocus={() => setInputState('TYPING')}
          onPaste={onPasteHandler}
          spellCheck={false}
          contentEditable
          suppressContentEditableWarning
        />
      </div>
      <BubbleIndicator
        setSelectedSpan={setSelectedSpan}
        inputState={inputState}
        numberInputSpans={numberInputSpans.current}
      />
    </animated.div>
  );
}

function putCaretAtEnd(el: HTMLElement) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function shortenQuery(query: SearchQuery, limit: number) {
  let shortenedString: string;

  if (Number.isNaN(query.incrementable)) {
    shortenedString = `${query.firstHalf.slice(0, limit)}...`;
  } else {
    const firstHalf = query.firstHalf.slice(0, limit / 2);
    const secondHalf = query.secondHalf.slice((limit / 2) * -1);
    const { incrementable } = query;
    shortenedString = `${firstHalf}...${incrementable}${
      query.secondHalf.length > limit / 2 ? '...' : ''
    } ${secondHalf}`;
  }

  return shortenedString;
}

function generateSpans(
  inputSpansRef: React.MutableRefObject<HTMLSpanElement[]>,
  numberSpansRef: React.MutableRefObject<HTMLSpanElement[]>,
  inputValue: string,
  inputState: InputState
) {
  if (inputValue === '') return null;
  const spans = inputValue.match(/\s+|\S+/g)?.map((word, index) => {
    const isNumber = word.match(/^\s*\d+\s*$/g)?.length === 1;
    return (
      <span
        ref={(el) => {
          if (!el) return;
          inputSpansRef.current.push(el);
          if (isNumber) numberSpansRef.current.push(el);
        }}
        data-isnumber={isNumber}
        className={`text-span ${inputState === 'SELECTING' ? 'selecting' : ''}`}
        // eslint-disable-next-line react/no-array-index-key
        key={`${word}-${index}`}
      >
        {`${word}`}
      </span>
    );
  });
  return spans;
}
