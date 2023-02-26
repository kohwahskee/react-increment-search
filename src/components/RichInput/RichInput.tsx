import { FormEvent, useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useSpring, animated, easings } from '@react-spring/web';
import './style.scss';
import BubbleIndicator from './BubbleIndicator/BubbleIndicator';
import { InputState } from '../Utils/TypesExport';

interface SearchQuery {
	firstHalf: string;
	secondHalf: string;
	incrementable: number | null;
}
interface Props {
	inputValue: [string, React.Dispatch<React.SetStateAction<string>>];
	inputState: [InputState, React.Dispatch<React.SetStateAction<InputState>>];
	setSearchQuery: React.Dispatch<React.SetStateAction<SearchQuery>>;
}

//TODO:
// 1. Sanatise input

export default function RichInput({
	inputValue: [inputValue, setInputValue],
	inputState: [inputState, setInputState],
	setSearchQuery,
}: Props) {
	const INPUT_PLACEHOLDER = 'Search...';

	const [containerSpring, containerSpringAPI] = useSpring(() => ({
		from: { transform: '' },
	}));

	const [selectedSpan, setSelectedSpan] = useState<HTMLSpanElement | null>(null);

	const initialContainerBBox = useRef<DOMRect>();
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
			e.stopPropagation();
			e.preventDefault();
			if (inputState === 'TYPING') {
				setInputState('SELECTING');
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
	}

	const parseSearchQuery = useCallback(() => {
		let firstHalf = '',
			secondHalf = '';
		const incrementable = parseInt(selectedSpan?.innerText || '', 10);
		let flip = false;
		inputValueSpans.current.forEach((span) => {
			if (span === selectedSpan) {
				flip = true;
				return;
			}
			if (!flip) {
				firstHalf += span.innerText;
			} else {
				secondHalf += span.innerText;
			}
		});
		setSearchQuery({
			firstHalf,
			secondHalf,
			incrementable,
		});
	}, [selectedSpan, setSearchQuery]);

	const inputFinishedHandler = useCallback(() => {
		parseSearchQuery();
	}, [parseSearchQuery]);

	useEffect(() => {
		if (inputState === 'TYPING') {
			inputTypingHandler();
		} else if (inputState === 'SELECTING') {
			inputSelectingHandler();
		} else if (inputState === 'FINISHED') {
			inputFinishedHandler();
		}
	}, [inputFinishedHandler, inputState, setSearchQuery]);

	useEffect(() => {
		if (!containerRef.current) return;
		containerRef.current.style.height = inputRef.current?.offsetHeight + 'px';
	}, [inputValue]);

	useEffect(() => {
		const keypressHandler = (e: KeyboardEvent) => {
			if (e.key === '/') {
				e.preventDefault();
				setInputState('TYPING');
			}
			if (e.key === 'Enter') {
				if (inputState === 'SELECTING' && inputValue !== '') {
					initialContainerBBox.current = containerRef.current?.getBoundingClientRect();
					setInputState('FINISHED');
				}
			}
		};
		document.addEventListener('keypress', keypressHandler);

		return () => {
			document.removeEventListener('keypress', keypressHandler);
		};
	}, [inputState, setInputState]);

	useLayoutEffect(() => {
		const firstRect = initialContainerBBox.current;
		const lastRect = containerRef.current?.getBoundingClientRect() ?? null;
		if (!firstRect || !lastRect) return;

		const oldMiddlePointX = firstRect.x + firstRect.width / 2;
		const newMiddlePointX = lastRect.x + lastRect.width / 2;
		const xToMiddleRatio = (oldMiddlePointX - firstRect.x) / firstRect.width;
		const newX = newMiddlePointX * xToMiddleRatio;

		const oldMiddlePointY = firstRect.y + firstRect.height / 2;
		const newMiddlePointY = lastRect.y + lastRect.height / 2;
		const yToMiddleRatio = (oldMiddlePointY - firstRect.y) / firstRect.height;
		const newY = newMiddlePointY * yToMiddleRatio;
		let x, y;
		if (inputState === 'FINISHED') {
			x = firstRect.x - newX;
			({ y } = firstRect);
		} else {
			({ x } = lastRect);
			x = x * -1;
			y = newMiddlePointY * -1;
		}
		if (!containerRef.current) return;

		// FIXME:
		// 1. Redo calculation for x and y. Maybe straight up use the middle point of the container
		// 2. Transformation is conflicted. First transform needs to be (-50,-50) but transform to property need to always be (0,0)
		console.log('old');
		console.log(firstRect);
		console.log('new');
		console.log(lastRect);
		initialContainerBBox.current = lastRect ?? undefined;
		const DEFAULT_TRANSFORM = {
			typing: 'translate(0px, 0px) scale(.4)',
			finished: 'translate(-50%, -50%) scale(1)',
		};
		containerSpringAPI.set({
			transform: `translate(${x}px, ${y}px) scale(${inputState === 'FINISHED' ? 1 : 0.4})`,
		});
		console.log(containerRef.current.style.transform);

		containerSpringAPI.start({
			from: {
				transform: `translate(${x}px, ${y}px) scale(${inputState === 'FINISHED' ? 1 : 0.4})`,
			},
			to: { transform: `translate(0,0) scale(${inputState === 'FINISHED' ? 0.4 : 1})` },
			config: { mass: 1, tension: 400, friction: 20 },
			onRest: (_result, ctrl) => {
				ctrl.set({ transform: '' });
			},
		});
	}, [inputState]);

	function generateSpans() {
		inputValueSpans.current = [];
		numberInputSpans.current = [];

		if (inputValue === '') return null;

		const spans = inputValue.split(/\s/).map((word, index) => {
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
				setSelectedSpan={setSelectedSpan}
				singleCharacterWidth={
					(placeHolderRef.current?.getBoundingClientRect().width || 0) /
					(placeHolderRef.current?.innerText.length || 0)
				}
				inputState={inputState}
				numberInputSpans={numberInputSpans.current}
			/>
		</animated.div>
	);
}
