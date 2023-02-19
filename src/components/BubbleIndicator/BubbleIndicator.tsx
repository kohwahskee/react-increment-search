import { useEffect, useRef, useState } from 'react';
import { InputState } from '../Utils/TypesExport';
import useUpdateBubbleState from './useUpdateBubbleState';
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
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [bubbleState, dispatchBubbleState] = useUpdateBubbleState(
		mousePosition,
		inputState,
		bubbleIndicatorRef,
		numberInputSpans,
		singleCharacterWidth
	);
	// SVG related constants
	const EXTRA_HEIGHT = bubbleState.height + -35.45;
	const SVG_DEFAULT_HEIGHT = 35.45;
	const SVG_DEFAULT_WIDTH = 52.28;
	const newAspectRatio = (52.28 + bubbleState.length) / 35.45;
	const svgNewWidth = SVG_DEFAULT_WIDTH + bubbleState.length + EXTRA_HEIGHT * newAspectRatio;
	const svgNewHeight = SVG_DEFAULT_HEIGHT + EXTRA_HEIGHT;

	function onMouseDown() {
		document.addEventListener('mouseup', onMouseUp, { once: true });
		document.addEventListener('mousemove', onMouseMove);
	}

	function onMouseUp() {
		document.removeEventListener('mousemove', onMouseMove);
		dispatchBubbleState({ type: 'setIsDragging', payload: false });
		const bubbleRect = bubbleIndicatorRef.current?.getBoundingClientRect();
		const bubbleCenter = {
			x: (bubbleRect?.left ?? 0) + (bubbleRect?.width ?? 0) / 2,
			y: (bubbleRect?.top ?? 0) + (bubbleRect?.height ?? 0) / 2,
		};
		const spanToAttach = numberInputSpans.find((span) => {
			const spanRect = span.getBoundingClientRect();
			return (
				bubbleCenter.x > spanRect.left &&
				bubbleCenter.x < spanRect.right &&
				bubbleCenter.y > spanRect.top &&
				bubbleCenter.y < spanRect.bottom
			);
		});

		dispatchBubbleState({ type: 'setSpanToAttach', payload: spanToAttach ?? null });
	}

	useEffect(() => {
		dispatchBubbleState({
			type: 'setSpanToAttach',
			payload: numberInputSpans[numberInputSpans.length - 1],
		});
	}, [dispatchBubbleState, numberInputSpans]);
	function onMouseMove(e: MouseEvent) {
		draggingHandler(e);
	}

	function draggingHandler(e: MouseEvent) {
		setMousePosition({ x: e.clientX, y: e.clientY });
		dispatchBubbleState({ type: 'setIsDragging', payload: true });
	}

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
