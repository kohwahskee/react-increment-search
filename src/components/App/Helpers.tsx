import {
  Options,
  QueriesMap,
  ResultResponse,
  SearchQuery,
  StorageData,
} from '../Utils/TypesExport';

const ENGINE_KEY = '27778fadd392d4a8e';
const API_KEY = 'AIzaSyDdiLqgc6mda7xAthDgXzcrf9rN3oe-RwY';

function getErrorResponse(errMsg: string, link = '') {
  const items = {
    link,
    title: errMsg,
  };
  const errorResponse: ResultResponse = {
    items: [items, items, items, items],
  };
  return errorResponse;
}

export function getRandomTitle() {
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

export async function getQueriesMap(
  options: Options,
  searchQuery: SearchQuery
): Promise<QueriesMap> {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchParams = `key=${API_KEY}&cx=${ENGINE_KEY}&q=${searchQ}&num=${num}`;
    // const searchURL = `https://www.googleapis.com/customsearch/v1?${searchParams}`;

    const searchURL = `http://localhost:3000/${searchQ}&${searchIndex}`;
    promiseMap.set(
      searchIndex,
      fetch(searchURL)
        .then((resp) => {
          if (!resp.ok) {
            if (resp.status === 429) {
              return getErrorResponse('Error: Maximum Daily Requests Exceeded');
            }

            return getErrorResponse('Error: Failed to fetch results');
          }

          return resp.json() as Promise<ResultResponse>;
        })
        .catch(() => {
          return getErrorResponse('Error: Failed to fetch results');
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
    const errorResponseMap: QueriesMap = new Map();
    const errorQueries = [{ title: 'Something went wrong...', url: '' }];

    for (let i = 0; i < numberOfSearches; i++) {
      errorResponseMap.set(i, errorQueries);
    }

    return errorResponseMap;
  }
}

export function serializeData<T extends StorageData>(data: T): string {
  if (data instanceof Map) {
    return JSON.stringify(Array.from(data.entries()));
  }

  return JSON.stringify(data);
}

export function deserializeData(data: string) {
  let parsedData: StorageData;

  try {
    parsedData = JSON.parse(data) as StorageData;
  } catch {
    parsedData = null;
  }

  return parsedData;
}

export function getFromLocalStorage(key: string) {
  const data = localStorage.getItem(key);

  if (data) {
    return deserializeData(data);
  }

  return null;
}

export function getPlaceholderMap(
  numberOfSearches: number,
  resultsPerSearch: number
) {
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

export function getMapFromObject(obj: object) {
  const map = new Map();

  Object.entries(obj).forEach(([key, value]) => {
    map.set(Number(key), value);
  });

  return map;
}
