import { useEffect, useLayoutEffect, useReducer } from 'react';
import bubbleReducer from './bubbleReducer';
import { BubbleState, InputState } from '../../Utils/TypesExport';

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
  numberInputSpans: HTMLSpanElement[]
) {
  const [bubbleState, dispatchBubbleState] = useReducer(
    bubbleReducer,
    bubbleInitialState
  );

  useEffect(() => {
    if (inputState === 'SELECTING') {
      dispatchBubbleState({
        type: 'setBubbleVisibility',
        payload: numberInputSpans.length > 0,
      });
      dispatchBubbleState({
        type: 'updateBubbleOnSpan',
        payload: {
          numberInputSpans,
          spanToAttach: bubbleState.spanToAttach,
          bubbleIndicator: bubbleIndicatorRef.current,
        },
      });
    } else if (inputState === 'FINISHED') {
      dispatchBubbleState({ type: 'setBubbleVisibility', payload: false });
    } else {
      dispatchBubbleState({ type: 'resetBubble' });
    }
  }, [
    inputState,
    bubbleState.spanToAttach,
    numberInputSpans,
    bubbleIndicatorRef,
  ]);

  useLayoutEffect(() => {
    if (!bubbleState.isDragging) {
      if (!bubbleState.visible && inputState !== 'FINISHED') {
        dispatchBubbleState({ type: 'resetBubble' });
      } else {
        dispatchBubbleState({
          type: 'updateBubbleOnSpan',
          payload: {
            numberInputSpans,
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
    bubbleIndicatorRef,
    bubbleState.height,
    bubbleState.isDragging,
    bubbleState.length,
    bubbleState.spanToAttach,
    bubbleState.visible,
    inputState,
    mousePosition,
    numberInputSpans,
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

  return [bubbleState, dispatchBubbleState] as const;
}
