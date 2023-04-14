import { useReducer } from 'react';
import { AppState, AppStateAction } from '../../Utils/TypesExport';

function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'setInputState':
      return {
        ...state,
        ...action.payload,
        optionShown:
          action.payload.inputState === 'FINISHED' ? false : state.optionShown,
        inputState: action.payload.inputState,
      };
    case 'setInputValue':
      return { ...state, inputValue: action.payload };
    case 'setOptionShown':
      return { ...state, optionShown: action.payload };
    case 'setGeneratedQueries':
      return { ...state, generatedQueries: action.payload };
    case 'setSearchQuery':
      return { ...state, searchQuery: action.payload };
    case 'setOptions':
      return { ...state, options: { ...state.options, ...action.payload } };
    case 'toggleOptionShown':
      return { ...state, optionShown: !state.optionShown };
    default:
      return state;
  }
}

export default function useAppStateReducer(initialState: AppState) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return [state, dispatch] as const;
}
