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
// 1. When there're multiple lines, the bubble indicator is not in the center

export default function RichInput() {
	type InputState = null | 'typing' | 'selecting' | 'finished';

	const INPUT_PLACEHOLDER = 'Search...';
	const inputRef = useRef<HTMLDivElement>(null);
	const [inputState, setInputState] = useState<InputState>(null);
	const [inputValue, setInputValue] = useState<JSX.Element[]>([]);
	const [numberInputSpans, setNumberInputSpans] = useState<HTMLSpanElement[]>([]);

	// To make sure input caret is in the center
	const DEFAULT_WIDTH = inputValue.length === 0 ? '1rem' : '90%';
	const onInputHandler = (e: FormEvent) => {
		const text = (e.target as HTMLDivElement).innerText;

		if (text === '\n') {
			// contentEditable will add <br> when empty
			setInputValue([]);
			return;
		}

		const wordsSpan = text.split(' ').map((word) => {
			const isNumber = word.match(/^\d+\s*$/g)?.length === 1;
			return (
				<span
					data-isnumber={isNumber}
					className='text-span'
					key={uuidv4()}>
					{`${word} `}
				</span>
			);
		});
		setInputValue(wordsSpan);
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
		// updateBubbleIndicator();
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
		setNumberInputSpans(Array.from(document.querySelectorAll('[data-isnumber="true"]')));
	}, [inputValue]);

	return (
		<div className={`rich-input-container ${inputState !== 'typing' ? 'not-typing' : ''}`}>
			<div
				onClick={() => {
					setInputState('typing');
				}}
				className='text-container'>
				<span
					style={{
						color: inputValue?.length === 0 ? 'rgba(255,255,255,.5)' : 'transparent',
						userSelect: 'none',
						pointerEvents: 'none',
					}}
					id='input-placeholder'>
					{INPUT_PLACEHOLDER}
				</span>

				<div
					style={{ width: DEFAULT_WIDTH }}
					className='span-container'>
					{inputValue}
				</div>

				<div
					style={{ width: DEFAULT_WIDTH }}
					ref={inputRef}
					onInput={onInputHandler}
					onKeyDown={inputEnterHandler}
					onBlur={() => setInputState('selecting')}
					onFocus={() => setInputState('typing')}
					className='rich-input'
					contentEditable
					suppressContentEditableWarning
				/>
			</div>
			<BubbleIndicator
				inputState={inputState}
				numberInputSpans={numberInputSpans}
			/>
		</div>
	);
}
