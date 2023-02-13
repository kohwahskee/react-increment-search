import { useEffect, useRef, useState } from 'react';

import './style.scss';

interface Props {
	inputState: string | null;
	numberInputSpans: HTMLSpanElement[];
}

export default function BubbleIndicator({ numberInputSpans, inputState }: Props) {
	const bubbleIndicatorRef = useRef<SVGSVGElement>(null);
	const [bubbleIndicator, setBubbleIndicator] = useState({
		top: 0,
		left: 0,
		length: -17,
		height: 77,
		visible: false,
	});

	// Controller
	const [bubbleHeight, setBubbleHeight] = useState(77);
	const [bubbleLength, setBubbleLength] = useState(-17); // -17 is the lowest possible length

	const EXTRA_HEIGHT = bubbleHeight + -35.45;
	const SVG_DEFAULT_ASPECT_RATIO = 52.28 / 35.45;
	const SVG_DEFAULT_HEIGHT = 35.45;
	const SVG_DEFAULT_WIDTH = SVG_DEFAULT_HEIGHT * SVG_DEFAULT_ASPECT_RATIO;
	const newAspectRatio = (52.28 + bubbleLength) / 35.45;
	const svgNewWidth = SVG_DEFAULT_WIDTH + bubbleLength + EXTRA_HEIGHT * newAspectRatio;
	const svgNewHeight = SVG_DEFAULT_HEIGHT + EXTRA_HEIGHT;

	useEffect(() => {
		console.log(inputState);
		if (inputState === 'selecting') updateBubbleIndicator();
		else setBubbleIndicator((prev) => ({ ...prev, visible: false }));
	}, [inputState]);

	function updateBubbleIndicator() {
		// Reset bubble indicator
		if (numberInputSpans.length === 0) return;
		const lastNumberSpan = numberInputSpans[numberInputSpans.length - 1];

		const spanRect = lastNumberSpan.getBoundingClientRect();
		const parentRect = bubbleIndicatorRef.current?.parentElement?.getBoundingClientRect();

		const spanList = lastNumberSpan.innerText?.split('') || [];
		const spanWithNumbers = spanList.filter((char) => !isNaN(parseInt(char)));
		const realWidth = (spanRect.width / spanList?.length) * spanWithNumbers.length; // To get the width of the numbers only
		const bubbleWidth = bubbleIndicatorRef.current?.getBoundingClientRect().width || 0;
		// debugger;
		if (!parentRect) return;
		const top = ((spanRect.y - parentRect?.y + spanRect?.height / 2) / parentRect.height) * 100;
		const left =
			((spanRect.x - parentRect?.x + realWidth / 2 - bubbleWidth / 2) / parentRect.width) * 100;
		setBubbleIndicator({
			top,
			left,
			length: -17,
			height: spanRect.height,
			visible: true,
		});
	}
	// Order of execution: updateBubbleHeight + updateBubbleLength -> updateBubblePosition
	useEffect(() => {
		setBubbleHeight(bubbleIndicator.height);
	}, [bubbleIndicator.height]);
	return (
		// <div
		// 	ref={bubbleIndicatorRef}
		// 	style={{
		// 		top: `${bubbleIndicator.top}%`,
		// 		left: `${bubbleIndicator.left}%`,
		// 		opacity: bubbleIndicator.visible ? 1 : 0,
		// 	}}
		// 	className='indicator-container'>
		// </div>
		<svg
			style={{
				top: `${bubbleIndicator.top}%`,
				left: `${bubbleIndicator.left}%`,
				opacity: bubbleIndicator.visible ? 1 : 0,
			}}
			ref={bubbleIndicatorRef}
			xmlns='http://www.w3.org/2000/svg'
			width={`${svgNewWidth} `}
			height={`${svgNewHeight}`}
			// viewbox default = 0 0 52.28 35.45
			viewBox={`${0} 0 ${SVG_DEFAULT_WIDTH + bubbleLength} ${SVG_DEFAULT_HEIGHT}`}>
			<path
				d={`m${
					51.92 + bubbleLength
				},26.08c-1.02,2.76-3.47,4.81-6.75,6.38-2.64,1.27-7.07,2.8-8.12,2.91-1.06.11-2.16.08-2.19.08h-${
					17.44 + bubbleLength
				}s-1.14.03-2.19-.08-5.48-1.64-8.12-2.91c-3.28-1.57-5.73-3.62-6.75-6.38-1.02-2.76.35-6.29,1.37-10.09,1.04-3.82.83-7.92,3.41-10.94C7.65,2.08,12.17.24,16.24.03c0,0,.77-.03,1.18-.03h${
					17.44 + bubbleLength
				}c.41,0,1.18.03,1.18.03,4.07.21,8.59,2.05,11.09,5.02,2.59,3.02,2.37,7.12,3.42,10.94,1.02,3.8,2.39,7.33,1.37,10.09Z`}
			/>
		</svg>
	);
}
