import { FormEvent, useEffect, useRef, useState } from 'react';
import './style.scss';
import { useTransition } from '@react-spring/web';
import IndicatorBubbble from '../../assets/IndicatorBubble.svg';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';

export default function RichInput() {
	const INPUT_PLACEHOLDER = 'Search...';
	const [input, setInput] = useState<JSX.Element[]>([]);
	const bubbleIndicatorRef = useRef<HTMLImageElement>(null);
	const [numberInputSpans, setNumberInputSpans] = useState<HTMLSpanElement[]>([]);
	const [bubbleIndicator, setBubbleIndicator] = useState({
		top: 0,
		left: 0,
		width: 1,
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
		// Reset bubble indicator
		if (numberInputSpans.length === 0) {
			setBubbleIndicator((prev) => ({
				...prev,
				top: 0,
				left: 0,
				visible: false,
			}));
			return;
		}

		// FIXME: Width is currently being updated at the same time as the position
		// causing the bubble to  be off center. Need to update the position after the width is updated
		// TODO: Make width the same as span's width then convert to vw to make it responsive
		const lastSpan = numberInputSpans[numberInputSpans.length - 1];
		const spanRect = lastSpan.getBoundingClientRect();
		const parentRect = bubbleIndicatorRef.current?.parentElement?.getBoundingClientRect();
		const bubbleRect = bubbleIndicatorRef.current?.getBoundingClientRect();
		if (!parentRect) return;

		const splitSpan = lastSpan.innerText?.split('') || [];
		const onlyNumbers = splitSpan.filter((char) => !isNaN(parseInt(char)));
		const realWidth = (spanRect.width / splitSpan?.length) * onlyNumbers.length;
		const bubbleWidth = bubbleRect?.width || 0;

		const top = ((spanRect.y - parentRect?.y + spanRect?.height / 2) / parentRect.height) * 100;
		const left =
			((spanRect.x - parentRect?.x + realWidth / 2 - bubbleWidth / 2) / parentRect.width) * 100;

		setBubbleIndicator({
			top,
			left,
			width: onlyNumbers.length,
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
			<img
				ref={bubbleIndicatorRef}
				style={{
					opacity: bubbleIndicator.visible ? 1 : 0,
					top: bubbleIndicator.top + '%',
					left: bubbleIndicator.left + '%',
					width: bubbleIndicator.width * 3.5 + 'vw',
				}}
				src={IndicatorBubbble}
				alt='Indicator Bubble'
				id='indicator-bubble'
			/>
		</div>
	);
}
