interface BubbleState {
	top: number;
	left: number;
	length: number;
	height: number;
	visible: boolean;
	isDragging: boolean;
}

type InputState = null | 'TYPING' | 'SELECTING' | 'FINISHED';

export type { BubbleState, InputState };
