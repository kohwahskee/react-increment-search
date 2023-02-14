import { FormEvent, useEffect, useRef, useState } from 'react';
import './style.scss';
// import { useTransition } from '@react-spring/web';
// import IndicatorBubbble from '../../assets/IndicatorBubble.svg';

// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';
import BubbleIndicator from '../BubbleIndicator/BubbleIndicator';

// TODO:
// 1. Add animation for the bubble indicator
// 2. Scale container based on bubble width or input height, whichever is bigger

// FIXME:
// 1. Bubble isn't in the center when at the end of line

// NOTE:
// 1. It's possible that spans are not updated when inputState changes is due to the fact
// that it's generated and stored in the state

export default function RichInput() {
	type InputState = null | 'typing' | 'selecting' | 'finished';

	const INPUT_PLACEHOLDER = 'Search...';
	const inputRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const numberInputSpans = useRef<HTMLSpanElement[]>([]);
	const inputValueSpans = useRef<HTMLSpanElement[]>([]);
	const [inputState, setInputState] = useState<InputState>(null);
	const [inputValue, setInputValue] = useState('');
	// const [numberInputSpans, setNumberInputSpans] = useState<HTMLSpanElement[]>([]);

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
				onClick={() => {
					setInputState('typing');
				}}
				className='text-container'>
				<span
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
				inputState={inputState}
				numberInputSpans={numberInputSpans.current}
			/>
		</div>
	);
}
