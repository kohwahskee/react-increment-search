import { BubbleState } from '../Utils/TypesExport';

type BubbleReducerAction =
	| {
			type: 'setBubbleTop' | 'setBubbleLeft' | 'setBubbleLength' | 'setBubbleHeight';
			payload: number;
	  }
	| { type: 'setBubbleVisiblity' | 'setIsDragging'; payload: boolean }
	| { type: 'setSpanToAttach'; payload: HTMLSpanElement | null }
	| { type: 'setMultiple'; payload: Partial<BubbleState> }
	| {
			type: 'updateBubbleOnSpan';
			payload: {
				spanToAttach: HTMLSpanElement | null;
				bubbleIndicator: SVGElement | null;
				numberInputSpans: HTMLSpanElement[];
				singleCharacterWidth: number;
			};
	  }
	| {
			type: 'updateBubbleOnMouse';
			payload: { mousePosition: { x: number; y: number }; bubbleIndicator: SVGElement | null };
	  };

export default function bubbleReducer(state: BubbleState, action: BubbleReducerAction) {
	switch (action.type) {
		case 'setBubbleTop':
			return { ...state, top: action.payload };
		case 'setBubbleLeft':
			return { ...state, left: action.payload };
		case 'setBubbleLength':
			if (action.payload === -1) {
				return { ...state, length: -17 };
			}
			return { ...state, length: action.payload };
		case 'setBubbleHeight':
			return { ...state, height: action.payload };
		case 'setBubbleVisiblity':
			return { ...state, visible: action.payload };
		case 'setIsDragging': {
			const isDragging = action.payload;
			const tempObj = {
				...state,
				isDragging,
			};
			if (isDragging) {
				tempObj.length = -17;
			}
			return tempObj;
			// return { ...state, isDragging: action.payload };
		}
		case 'setSpanToAttach':
			return { ...state, spanToAttach: action.payload };
		case 'setMultiple':
			return { ...state, ...action.payload };
		case 'updateBubbleOnSpan':
			return {
				...state,
				...getBubbleStateOnSpan(
					action.payload.spanToAttach,
					action.payload.bubbleIndicator,
					action.payload.numberInputSpans,
					action.payload.singleCharacterWidth
				),
			};
		case 'updateBubbleOnMouse':
			return {
				...state,
				...getBubblePosition(action.payload.mousePosition, action.payload.bubbleIndicator),
			};
		default:
			return state;
	}
}

/**
 * Get bubble position based on mouse position
 * @param x clientX position
 * @param y clientX position
 * @returns top and left position
 */
function getBubblePosition(
	{ x, y }: { x: number; y: number },
	bubble: SVGElement | null
): Partial<BubbleState> {
	const bubbleIndicator = bubble;
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
function getBubbleStateOnSpan(
	currentSpan: HTMLSpanElement | null,
	bubble: SVGElement | null,
	numberInputSpans: HTMLSpanElement[],
	singleCharacterWidth: number
): Partial<BubbleState> {
	if (!currentSpan) currentSpan = numberInputSpans[numberInputSpans.length - 1];
	if (numberInputSpans.length === 0) return {};
	const spanRect = currentSpan.getBoundingClientRect();
	const parentRect = bubble?.parentElement?.getBoundingClientRect();
	const spanList = currentSpan.innerText?.split('') || [];
	const spanWithNumbers = spanList.filter((char) => !isNaN(parseInt(char)));
	const bubbleWidth = bubble?.getBoundingClientRect().width || 0;
	if (!parentRect) return {};
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
