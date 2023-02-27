import { useRef, useState, useEffect } from 'react';
import { InputState } from '../../Utils/TypesExport';
import { useSpring, animated, easings } from '@react-spring/web';
import useUpdateBubbleState from './useUpdateBubbleState';
import './style.scss';

interface Props {
	inputState: InputState;
	numberInputSpans: HTMLSpanElement[];
	singleCharacterWidth: number;
	setSelectedSpan: (span: HTMLSpanElement | null) => void;
}

export default function BubbleIndicator({
	numberInputSpans,
	inputState,
	singleCharacterWidth,
	setSelectedSpan,
}: Props) {
	const bubbleIndicatorRef = useRef<SVGSVGElement>(null);
	const hoveringSpan = useRef<HTMLSpanElement>();

	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	const [bubbleState, dispatchBubbleState] = useUpdateBubbleState(
		mousePosition,
		inputState,
		bubbleIndicatorRef,
		numberInputSpans,
		singleCharacterWidth
	);

	const bubbleAnimation = useSpring({
		to: { length: bubbleState.length, top: bubbleState.top, left: bubbleState.left },
		config: (key) => {
			if (key === 'length') {
				return {
					mass: 1,
					tension: 500,
					friction: 15,
				};
			}
			return { easing: easings.easeOutBack, duration: 200 };
		},
	});

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
		dispatchBubbleState({ type: 'setSpanToAttach', payload: hoveringSpan.current ?? null });

		numberInputSpans.forEach((span) => {
			span.classList.remove('hovering');
		});
	}

	function onMouseMove(e: MouseEvent) {
		draggingHandler(e);
	}

	function draggingHandler(e: MouseEvent) {
		const bubbleRect = bubbleIndicatorRef.current?.getBoundingClientRect();
		const bubbleCenter = {
			x: (bubbleRect?.left ?? 0) + (bubbleRect?.width ?? 0) / 2,
			y: (bubbleRect?.top ?? 0) + (bubbleRect?.height ?? 0) / 2,
		};
		numberInputSpans.forEach((span) => {
			const spanRect = span.getBoundingClientRect();
			const BOUND_THRESHOLD = 0;
			if (
				bubbleCenter.x > spanRect.left - BOUND_THRESHOLD &&
				bubbleCenter.x < spanRect.right + BOUND_THRESHOLD &&
				bubbleCenter.y > spanRect.top - BOUND_THRESHOLD &&
				bubbleCenter.y < spanRect.bottom + BOUND_THRESHOLD
			) {
				span.classList.add('hovering');
				hoveringSpan.current = span;
			} else {
				span.classList.remove('hovering');
			}
		});

		setMousePosition({ x: e.clientX, y: e.clientY });
		dispatchBubbleState({ type: 'setIsDragging', payload: true });
	}

	useEffect(() => {
		setSelectedSpan(bubbleState.spanToAttach ?? numberInputSpans.at(-1) ?? null);
	}, [bubbleState.spanToAttach, numberInputSpans, setSelectedSpan]);

	return (
		<animated.svg
			onMouseDown={onMouseDown}
			style={{
				top: bubbleAnimation.top.to((value) => `${value}%`),
				left: bubbleAnimation.left.to((value) => `${value}%`),
				opacity: bubbleState.visible ? 1 : 0,
			}}
			ref={bubbleIndicatorRef}
			xmlns='http://www.w3.org/2000/svg'
			width={`${svgNewWidth} `}
			height={`${svgNewHeight}`}
			// viewbox default = 0 0 52.28 35.45
			viewBox={bubbleAnimation.length.to(
				(value) =>
					`${0} 0 ${SVG_DEFAULT_WIDTH + (value <= -17 ? -17 : value)} ${SVG_DEFAULT_HEIGHT}`
			)}>
			<animated.path
				d={bubbleAnimation.length.to(
					(value) =>
						`m${
							51.92 + (value <= -17 ? -17 : value)
						},26.08c-1.02,2.76-3.47,4.81-6.75,6.38-2.64,1.27-7.07,2.8-8.12,2.91-1.06.11-2.16.08-2.19.08h-${
							17.44 + (value <= -17 ? -17 : value)
						}s-1.14.03-2.19-.08-5.48-1.64-8.12-2.91c-3.28-1.57-5.73-3.62-6.75-6.38-1.02-2.76.35-6.29,1.37-10.09,1.04-3.82.83-7.92,3.41-10.94C7.65,2.08,12.17.24,16.24.03c0,0,.77-.03,1.18-.03h${
							17.44 + (value <= -17 ? -17 : value)
						}c.41,0,1.18.03,1.18.03,4.07.21,8.59,2.05,11.09,5.02,2.59,3.02,2.37,7.12,3.42,10.94,1.02,3.8,2.39,7.33,1.37,10.09Z`
				)}
			/>
		</animated.svg>
	);
}
