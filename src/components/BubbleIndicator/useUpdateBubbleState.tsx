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
	spanToAttach: null,
};

export default function useUpdateBubbleState(
	mousePosition: { x: number; y: number },
	inputState: InputState,
	bubbleIndicatorRef: React.RefObject<SVGSVGElement>,
	numberInputSpans: HTMLSpanElement[],
	singleCharacterWidth: number
) {
	const [bubbleState, dispatchBubbleState] = useReducer(bubbleReducer, bubbleInitialState);

	// When input state changes, update bubble state
	useEffect(() => {
		if (inputState === 'SELECTING') {
			dispatchBubbleState({ type: 'setBubbleVisiblity', payload: true });
			dispatchBubbleState({
				type: 'updateBubbleOnSpan',
				payload: {
					numberInputSpans,
					singleCharacterWidth,
					spanToAttach: bubbleState.spanToAttach,
					bubbleIndicator: bubbleIndicatorRef.current,
				},
			});
		} else {
			dispatchBubbleState({ type: 'setBubbleVisiblity', payload: false });
		}
	}, [
		inputState,
		bubbleState.spanToAttach,
		numberInputSpans,
		singleCharacterWidth,
		bubbleIndicatorRef,
	]);

	// When mouse position changes, update bubble state
	useEffect(() => {
		if (!bubbleState.isDragging) return;
		dispatchBubbleState({
			type: 'updateBubbleOnMouse',
			payload: {
				mousePosition,
				bubbleIndicator: bubbleIndicatorRef.current,
			},
		});
	}, [bubbleIndicatorRef, bubbleState.isDragging, mousePosition]);

	// TODO:
	// 1. Bubble should still update and snap back to span even when spanToAttach is the same
	//    due to useEffect dependency array
	// 2. When spanToAttach === null, maybe snap back to the previously selected span instead of last span
	// FIXME:
	// 1. There's an issue with bubble mispositioned when it is dragged immediately after being snapped
	useLayoutEffect(() => {
		if (!bubbleState.isDragging) {
			dispatchBubbleState({
				type: 'updateBubbleOnSpan',
				payload: {
					numberInputSpans,
					singleCharacterWidth,
					bubbleIndicator: bubbleIndicatorRef.current,
					spanToAttach: bubbleState.spanToAttach,
				},
			});
		} else {
			dispatchBubbleState({
				type: 'updateBubbleOnMouse',
				payload: {
					mousePosition,
					bubbleIndicator: bubbleIndicatorRef.current,
				},
			});
		}
	}, [
		bubbleIndicatorRef,
		bubbleState.height,
		bubbleState.isDragging,
		bubbleState.length,
		bubbleState.spanToAttach,
		mousePosition,
		numberInputSpans,
		singleCharacterWidth,
	]);

	return [bubbleState, dispatchBubbleState] as const;
}
