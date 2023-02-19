interface BubbleState {
	top: number;
	left: number;
	length: number;
	height: number;
	visible: boolean;
	isDragging: boolean;
	spanToAttach: HTMLSpanElement | null;
}

type InputState = null | 'TYPING' | 'SELECTING' | 'FINISHED';

export type { BubbleState, InputState };
