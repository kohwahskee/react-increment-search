import { InputState, SearchQuery } from '../Utils/TypesExport';

export function generateSpans(
  inputSpansRef: React.MutableRefObject<HTMLSpanElement[]>,
  numberSpansRef: React.MutableRefObject<HTMLSpanElement[]>,
  inputValue: string,
  inputState: InputState
) {
  if (inputValue === '') return null;
  const spans = inputValue.match(/\s+|\S+/g)?.map((word, index) => {
    const isNumber = word.match(/^\s*\d+\s*$/g)?.length === 1;
    return (
      <span
        ref={(el) => {
          if (!el) return;
          inputSpansRef.current.push(el);
          if (isNumber) numberSpansRef.current.push(el);
        }}
        data-isnumber={isNumber}
        className={`text-span ${inputState === 'SELECTING' ? 'selecting' : ''}`}
        // eslint-disable-next-line react/no-array-index-key
        key={`${word}-${index}`}
      >
        {`${word}`}
      </span>
    );
  });
  return spans;
}

export function parseSearchQuery(
  currentSpan: HTMLSpanElement | null,
  spanList: HTMLSpanElement[]
) {
  let firstHalf = '';
  let secondHalf = '';
  const incrementable = parseInt(currentSpan?.innerText || '', 10);
  let flip = false;
  spanList.forEach((span) => {
    if (span === currentSpan) {
      flip = true;
      return;
    }

    if (!flip) {
      firstHalf += span.innerText;
    } else {
      secondHalf += span.innerText;
    }
  });
  return {
    firstHalf,
    secondHalf,
    incrementable,
  };
}

export function shortenQuery(query: SearchQuery, limit: number) {
  let shortenedString: string;

  if (Number.isNaN(query.incrementable)) {
    shortenedString = `${query.firstHalf.slice(0, limit)}...`;
  } else {
    const firstHalf = query.firstHalf.slice(0, limit / 2);
    const secondHalf = query.secondHalf.slice((limit / 2) * -1);
    const { incrementable } = query;
    shortenedString = `${firstHalf}...${incrementable}${
      query.secondHalf.length > limit / 2 ? '...' : ''
    } ${secondHalf}`;
  }

  return shortenedString;
}
