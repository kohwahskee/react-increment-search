import { useEffect, useRef, useReducer, useLayoutEffect, useState } from 'react';
import { InputState, BubbleState } from '../Utils/TypesExport';
import bubbleReducer from './bubbleReducer';
import './style.scss';

interface Props {
	inputState: InputState;
	numberInputSpans: HTMLSpanElement[];
	singleCharacterWidth: number;
}

export default function BubbleIndicator({
	numberInputSpans,
	inputState,
	singleCharacterWidth,
}: Props) {
	const bubbleIndicatorRef = useRef<SVGSVGElement>(null);
	const [bubbleState, dispatchBubbleState] = useReducer(bubbleReducer, {
		top: 0,
		left: 0,
		length: -17,
		height: 77,
		visible: false,
		isDragging: false,
	});

	const EXTRA_HEIGHT = bubbleState.height + -35.45;
	const SVG_DEFAULT_HEIGHT = 35.45;
	const SVG_DEFAULT_WIDTH = 52.28;
	const newAspectRatio = (52.28 + bubbleState.length) / 35.45;
	const svgNewWidth = SVG_DEFAULT_WIDTH + bubbleState.length + EXTRA_HEIGHT * newAspectRatio;
	const svgNewHeight = SVG_DEFAULT_HEIGHT + EXTRA_HEIGHT;

	useEffect(() => {
		if (inputState === 'SELECTING') {
			dispatchBubbleState({
				type: 'setMultiple',
				payload: { ...getBubbleState(), visible: numberInputSpans.length > 0 ? true : false },
			});
		} else {
			dispatchBubbleState({ type: 'setBubbleVisiblity', payload: false });
		}
	}, [inputState]);

	useLayoutEffect(() => {
		if (!bubbleState.isDragging) {
			dispatchBubbleState({ type: 'setMultiple', payload: getBubbleState() });
		}
	}, [bubbleState.height, bubbleState.length]);

	// useEffect(() => {
	// 	console.log('bubbleState', bubbleState);
	// }, [bubbleState]);

	function getBubbleState(): Partial<BubbleState> {
		if (numberInputSpans.length === 0) return bubbleState;
		const lastNumberSpan = numberInputSpans[numberInputSpans.length - 1];
		const spanRect = lastNumberSpan.getBoundingClientRect();
		const parentRect = bubbleIndicatorRef.current?.parentElement?.getBoundingClientRect();
		const spanList = lastNumberSpan.innerText?.split('') || [];
		const spanWithNumbers = spanList.filter((char) => !isNaN(parseInt(char)));
		const bubbleWidth = bubbleIndicatorRef.current?.getBoundingClientRect().width || 0;

		// Word-wrap: break-word; makes the span smaller than the actual width of the text, including " " when a word is at the end of the line when line break happens.
		// To avoid this, grab with of a single character (width of placeholder / innerText.length) and multiply it by the number of characters
		const realWidth = singleCharacterWidth * spanWithNumbers.length;

		if (!parentRect) return bubbleState;
		const top = ((spanRect.y - parentRect?.y + spanRect?.height / 2) / parentRect.height) * 100;
		const left =
			((spanRect.x - parentRect?.x + realWidth / 2 - bubbleWidth / 2) / parentRect.width) * 100;

		// debugger;
		return {
			top,
			left,
			height: spanRect.height,
			length: -17 + 20 * (spanWithNumbers.length - 1),
		};
	}

	const onMouseDown = () => {
		document.addEventListener('mouseup', onMouseUp, { once: true });
		dispatchBubbleState({ type: 'setIsDragging', payload: true });
		// console.log('clicked');
		document.addEventListener('mousemove', onMouseMove);
	};

	const onMouseUp = () => {
		document.removeEventListener('mousemove', onMouseMove);
		dispatchBubbleState({ type: 'setIsDragging', payload: false });
	};

	const onMouseMove = (e: MouseEvent) => {
		draggingHandler(e);
	};

	function draggingHandler(e: MouseEvent) {
		const bubbleIndicator = bubbleIndicatorRef.current;
		if (!bubbleIndicator) return;
		const parentRect = bubbleIndicator.parentElement?.getBoundingClientRect();
		if (!parentRect) return;
		const bubbleRect = bubbleIndicator.getBoundingClientRect();
		const newPos = {
			x: ((e.clientX - parentRect.x - bubbleRect.width / 2) / parentRect.width) * 100,
			y: ((e.clientY - parentRect.y) / parentRect.height) * 100,
		};
		// console.log(`x: ${e.clientX}, y: ${e.clientY}`);

		dispatchBubbleState({
			type: 'setMultiple',
			payload: { top: newPos.y, left: newPos.x, length: -17, isDragging: true },
		});
		// dispatchBubbleState({ type: 'setIsDragging', payload: true });
	}
	// debugger;
	useEffect(() => {}, []);

	return (
		<svg
			onMouseDown={onMouseDown}
			onClick={() => console.log('clicked')}
			style={{
				top: `${bubbleState.top}%`,
				left: `${bubbleState.left}%`,
				opacity: bubbleState.visible ? 1 : 0,
			}}
			ref={bubbleIndicatorRef}
			xmlns='http://www.w3.org/2000/svg'
			width={`${svgNewWidth} `}
			height={`${svgNewHeight}`}
			// viewbox default = 0 0 52.28 35.45
			viewBox={`${0} 0 ${SVG_DEFAULT_WIDTH + bubbleState.length} ${SVG_DEFAULT_HEIGHT}`}>
			<path
				d={`m${
					51.92 + bubbleState.length
				},26.08c-1.02,2.76-3.47,4.81-6.75,6.38-2.64,1.27-7.07,2.8-8.12,2.91-1.06.11-2.16.08-2.19.08h-${
					17.44 + bubbleState.length
				}s-1.14.03-2.19-.08-5.48-1.64-8.12-2.91c-3.28-1.57-5.73-3.62-6.75-6.38-1.02-2.76.35-6.29,1.37-10.09,1.04-3.82.83-7.92,3.41-10.94C7.65,2.08,12.17.24,16.24.03c0,0,.77-.03,1.18-.03h${
					17.44 + bubbleState.length
				}c.41,0,1.18.03,1.18.03,4.07.21,8.59,2.05,11.09,5.02,2.59,3.02,2.37,7.12,3.42,10.94,1.02,3.8,2.39,7.33,1.37,10.09Z`}
			/>
		</svg>
	);
}
