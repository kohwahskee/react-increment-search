import './App.scss';
import './reset.css';
import { useTransition } from '@react-spring/web';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  getFromLocalStorage,
  getQueriesMap,
  getRandomTitle,
  serializeData,
} from './Helpers';
import useAppStateReducer from './useAppStateReducer';
import useOptionShortcut from './useOptionShortcut';
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
    numberOfSearches: 10,
    startingNumber: 'selected',
    resultsPerSearch: 2,
  },
};

function getPlaceholderMap(numberOfSearches: number, resultsPerSearch: number) {
  const tempMap: QueriesMap = new Map();

  for (let i = 0; i < numberOfSearches; i++) {
    const queries = [];

    for (let j = 0; j < resultsPerSearch; j++) {
      queries.push({ title: getRandomTitle(), url: '' });
    }

    tempMap.set(i, queries);
  }

  return tempMap;
}

function getMapFromObject(obj: object) {
  const map = new Map();

  Object.entries(obj).forEach(([key, value]) => {
    map.set(Number(key), value);
  });

  return map;
}

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

  useOptionShortcut(optionShown, (value) =>
    dispatchAppState({ type: 'setOptionShown', payload: value })
  );

  useEffect(() => {
    // console.log(generatedQueries);
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

  // Update generated queries when input value changes
  useEffect(() => {
    async function fetchQueries() {
      const queries = await getQueriesMap(options, searchQuery);
      lastGeneratedQueries.current = queries;
      dispatchAppState({ type: 'setGeneratedQueries', payload: queries });
    }

    if (inputState === 'FINISHED') {
      if (
        searchQuery.firstHalf === lastQuery.current.firstHalf &&
        searchQuery.secondHalf === lastQuery.current.secondHalf &&
        searchQuery.incrementable === lastQuery.current.incrementable
      ) {
        dispatchAppState({
          type: 'setGeneratedQueries',
          payload: lastGeneratedQueries.current,
        });
        return;
      }

      lastQuery.current = searchQuery;
      localStorage.setItem('activeResultIndex', '0');
      dispatchAppState({ type: 'setGeneratedQueries', payload: new Map() });
      dispatchAppState({ type: 'setOptionShown', payload: false });
      fetchQueries();
    }
  }, [dispatchAppState, inputState, options, searchQuery]);

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
