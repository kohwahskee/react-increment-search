import { FormEvent, useEffect, useRef, useState } from 'react';
import './style-richInput.scss';
import { useTransition } from '@react-spring/web';
import IndicatorBubbble from '../assets/IndicatorBubble.svg';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';
import { findDOMNode } from 'react-dom';

export default function RichInput() {
	const INPUT_PLACEHOLDER = 'Search...';
	const [input, setInput] = useState<JSX.Element[]>([]);
	const bubbleIndicatorRef = useRef<HTMLImageElement>(null);
	const [numberInputSpans, setNumberInputSpans] = useState<Element[]>([]);
	const [bubbleIndicator, setBubbleIndicator] = useState({
		top: 0,
		left: 0,
		width: 0,
		visible: false,
	});
	const inputRef = useRef<HTMLDivElement>(null);
	const DEFAULT_WIDTH = input.length === 0 ? '1rem' : '90%'; // To make sure input caret is in the center

	// const indicatorBubbleTransition = useTransition(numberInputSpans.length > 0, {
	// 	from: {},
	// 	enter: {},
	// 	leave: {},
	// });

	const onInputHandler = (e: FormEvent) => {
		const text = (e.target as HTMLDivElement).innerText;

		if (text === '\n') {
			// contentEditable will add <br> when empty
			setInput([]);
			return;
		}

		const wordsSpan = text.split(' ').map((word) => {
			const isNumber = !isNaN(parseInt(word));
			return (
				<span
					data-isnumber={isNumber}
					className='text-span'
					key={uuidv4()}>
					{`${word} `}
				</span>
			);
		});
		setInput(wordsSpan);
	};

	const inputEnterHandler = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
		}
	};

	useEffect(() => {
		setNumberInputSpans(Array.from(document.querySelectorAll('[data-isnumber="true"]')));
	}, [input]);

	useEffect(() => {
		if (numberInputSpans.length === 0) {
			setBubbleIndicator({
				top: 0,
				left: 0,
				width: 0,
				visible: false,
			});
			return;
		}

		const lastSpan = numberInputSpans[numberInputSpans.length - 1];
		const spanRect = lastSpan.getBoundingClientRect();
		const parentRect = bubbleIndicatorRef.current?.parentElement?.getBoundingClientRect();

		if (!parentRect) return;

		const { width } = spanRect;
		const top = spanRect.y - parentRect?.y + spanRect.height / 2;
		const left = spanRect.x - parentRect?.x + spanRect.width / 2;
		// const width = spanRect.width;

		setBubbleIndicator({
			top,
			left,
			width: 0,
			visible: true,
		});
	}, [numberInputSpans]);

	return (
		<div className='rich-input-container'>
			<div
				onClick={() => {
					inputRef.current?.focus();
				}}
				className='text-container'>
				<img
					ref={bubbleIndicatorRef}
					style={{
						opacity: bubbleIndicator.visible ? 1 : 0,
						top: bubbleIndicator.top,
						left: bubbleIndicator.left + bubbleIndicator.width,
					}}
					src={IndicatorBubbble}
					alt='Indicator Bubble'
					id='indicator-bubble'
				/>
				<span
					style={{
						color: input?.length === 0 ? 'rgba(255,255,255,.5)' : 'transparent',
						userSelect: 'none',
						pointerEvents: 'none',
					}}
					id='input-placeholder'>
					{INPUT_PLACEHOLDER}
				</span>

				<div
					style={{ width: DEFAULT_WIDTH }}
					className='span-container'>
					{input}
				</div>

				<div
					style={{ width: DEFAULT_WIDTH }}
					ref={inputRef}
					onInput={onInputHandler}
					onKeyDown={inputEnterHandler}
					className='rich-input'
					contentEditable
					suppressContentEditableWarning
				/>
			</div>
		</div>
	);
}
