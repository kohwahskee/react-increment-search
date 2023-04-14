import './App.scss';
import './reset.css';
import { useTransition } from '@react-spring/web';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  getFromLocalStorage,
  getMapFromObject,
  getPlaceholderMap,
  serializeData,
} from './Helpers';
import useAppStateReducer from './hooks/useAppStateReducer';
import useFetchQueries from './hooks/useFetchQueries';
import useOptionShortcut from './hooks/useOptionShortcut';
import OptionScreen from '../OptionScreen/OptionScreen';
import RichInput from '../RichInput/RichInput';
import SearchScreen from '../SearchScreen/SearchScreen';
import ShortcutHelpers from '../ShortcutHelpers/ShortcutHelpers';
import {
  AppState,
  InputState,
  Options,
  QueriesMap,
  SearchQuery,
} from '../Utils/TypesExport';

const initialAppState: AppState = {
  inputValue: '',
  inputState: null,
  optionShown: false,
  generatedQueries: new Map(),
  searchQuery: {
    firstHalf: '',
    secondHalf: '',
    incrementable: NaN,
  },
  options: {
    numberOfSearches: 100,
    startingNumber: 'selected',
    resultsPerSearch: 2,
  },
};

function App() {
  const [appState, dispatchAppState] = useAppStateReducer(initialAppState);

  const {
    inputState,
    inputValue,
    optionShown,
    generatedQueries,
    searchQuery,
    options,
  } = appState;

  const initialInputValueRef = useRef<string>(inputValue);
  const lastQuery = useRef<SearchQuery>(appState.searchQuery);
  const lastGeneratedQueries = useRef<QueriesMap>(generatedQueries);

  const placeholderMap = useMemo(
    () => getPlaceholderMap(options.numberOfSearches, options.resultsPerSearch),
    [options]
  );

  const setInputValue = useCallback(
    (value: string) => {
      dispatchAppState({ type: 'setInputValue', payload: value });
    },
    [dispatchAppState]
  );

  const setInputState = useCallback(
    (value: InputState) => {
      dispatchAppState({
        type: 'setInputState',
        payload: { inputState: value },
      });
    },
    [dispatchAppState]
  );

  const searchScreenTransition = useTransition(inputState === 'FINISHED', {
    from: { transform: 'translate3d(-50%, 0%, 0)', opacity: 0 },
    enter: { transform: 'translate3d(-50%, 0%, 0)', opacity: 1 },
    leave: { transform: 'translate3d(-50%, 20%, 0)', opacity: 0 },
  });

  const optionScreenTransition = useTransition(
    optionShown && inputState !== 'FINISHED',
    {
      from: { translateY: '-100%' },
      enter: { translateY: '0%' },
      leave: { translateY: '-100%' },
      config: {
        mass: 1,
        tension: 500,
        friction: 40,
        clamp: !optionShown,
      },
    }
  );

  useOptionShortcut(optionShown, dispatchAppState);

  useFetchQueries({
    inputState,
    dispatcher: dispatchAppState,
    searchQuery,
    lastQuery,
    options,
    lastGeneratedQueries,
  });

  // Retrieve data from local storage
  useEffect(() => {
    const data = getFromLocalStorage('data');

    if (data) {
      if (data.options) {
        dispatchAppState({ type: 'setOptions', payload: data.options });
      }

      if (data.searchQuery) {
        initialInputValueRef.current = `${data.searchQuery.firstHalf}${data.searchQuery.incrementable}${data.searchQuery.secondHalf}`;
        lastQuery.current = data.searchQuery;
        dispatchAppState({
          type: 'setInputState',
          payload: {
            inputState: 'FINISHED',
            inputValue: `${data.searchQuery.firstHalf}${data.searchQuery.incrementable}${data.searchQuery.secondHalf}`,
            searchQuery: data.searchQuery,
          },
        });
      }

      if (data.generatedQueries) {
        const queriesMap = getMapFromObject(
          data.generatedQueries
        ) as QueriesMap;
        lastGeneratedQueries.current = queriesMap;
        dispatchAppState({
          type: 'setGeneratedQueries',
          payload: queriesMap,
        });
      }
    }
  }, [dispatchAppState]);

  // Save data to local storage
  useEffect(() => {
    if (inputState === 'FINISHED' && searchQuery.firstHalf !== '') {
      localStorage.setItem(
        'data',
        serializeData({
          options,
          searchQuery,
          generatedQueries: Object.fromEntries(generatedQueries.entries()),
        })
      );
    }
  }, [generatedQueries, inputState, options, searchQuery]);

  return (
    <div className="App">
      <div className="circle-container">
        <div
          className={`pink-circle ${
            inputState === 'FINISHED' ? 'finished' : ''
          }`}
        />
        <div
          className={`purple-circle ${
            inputState === 'FINISHED' ? 'finished' : ''
          }`}
        />
        <div
          className={`red-circle ${
            inputState === 'FINISHED' ? 'finished' : ''
          }`}
        />
      </div>

      <RichInput
        initialInputValue={initialInputValueRef.current}
        inputValue={[inputValue, setInputValue]}
        inputState={[inputState, setInputState]}
        setSearchQuery={(query: SearchQuery) =>
          dispatchAppState({ type: 'setSearchQuery', payload: query })
        }
      />

      {inputState !== 'FINISHED' && <ShortcutHelpers inputState={inputState} />}

      {searchScreenTransition(
        (style, show) =>
          show && (
            <SearchScreen
              placeholderMap={placeholderMap}
              generatedQueries={generatedQueries}
              transitionAnimation={style}
            />
          )
      )}

      {optionScreenTransition(
        (style, show) =>
          show && (
            <OptionScreen
              transitionAnimation={style}
              options={options}
              setOptions={(option: Partial<Options>) =>
                dispatchAppState({ type: 'setOptions', payload: option })
              }
            />
          )
      )}

      {inputState !== 'FINISHED' && (
        <button
          onClick={() =>
            dispatchAppState({
              type: 'toggleOptionShown',
            })
          }
          className={`option-button ${optionShown ? 'option-shown' : ''}`}
        >
          {optionShown ? 'Back' : 'Options'}
        </button>
      )}
    </div>
  );
}

export default App;
