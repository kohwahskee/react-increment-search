import { animated } from '@react-spring/web';
import { FormEvent, useCallback, useRef } from 'react';
import BubbleIndicator from './BubbleIndicator/BubbleIndicator';
import { generateSpans } from './Helpers';
import useDynamicContainerHeight from './hooks/useDynamicContainerHeight';
import useInputShortcutHandler from './hooks/useInputShortcutHandler';
import useInputStateHandler from './hooks/useInputStateHandler';
import useInputAnimation from './useInputAnimation';
import './style.scss';
import { InputState, StorageData } from '../Utils/TypesExport';

interface SearchQuery {
  firstHalf: string;
  secondHalf: string;
  incrementable: number;
}
interface Props {
  initialInputValue: string;
  inputValue: [string, (value: string) => void];
  inputState: [InputState, (state: InputState) => void];
  setSearchQuery: (query: SearchQuery) => void;
}

export default function RichInput({
  initialInputValue,
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
      const data = localStorage.getItem('data');
      const parsedData = data ? (JSON.parse(data) as StorageData) : null;
      if (!parsedData?.searchQuery) return null;
      const { firstHalf, secondHalf, incrementable } = parsedData.searchQuery;
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

  const keyDownHandler = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        e.preventDefault();

        if (inputState === 'TYPING') {
          setInputState('SELECTING');
        }
      }

      // Makes '/' key a valid input (was used as shortcut to switch to 'TYPING')
      if (e.key === '/') {
        e.stopPropagation();
      }
    },
    [inputState, setInputState]
  );

  useInputStateHandler(
    inputState,
    setInputValue,
    inputValue,
    inputRef,
    selectedSpanRef,
    inputValueSpans,
    tempInputValue
  );

  //  Set container's height dynamically
  useDynamicContainerHeight(containerRef, inputRef, inputValue);

  // Handle keyboard shortcuts
  useInputShortcutHandler(
    inputState,
    setInputState,
    inputValue,
    selectedSpanRef,
    inputValueSpans,
    tempInputValue,
    setSearchQuery,
    numberInputSpans
  );

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
          onKeyDown={keyDownHandler}
          onBlur={() => setInputState('SELECTING')}
          onFocus={() => {
            setInputState('TYPING');
            putCaretAtEnd(inputRef.current as HTMLDivElement);
          }}
          onPaste={onPasteHandler}
          spellCheck={false}
          contentEditable
          suppressContentEditableWarning
        >
          {initialInputValue}
        </div>
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
