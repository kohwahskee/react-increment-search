import { InputState, BubbleState } from '../../Utils/TypesExport';
import { useReducer, useEffect, useLayoutEffect } from 'react';
import bubbleReducer from './bubbleReducer';
import { SpringRef } from '@react-spring/web';

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
	singleCharacterWidth: number,
	bubbleAnimationController: SpringRef
) {
	const [bubbleState, dispatchBubbleState] = useReducer(bubbleReducer, bubbleInitialState);

	useEffect(() => {
		if (inputState === 'SELECTING') {
			dispatchBubbleState({
				type: 'setBubbleVisiblity',
				payload: numberInputSpans.length > 0,
			});
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
			dispatchBubbleState({ type: 'resetBubble' });
		}
	}, [
		inputState,
		bubbleState.spanToAttach,
		numberInputSpans,
		singleCharacterWidth,
		bubbleIndicatorRef,
	]);

	useLayoutEffect(() => {
		if (!bubbleState.isDragging) {
			if (!bubbleState.visible) {
				dispatchBubbleState({ type: 'resetBubble' });
			} else {
				dispatchBubbleState({
					type: 'updateBubbleOnSpan',
					payload: {
						numberInputSpans,
						singleCharacterWidth,
						bubbleIndicator: bubbleIndicatorRef.current,
						spanToAttach: bubbleState.spanToAttach,
					},
				});
			}
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
		bubbleAnimationController,
		bubbleIndicatorRef,
		bubbleState.height,
		bubbleState.isDragging,
		bubbleState.length,
		bubbleState.spanToAttach,
		bubbleState.visible,
		mousePosition,
		numberInputSpans,
		singleCharacterWidth,
	]);

	// When mouse position changes, update bubble state
	useEffect(() => {
		console.log('mouse position changed');
		if (!bubbleState.isDragging) return;
		dispatchBubbleState({
			type: 'updateBubbleOnMouse',
			payload: {
				mousePosition,
				bubbleIndicator: bubbleIndicatorRef.current,
			},
		});
	}, [bubbleIndicatorRef, bubbleState.isDragging, mousePosition]);

	return [bubbleState, dispatchBubbleState] as const;
}
