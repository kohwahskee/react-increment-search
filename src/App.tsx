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
  ResultResponse,
  SearchQuery,
  StorageQuery,
} from './components/Utils/TypesExport';

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
    promiseMap.set(
      searchIndex,
      fetch(`http://localhost:3000/${searchIndex}`).then(
        (resp) => resp.json() as Promise<ResultResponse>
      )
    );
  }

  const queries: QueriesMap = new Map();
  const promiseArray = Array.from(promiseMap.values());
  const indexArray = Array.from(promiseMap.keys());

  try {
    const results = await Promise.all(promiseArray);
    results.forEach((res, i) => {
      const items = [];
      for (let j = 0; j < resultsPerSearch; j++) {
        const { title, link } = res.items[j];
        const shortenedTitle =
          title.length > 50 ? `${title.slice(0, 50)}...` : title;
        items.push({ title: shortenedTitle, url: link });
      }
      queries.set(indexArray[i], items);
    });
    return queries;
  } catch (error) {
    throw new Error(error as string);
  }
}

function App() {
  const [inputState, setInputState] = useState<InputState>(null);
  const [inputValue, setInputValue] = useState('');
  const [optionShown, setOptionShown] = useState(false);
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
      setSearchQuery(parsedQuery.searchQuery);
      setInputState('SELECTING');
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
    const savedQuery: StorageQuery = {
      searchQuery,
    };
    localStorage.setItem('lastQuery', JSON.stringify(savedQuery));
  }, [searchQuery]);

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

  // Update placeholder map when options change
  useEffect(() => {
    lastQuery.current = { firstHalf: '', secondHalf: '', incrementable: NaN };
    setGeneratedQueries(placeholderMap);
  }, [options, placeholderMap]);

  // Update generated queries when input value changes
  useEffect(() => {
    async function fetchQueries() {
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

        const queries = await getQueriesMap(options, searchQuery);
        lastGeneratedQueries.current = queries;
        setGeneratedQueries(queries);
      }
    }

    fetchQueries();
  }, [inputState, options, placeholderMap, searchQuery]);

  useEffect(() => {
    if (inputState === 'TYPING') setGeneratedQueries(placeholderMap);
  }, [placeholderMap, options, inputState]);

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
