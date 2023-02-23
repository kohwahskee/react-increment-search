import { FormEvent, useEffect, useRef } from 'react';
import './style.scss';
// import { useTransition } from '@react-spring/web';
// import IndicatorBubbble from '../../assets/IndicatorBubble.svg';
import { v4 as uuidv4 } from 'uuid';
import BubbleIndicator from './BubbleIndicator/BubbleIndicator';
import { InputState } from '../Utils/TypesExport';

// TODO:
// 1. Add animation for the bubble indicator

// FIXME:
// 1. Bubble isn't in the center when at the end of line
// 2. Bubble off center when there're multiple lines (likely due to container change in height)

// NOTE:
// 1. It's possible that spans are not updated when inputState changes is due to the fact
// that it's generated and stored in the state

interface Props {
	inputValue: [string, React.Dispatch<React.SetStateAction<string>>];
	inputState: [InputState, React.Dispatch<React.SetStateAction<InputState>>];
}

export default function RichInput({
	inputValue: [inputValue, setInputValue],
	inputState: [inputState, setInputState],
}: Props) {
	const INPUT_PLACEHOLDER = 'Search...';
	const inputRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const placeHolderRef = useRef<HTMLDivElement>(null);
	const numberInputSpans = useRef<HTMLSpanElement[]>([]);
	const inputValueSpans = useRef<HTMLSpanElement[]>([]);

	// To make sure input caret is in the center
	const DEFAULT_WIDTH = inputValue === '' ? '1rem' : '90%';
	const onInputHandler = (e: FormEvent) => {
		const text = (e.target as HTMLDivElement).innerText;

		if (text === '\n') {
			// contentEditable will add <br> when empty
			setInputValue('');
			return;
		}
		setInputValue(text);
	};

	const inputEnterHandler = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (inputState === 'TYPING') {
				setInputState('SELECTING');
			} else if (inputState === 'SELECTING') {
				setInputState('FINISHED');
			}
		}
	};

	function inputTypingHandler() {
		inputRef.current?.focus();
		const range = document.createRange();
		const selection = window.getSelection();
		range.selectNodeContents(inputRef.current as HTMLDivElement);
		range.collapse(false);
		selection?.removeAllRanges();
		selection?.addRange(range);
	}

	function inputSelectingHandler() {
		inputRef.current?.blur();
		inputValueSpans.current.forEach((span) => {
			span.classList.add('SELECTING');
		});
	}
	function inputFinishedHandler() {}

	useEffect(() => {
		if (inputState === 'TYPING') {
			inputTypingHandler();
		} else if (inputState === 'SELECTING') {
			inputSelectingHandler();
		} else if (inputState === 'FINISHED') {
			inputFinishedHandler();
		}
	}, [inputState]);

	useEffect(() => {
		// setNumberInputSpans(Array.from(document.querySelectorAll('[data-isnumber="true"]')));
		if (!containerRef.current) return;
		containerRef.current.style.height = `${inputRef.current?.offsetHeight}px`;
	}, [inputValueSpans.current]);

	useEffect(() => {
		const keypressHandler = (e: KeyboardEvent) => {
			if (e.key === '/') {
				e.preventDefault();
				setInputState('TYPING');
			}
		};
		document.addEventListener('keypress', keypressHandler);

		return () => {
			document.removeEventListener('keypress', keypressHandler);
		};
	}, []);

	function generateSpans() {
		inputValueSpans.current = [];
		numberInputSpans.current = [];

		if (inputValue === '') return null;

		const spans = inputValue.split(' ').map((word, index) => {
			const isNumber = word.match(/^\s*\d+\s*$/g)?.length === 1;
			return (
				<span
					ref={(el) => {
						if (!el) return;
						inputValueSpans.current.push(el as HTMLSpanElement);
						if (isNumber) numberInputSpans.current.push(el as HTMLSpanElement);
					}}
					data-isnumber={isNumber}
					className={`text-span ${inputState === 'SELECTING' ? 'selecting' : ''}`}
					key={`word-${index}`}>
					{`${word} `}
				</span>
			);
		});

		return spans;
	}
	return (
		<div
			className={`rich-input-container ${inputState !== 'TYPING' ? 'not-typing' : ''}`}
			ref={containerRef}>
			<div
				className={`text-container ${inputState === 'SELECTING' ? 'selecting' : ''}`}
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
					{generateSpans()}
				</div>

				<div
					className='rich-input'
					style={{ width: DEFAULT_WIDTH }}
					ref={inputRef}
					onInput={onInputHandler}
					onKeyDown={inputEnterHandler}
					onBlur={() => setInputState('SELECTING')}
					onFocus={() => setInputState('TYPING')}
					contentEditable
					suppressContentEditableWarning
				/>
			</div>
			<BubbleIndicator
				singleCharacterWidth={
					(placeHolderRef.current?.getBoundingClientRect().width || 0) /
					(placeHolderRef.current?.innerText.length || 0)
				}
				inputState={inputState}
				numberInputSpans={numberInputSpans.current}
			/>
		</div>
	);
}
