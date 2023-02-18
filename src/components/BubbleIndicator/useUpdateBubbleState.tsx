import { InputState, BubbleState } from '../Utils/TypesExport';
import { useReducer, useEffect, useLayoutEffect } from 'react';
import bubbleReducer from './bubbleReducer';

const bubbleInitialState: BubbleState = {
	top: 0,
	left: 0,
	length: -17,
	height: 77,
	visible: false,
	isDragging: false,
};

export default function useUpdateBubbleState(
	mousePosition: { x: number; y: number },
	inputState: InputState,
	bubbleIndicatorRef: React.RefObject<SVGSVGElement>,
	numberInputSpans: HTMLSpanElement[],
	singleCharacterWidth: number
) {
	const [bubbleState, dispatchBubbleState] = useReducer(bubbleReducer, bubbleInitialState);

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

	useEffect(() => {
		const { top, left } = getBubblePosition(mousePosition.x, mousePosition.y);
		dispatchBubbleState({ type: 'setMultiple', payload: { top, left } });
	}, [mousePosition]);

	useLayoutEffect(() => {
		if (!bubbleState.isDragging) {
			const { top, left } = getBubbleState();
			dispatchBubbleState({ type: 'setMultiple', payload: { top, left } });
		} else {
			const { top, left } = getBubblePosition(mousePosition.x, mousePosition.y);
			dispatchBubbleState({ type: 'setMultiple', payload: { top, left } });
		}
	}, [bubbleState.height, bubbleState.length]);

	/**
	 * Get bubble position based on mouse position
	 * @param x clientX position
	 * @param y clientX position
	 * @returns top and left position
	 */
	function getBubblePosition(x: number, y: number) {
		const bubbleIndicator = bubbleIndicatorRef.current;
		const parentRect = bubbleIndicator?.parentElement?.getBoundingClientRect();
		const bubbleRect = bubbleIndicator?.getBoundingClientRect();

		if (!parentRect || !bubbleRect) return { top: 0, left: 0 };
		const newPos = {
			x: ((x - parentRect.x - bubbleRect.width / 2) / parentRect.width) * 100,
			y: ((y - parentRect.y) / parentRect.height) * 100,
		};

		return {
			top: newPos.y,
			left: newPos.x,
		};
	}
	/**
	 * Get bubble state based on the last number span
	 * @returns top and left position
	 */
	function getBubbleState(): Partial<BubbleState> {
		if (numberInputSpans.length === 0) return bubbleState;
		const lastNumberSpan = numberInputSpans[numberInputSpans.length - 1];
		const spanRect = lastNumberSpan.getBoundingClientRect();
		const parentRect = bubbleIndicatorRef.current?.parentElement?.getBoundingClientRect();
		const spanList = lastNumberSpan.innerText?.split('') || [];
		const spanWithNumbers = spanList.filter((char) => !isNaN(parseInt(char)));
		const bubbleWidth = bubbleIndicatorRef.current?.getBoundingClientRect().width || 0;
		if (!parentRect) return bubbleState;
		// Word-wrap: break-word; makes the span smaller than the actual width of the text, including " " when a word is at the end of the line when line break happens.
		// To avoid this, grab with of a single character (width of placeholder / innerText.length) and multiply it by the number of characters
		const realWidth = singleCharacterWidth * spanWithNumbers.length;
		const top = ((spanRect.y - parentRect?.y + spanRect?.height / 2) / parentRect.height) * 100;
		const left =
			((spanRect.x - parentRect?.x + realWidth / 2 - bubbleWidth / 2) / parentRect.width) * 100;

		return {
			top,
			left,
			height: spanRect.height,
			length: -17 + 20 * (spanWithNumbers.length - 1),
		};
	}

	return [bubbleState, dispatchBubbleState] as const;
}
