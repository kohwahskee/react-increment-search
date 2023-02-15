import { FormEvent, useEffect, useRef, useState } from 'react';
import './style.scss';
// import { useTransition } from '@react-spring/web';
// import IndicatorBubbble from '../../assets/IndicatorBubble.svg';
import { v4 as uuidv4 } from 'uuid';
import BubbleIndicator from '../BubbleIndicator/BubbleIndicator';

// TODO:
// 1. Add animation for the bubble indicator

// FIXME:
// 1. Bubble isn't in the center when at the end of line
// 2. Bubble off center when there're multiple lines (likely due to container change in height)

// NOTE:
// 1. It's possible that spans are not updated when inputState changes is due to the fact
// that it's generated and stored in the state

type InputState = null | 'typing' | 'selecting' | 'finished';
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
	// const [inputState, setInputState] = useState<InputState>(null);
	// const [inputValue, setInputValue] = inputValue;

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
			if (inputState === 'typing') {
				setInputState('selecting');
			} else if (inputState === 'selecting') {
				setInputState('finished');
			}
		}
	};

	function inputTypingHandler() {
		inputRef.current?.focus();
	}

	function inputSelectingHandler() {
		inputRef.current?.blur();
		inputValueSpans.current.forEach((span) => {
			span.classList.add('selecting');
		});
	}
	function inputFinishedHandler() {}

	useEffect(() => {
		if (inputState === 'typing') {
			inputTypingHandler();
		} else if (inputState === 'selecting') {
			inputSelectingHandler();
		} else if (inputState === 'finished') {
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
				setInputState('typing');
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

		const spans = inputValue.split(' ').map((word) => {
			const isNumber = word.match(/^\d+\s*$/g)?.length === 1;
			return (
				<span
					ref={(el) => {
						if (!el) return;
						inputValueSpans.current.push(el as HTMLSpanElement);
						if (isNumber) numberInputSpans.current.push(el as HTMLSpanElement);
					}}
					data-isnumber={isNumber}
					className={`text-span ${inputState === 'selecting' ? 'selecting' : ''}`}
					key={uuidv4()}>
					{`${word} `}
				</span>
			);
		});

		return spans;
	}
	return (
		<div
			className={`rich-input-container ${inputState !== 'typing' ? 'not-typing' : ''}`}
			ref={containerRef}>
			<div
				className={`text-container ${inputState === 'selecting' ? 'selecting' : ''}`}
				onClick={() => {
					setInputState('typing');
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
					onBlur={() => setInputState('selecting')}
					onFocus={() => setInputState('typing')}
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
