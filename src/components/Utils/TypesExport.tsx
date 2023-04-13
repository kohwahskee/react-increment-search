export interface BubbleState {
  top: number;
  left: number;
  length: number;
  height: number;
  visible: boolean;
  isDragging: boolean;
  spanToAttach: HTMLSpanElement | null;
}

export type ResultResponse = {
  kind?: string;
  url?: {
    type: string;
    template: string;
  };
  queries?: {
    request: {
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }[];
    nextPage: object[];
  };
  context?: object;
  searchInformation?: object;
  items: {
    kind?: string;
    title: string;
    htmlTitle?: string;
    link: string;
    displayLink?: string;
    snippet?: string;
    htmlSnippet?: string;
    formattedUrl?: string;
    htmlFormattedUrl?: string;
    pagemap?: {
      cse_thumbnail: object[];
      metatags: object[];
      cse_image: object[];
    };
  }[];
};

export type InputState = null | 'TYPING' | 'SELECTING' | 'FINISHED';

export interface SearchQuery {
  firstHalf: string;
  secondHalf: string;
  incrementable: number;
}

export interface Options {
  numberOfSearches: number;
  startingNumber: 'selected' | '0' | '1';
  resultsPerSearch: number;
}

export type QueriesMap = Map<number, { title: string; url: string }[]>;

export type AppState = {
  inputState: InputState;
  inputValue: string;
  optionShown: boolean;
  generatedQueries: QueriesMap;
  searchQuery: SearchQuery;
  options: Options;
};

export type AppStateAction =
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
export type StorageData = {
  options?: Options;
  searchQuery?: SearchQuery;
  generatedQueries?: { [index: number]: { title: string; url: string }[] };
} | null;
