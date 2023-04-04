import './App.scss';
import './reset.css';
import { useTransition } from '@react-spring/web';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import OptionScreen from './components/OptionScreen/OptionScreen';
import RichInput from './components/RichInput/RichInput';
import SearchScreen from './components/SearchScreen/SearchScreen';
import ShortcutHelpers from './components/ShortcutHelpers/ShortcutHelpers';
import {
  InputState,
  Options,
  QueriesMap,
  ResultResponse,
  SearchQuery,
  StorageQuery,
} from './components/Utils/TypesExport';

const ENGINE_KEY = '27778fadd392d4a8e';
const API_KEY = 'AIzaSyDdiLqgc6mda7xAthDgXzcrf9rN3oe-RwY';

function getRandomTitle() {
  const LOADING_PLACEHOLDERS = [
    'Loading really really hard...',
    'Searching the web...',
    'Hacking into CIA servers...',
    'Performing extremely complex quantum physic computations...',
    'Filtering out the naughty results...',
    'Summoning a demon from another world...',
    'Negotiating with aliens for advanced technology...',
    'Calculating the meaning of life...',
    'Rewriting the Matrix for better loading experience...',
    `Scraping the web for ${Math.floor(Math.random() * 1000000000)} results...`,
    'Generating loading texts (this is one of them)...',
    'Putting three dots at the end of this sentence...',
  ];
  return LOADING_PLACEHOLDERS[
    Math.floor(Math.random() * LOADING_PLACEHOLDERS.length)
  ];
}

async function getQueriesMap(options: Options, searchQuery: SearchQuery) {
  const startingNumber =
    options.startingNumber === 'selected'
      ? searchQuery.incrementable
      : options.startingNumber === '0'
      ? 0
      : 1;
  const { numberOfSearches, resultsPerSearch } = options;

  const promiseMap: Map<number, Promise<ResultResponse>> = new Map();

  for (let i = 0; i < numberOfSearches; i++) {
    const searchIndex = i + startingNumber;
    const searchQ = `${searchQuery.firstHalf} ${searchIndex} ${searchQuery.secondHalf}`;
    const num = 4;
    const searchParams = `key=${API_KEY}&cx=${ENGINE_KEY}&q=${searchQ}&num=${num}`;
    // const searchURL = `https://www.googleapis.com/customsearch/v1?${searchParams}`;

    const searchURL = `http://localhost:3000/${searchQ}&${searchIndex}`;
    promiseMap.set(
      searchIndex,
      fetch(searchURL)
        .then((resp) => {
          if (!resp.ok) {
            const items = {
              link: '',
              title: 'Failed to fetch results',
            };
            const errorResponse: ResultResponse = {
              items: [items, items, items, items],
            };
            return errorResponse;
          }

          return resp.json() as Promise<ResultResponse>;
        })
        .catch((err) => {
          throw new Error(err as string);
        })
    );
  }

  const queries: QueriesMap = new Map();
  const resultPromises = Array.from(promiseMap.values());
  const indexArray = Array.from(promiseMap.keys());

  try {
    const results = await Promise.all(resultPromises);
    results.forEach((res, i) => {
      const items = [];

      for (let j = 0; j < resultsPerSearch; j++) {
        const { title, link } = res.items[j];
        items.push({ title, url: link });
      }

      queries.set(indexArray[i], items);
    });
    return queries;
  } catch (error) {
    throw new Error('Failed to parse results.');
  }
}

function useOptionShortcut(isShown: boolean, setFn: (value: boolean) => void) {
  // Update generated queries when options change
  useEffect(() => {
    if (isShown) {
      document.addEventListener('keydown', keyDownHandler);
    }

    function keyDownHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setFn(false);
      }
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [isShown, setFn]);
}

type AppState = {
  inputState: InputState;
  inputValue: string;
  optionShown: boolean;
  generatedQueries: QueriesMap;
  searchQuery: SearchQuery;
  options: Options;
};

