import './App.scss';
import './reset.css';
import { useTransition } from '@react-spring/web';
import { useEffect, useMemo, useRef, useState } from 'react';
import OptionScreen from './components/OptionScreen/OptionScreen';
import RichInput from './components/RichInput/RichInput';
import SearchScreen from './components/SearchScreen/SearchScreen';
import ShortcutHelpers from './components/ShortcutHelpers/ShortcutHelpers';
import {
  InputState,
  Options,
  QueriesMap,
  QueriesObject,
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

    const searchURL = `http://localhost:3000/${searchIndex}`;
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
    // FIXME: Lots of error when fetch fails (empty list, state not switchintg to FINISHED)
    throw new Error('Failed to parse results.');
  }
}

function useOptionToggle(isShown: boolean) {
  const [optionShown, setOptionShown] = useState(isShown);

  // Update generated queries when options change
  useEffect(() => {
    if (optionShown) {
      document.addEventListener('keydown', keyDownHandler);
    }

    function keyDownHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOptionShown(false);
      }
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [optionShown]);
  return [optionShown, setOptionShown] as const;
}
function isQueryEmpty(query: SearchQuery) {
  return (
    query.firstHalf === '' &&
    query.secondHalf === '' &&
    Number.isNaN(query.incrementable)
  );
}
function App() {
  const [inputState, setInputState] = useState<InputState>(null);
  const [inputValue, setInputValue] = useState('');
  const [optionShown, setOptionShown] = useOptionToggle(false);
  const [generatedQueries, setGeneratedQueries] = useState<QueriesMap>(
    new Map()
  );

  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    firstHalf: '',
    secondHalf: '',
    incrementable: NaN,
  });
  const lastQuery = useRef<SearchQuery>(searchQuery);
  const lastGeneratedQueries = useRef<QueriesMap>(generatedQueries);

  const [options, setOptions] = useState<Options>({
    numberOfSearches: 10,
    startingNumber: 'selected',
    resultsPerSearch: 2,
  });

  const placeholderMap = useMemo(() => {
    const tempMap = new Map();
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

  // Retrieve last query from local storage
  useEffect(() => {
    const queryFromStorage = localStorage.getItem('lastQuery');
    if (queryFromStorage) {
      const parsedQuery = JSON.parse(queryFromStorage) as StorageQuery;

      setInputValue(
        `${parsedQuery.searchQuery.firstHalf}${parsedQuery.searchQuery.incrementable}${parsedQuery.searchQuery.secondHalf}`
      );
      // setSearchQuery(parsedQuery.searchQuery);
      setInputState('FINISHED');
    }
  }, []);

  // Get generated queries from storage

  useEffect(() => {
    if (!localStorage.getItem('generatedQueries')) return;
    const queryFromStorage = localStorage.getItem('generatedQueries');
    const queries: QueriesMap = new Map();
    const parsedQueries: QueriesObject = JSON.parse(
      queryFromStorage || ''
    ) as QueriesObject;
    Object.entries(parsedQueries).forEach(([key, value]) => {
      queries.set(+key, value);
    });
    setGeneratedQueries(queries);
  }, []);

  useEffect(() => {
    console.log(generatedQueries);
    if (generatedQueries.size === 0) return;
    const stringifiedQueries = JSON.stringify(
      Object.fromEntries(generatedQueries)
    );
    localStorage.setItem('generatedQueries', stringifiedQueries);
  }, [generatedQueries]);
  // Save last query to local storage
  useEffect(() => {
    if (isQueryEmpty(searchQuery)) return;
    const savedQuery: StorageQuery = {
      searchQuery,
    };
    localStorage.setItem('lastQuery', JSON.stringify(savedQuery));
  }, [searchQuery]);

  // Update placeholder map when options change
  useEffect(() => {
    if (isQueryEmpty(searchQuery)) return;
    lastQuery.current = { firstHalf: '', secondHalf: '', incrementable: NaN };
    setGeneratedQueries(placeholderMap);
    console.log('option effect');
  }, [
    options.numberOfSearches,
    options.startingNumber,
    placeholderMap,
    searchQuery,
  ]);

  // Update generated queries when input value changes
  useEffect(() => {
    async function fetchQueries() {
      const queries = await getQueriesMap(options, searchQuery);
      lastGeneratedQueries.current = queries;
      setGeneratedQueries(queries);
    }
    if (inputState === 'FINISHED') {
      if (
        searchQuery.firstHalf === lastQuery.current.firstHalf &&
        searchQuery.secondHalf === lastQuery.current.secondHalf &&
        searchQuery.incrementable === lastQuery.current.incrementable
      ) {
        setGeneratedQueries(lastGeneratedQueries.current);
        return;
      }

      lastQuery.current = searchQuery;
      setOptionShown(false);
      if (isQueryEmpty(searchQuery)) return;
      fetchQueries();
    }
  }, [inputState, options, placeholderMap, searchQuery, setOptionShown]);

  useEffect(() => {
    if (isQueryEmpty(searchQuery)) return;
    if (inputState === 'TYPING') setGeneratedQueries(placeholderMap);
    console.log('search query effect');
  }, [placeholderMap, options, inputState, searchQuery]);

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
        inputValue={[inputValue, setInputValue]}
        inputState={[inputState, setInputState]}
        setSearchQuery={setSearchQuery}
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
              setOptions={setOptions}
            />
          )
      )}

      {inputState !== 'FINISHED' && (
        <button
          onClick={() => setOptionShown((prev) => !prev)}
          className={`option-button ${optionShown ? 'option-shown' : ''}`}
        >
          {optionShown ? 'Back' : 'Options'}
        </button>
      )}
    </div>
  );
}

export default App;
