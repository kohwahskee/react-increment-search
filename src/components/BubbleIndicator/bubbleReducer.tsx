import { BubbleState } from '../Utils/TypesExport';

type BubbleReducerAction =
	| {
			type: 'setBubbleTop' | 'setBubbleLeft' | 'setBubbleLength' | 'setBubbleHeight';
			payload: number;
	  }
	| { type: 'setBubbleVisiblity' | 'setIsDragging'; payload: boolean }
	| { type: 'setMultiple'; payload: Partial<BubbleState> };

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
		case 'setMultiple':
			return { ...state, ...action.payload };
		default:
			return state;
	}
}
