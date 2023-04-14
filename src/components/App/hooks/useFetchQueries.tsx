import { useEffect } from 'react';
import {
  AppStateAction,
  InputState,
  Options,
  QueriesMap,
  SearchQuery,
} from '../../Utils/TypesExport';
import { getQueriesMap } from '../Helpers';

interface UseFetchQueriesProps {
  inputState: InputState;
  dispatcher: React.Dispatch<AppStateAction>;
  searchQuery: SearchQuery;
  lastQuery: React.MutableRefObject<SearchQuery>;
  options: Options;
  lastGeneratedQueries: React.MutableRefObject<QueriesMap>;
}

export default function useFetchQueries({
  dispatcher,
  inputState,
  lastQuery,
  searchQuery,
  options,
  lastGeneratedQueries,
}: UseFetchQueriesProps) {
  useEffect(() => {
    async function fetchQueries() {
      const queries = await getQueriesMap(options, searchQuery);
      lastGeneratedQueries.current = queries;
      dispatcher({ type: 'setGeneratedQueries', payload: queries });
    }

    if (inputState === 'FINISHED') {
      if (
        searchQuery.firstHalf === lastQuery.current.firstHalf &&
        searchQuery.secondHalf === lastQuery.current.secondHalf &&
        searchQuery.incrementable === lastQuery.current.incrementable
      ) {
        dispatcher({
          type: 'setGeneratedQueries',
          payload: lastGeneratedQueries.current,
        });
        return;
      }

      lastQuery.current = searchQuery;
      localStorage.setItem('activeResultIndex', '0');
      dispatcher({ type: 'setGeneratedQueries', payload: new Map() });
      fetchQueries();
    }
  }, [
    inputState,
    lastGeneratedQueries,
    lastQuery,
    options,
    searchQuery,
    dispatcher,
  ]);
}