type AppStateAction =
  | {
      type: 'setInputState';
      payload: { inputState: InputState } & Partial<AppState>;
    }
  | {
      type: 'setInputValue';
      payload: string;
    }
  | {
      type: 'setOptionShown';
      payload: boolean;
    }
  | {
      type: 'setGeneratedQueries';
      payload: QueriesMap;
    }
  | {
      type: 'setSearchQuery';
      payload: SearchQuery;
    }
  | {
      type: 'setOptions';
      payload: Partial<Options>;
    }
  | {
      type: 'toggleOptionShown';
    };

function appStateReducer(state: AppState, action: AppStateAction) {
  switch (action.type) {
    case 'setInputState':
      return {
        ...state,
        ...action.payload,
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

const initialAppState: AppState = {
  inputState: null,
  inputValue: '',
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

function App() {
  const [appState, dispatchAppState] = useReducer(
    appStateReducer,
    initialAppState
  );

  const {
    inputState,
    inputValue,
    optionShown,
    generatedQueries,
    searchQuery,
    options,
  } = appState;

  const lastQuery = useRef<SearchQuery>(appState.searchQuery);
  const lastGeneratedQueries = useRef<QueriesMap>(generatedQueries);

  const placeholderMap = useMemo(() => {
    const tempMap: QueriesMap = new Map();

    for (let i = 0; i < options.numberOfSearches; i++) {
      const queries = [];

      for (let j = 0; j < options.resultsPerSearch; j++) {
        queries.push({ title: getRandomTitle(), url: '' });
      }

      tempMap.set(i, queries);
    }

    return tempMap;
  }, [options]);

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
  // Retrieve last query from local storage
  useEffect(() => {
    const queryFromStorage = localStorage.getItem('lastQuery');

    if (queryFromStorage) {
      const parsedQuery = JSON.parse(queryFromStorage) as SearchQuery;
      const { firstHalf, secondHalf, incrementable } = parsedQuery;
      dispatchAppState({
        type: 'setInputState',
        payload: {
          inputState: 'FINISHED',
          inputValue: `${firstHalf}${incrementable}${secondHalf}`,
          searchQuery: parsedQuery,
        },
      });
    }
  }, []);

  // Save last query to local storage
  useEffect(() => {
    if (
      searchQuery.firstHalf === '' &&
      searchQuery.secondHalf === '' &&
      Number.isNaN(searchQuery.incrementable)
    )
      return;
    localStorage.setItem('lastQuery', JSON.stringify(searchQuery));
  }, [searchQuery]);

  // Update placeholder map when options change
  useEffect(() => {
    lastQuery.current = { firstHalf: '', secondHalf: '', incrementable: NaN };
    dispatchAppState({ type: 'setGeneratedQueries', payload: placeholderMap });
  }, [options.numberOfSearches, options.startingNumber, placeholderMap]);

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
      dispatchAppState({ type: 'setOptionShown', payload: false });
      fetchQueries();
    }
  }, [inputState, options, placeholderMap, searchQuery]);

  useEffect(() => {
    if (inputState === 'TYPING')
      dispatchAppState({
        type: 'setGeneratedQueries',
        payload: placeholderMap,
      });
  }, [placeholderMap, options, inputState]);

  return (
    <div className="App">
      <div className="circle-container">
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
        inputValue={[
          inputValue,
          (value: string) =>
            dispatchAppState({ type: 'setInputValue', payload: value }),
        ]}
        inputState={[
          inputState,
          (state: InputState) =>
            dispatchAppState({
              type: 'setInputState',
              payload: { inputState: state },
            }),
        ]}
        setSearchQuery={(query: SearchQuery) =>
          dispatchAppState({ type: 'setSearchQuery', payload: query })
        }
      />

      {inputState !== 'FINISHED' && <ShortcutHelpers inputState={inputState} />}

      {searchScreenTransition(
        (style, show) =>
          show && (
            <SearchScreen
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
