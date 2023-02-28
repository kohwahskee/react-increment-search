import { FormEvent, useCallback, useEffect, useRef } from 'react';
import { animated } from '@react-spring/web';
import useInputAnimation from './useInputAnimation';
import './style.scss';
import BubbleIndicator from './BubbleIndicator/BubbleIndicator';
import { InputState } from '../Utils/TypesExport';

interface SearchQuery {
	firstHalf: string;
	secondHalf: string;
	incrementable: number;
}
interface Props {
	inputValue: [string, React.Dispatch<React.SetStateAction<string>>];
	inputState: [InputState, React.Dispatch<React.SetStateAction<InputState>>];
	setSearchQuery: React.Dispatch<React.SetStateAction<SearchQuery>>;
}

// TODO: Limit characters to ~25 when input is in FINISHED state
// FIXME: When there's blank space at the very first of input, number span will include the blank space causing position calculation to be off

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

	const tempInputValue = useRef<string | null>(null);
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
			// (e.target as HTMLDivElement).innerText = text.toString();
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
		const plainText = e.clipboardData.getData('text/plain').replaceAll(/\n+/g, ' ');
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

	function parseSearchQuery(currentSpan: HTMLSpanElement | null, spanList: HTMLSpanElement[]) {
		let firstHalf = '',
			secondHalf = '';
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
			const searchQuery = parseSearchQuery(selectedSpanRef.current, inputValueSpans.current);
			setSearchQuery(searchQuery);
			const STRING_LENGTH_LIMIT = 25;

			setInputValue((prev) => {
				let shortenedString: string;
				if (inputValue.length <= STRING_LENGTH_LIMIT) return prev;
				if (Number.isNaN(searchQuery.incrementable)) {
					shortenedString = `${searchQuery.firstHalf.slice(0, STRING_LENGTH_LIMIT)}...`;
				} else {
					shortenedString = `${searchQuery.firstHalf.slice(0, STRING_LENGTH_LIMIT / 2)}...${
						searchQuery.incrementable
					}${
						searchQuery.secondHalf !== ''
							? `...${searchQuery.secondHalf.slice(
									searchQuery.secondHalf.length - STRING_LENGTH_LIMIT / 2
							  )}`
							: ''
					}`;
				}
				(inputRef.current as HTMLDivElement).innerText = shortenedString;
				return shortenedString;
			});
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
			tempInputValue.current = inputValue;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputState, setInputValue, setSearchQuery]);

	//  Set container's height dynamically
	useEffect(() => {
		if (!containerRef.current) return;
		containerRef.current.style.height = inputRef.current?.offsetHeight + 'px';
	}, [inputValue]);

	// Keyboard shortcuts
	useEffect(() => {
		document.addEventListener('keypress', keypressHandler);

		function keypressHandler(e: KeyboardEvent) {
			switch (e.key) {
				case '/': {
					e.preventDefault();
					setInputState('TYPING');
					break;
				}
				case 'Enter': {
					if (inputState === 'SELECTING' && inputValue !== '') {
						setInputState('FINISHED');
					}
					break;
				}
				default:
					break;
			}
		}
		return () => {
			document.removeEventListener('keypress', keypressHandler);
		};
	}, [inputState, inputValue, setInputState]);

	return (
		<animated.div
			style={containerSpring}
			className={`rich-input-container ${inputState !== 'TYPING' ? 'not-typing' : ''} ${
				inputState === 'FINISHED' ? 'result-screen' : ''
			} `}
			ref={containerRef}>
			<div
				className={`text-container ${
					inputState === 'SELECTING' && inputValue.length > 0 ? 'selecting' : ''
				}`}
				onClick={() => {
					setInputState('TYPING');
				}}>
				<span
					ref={placeHolderRef}
					style={{
						color: inputValue === '' ? 'rgba(255,255,255,.5)' : 'transparent',
						userSelect: 'none',
						pointerEvents: 'none',
					}}
					id='input-placeholder'>
					{INPUT_PLACEHOLDER}
				</span>

				<div
					className='span-container'
					style={{ width: DEFAULT_WIDTH }}>
					{generateSpans(inputValueSpans, numberInputSpans, inputValue, inputState)}
				</div>

				<div
					className='rich-input'
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

function generateSpans(
	inputSpansRef: React.MutableRefObject<HTMLSpanElement[]>,
	numberSpansRef: React.MutableRefObject<HTMLSpanElement[]>,
	inputValue: string,
	inputState: InputState
) {
	inputSpansRef.current = [];
	numberSpansRef.current = [];

	if (inputValue === '') return null;
	// console.log(JSON.stringify(inputValue));
	const spans = inputValue.match(/\s+|\S+/g)?.map((word, index) => {
		const isNumber = word.match(/^\s*\d+\s*$/g)?.length === 1;
		return (
			<span
				ref={(el) => {
					if (!el) return;
					inputSpansRef.current.push(el as HTMLSpanElement);
					if (isNumber) numberSpansRef.current.push(el as HTMLSpanElement);
				}}
				data-isnumber={isNumber}
				className={`text-span ${inputState === 'SELECTING' ? 'selecting' : ''}`}
				key={`${word}-${index}`}>
				{`${word}`}
			</span>
		);
	});
	return spans;
}
