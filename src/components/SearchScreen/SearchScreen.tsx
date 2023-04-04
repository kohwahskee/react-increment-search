import './style.scss';
import { SpringValue, animated } from '@react-spring/web';
import { WheelEvent, useCallback, useEffect, useRef, useState } from 'react';
import SearchResult from './SearchResults/SearchResult';

// TODO:
// 1. Add a scroll boundary

type QueriesMap = Map<number, { title: string; url: string }[]>;
interface Props {
  transitionAnimation: Record<
    string,
    SpringValue<number> | SpringValue<string>
  >;
  generatedQueries: QueriesMap;
}

export default function SearchScreen({
  transitionAnimation,
  generatedQueries,
}: Props) {
  const SCROLL_AMOUNT = 100;

  const [yPos, setYPos] = useState(0);
  const [activeResult, setActiveResult] = useState<HTMLElement | null>(null);
  const resultsListRef = useRef<HTMLLIElement[]>([]);
  const containerRef = useRef<HTMLUListElement>(null);
  const scrollBoundRef = useRef({ top: 0, bottom: 0 });
  const addResultToList = useCallback((el: HTMLLIElement) => {
    resultsListRef.current.push(el);
  }, []);
  const removeResult = useCallback((el: HTMLLIElement) => {
    resultsListRef.current.splice(resultsListRef.current.indexOf(el), 1);
  }, []);

  useEffect(() => {
    const topResult = resultsListRef.current[0];
    const bottomResult =
      resultsListRef.current[resultsListRef.current.length - 1];
    const centerPoint = getElCenterPoint(containerRef.current as HTMLElement);
    const topBound = centerPoint - getElCenterPoint(topResult);
    const bottomBound = centerPoint - getElCenterPoint(bottomResult);

    scrollBoundRef.current = { top: topBound, bottom: bottomBound };
    setActiveResult(resultsListRef.current[0]);

    return () => {
      resultsListRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!activeResult) return;
    scrollToElement(activeResult);
    resultsListRef.current.forEach((el) => {
      el.classList.remove('active-result');
    });
    activeResult.classList.add('active-result');
  }, [activeResult]);

  function scrollToElement(el: HTMLElement) {
    setYPos((prev) => getDistanceFromCenter(el) + prev);
  }

  function onScrollHandler(e: WheelEvent) {
    const [topBound, bottomBound] = [
      scrollBoundRef.current.top,
      scrollBoundRef.current.bottom,
    ];

    // If scrolling up and goes past top bound -> scroll to top
    if (e.deltaY < 0 && yPos + SCROLL_AMOUNT >= topBound) {
      scrollBy(topBound - yPos);
    }
    // If scrolling down and goes past bottom bound -> scroll to bottom
    else if (e.deltaY > 0 && yPos - SCROLL_AMOUNT <= bottomBound) {
      scrollBy(bottomBound - yPos);
    }
    // Otherwise scroll normally
    else {
      scrollBy(e.deltaY < 0 ? SCROLL_AMOUNT : -SCROLL_AMOUNT);
    }
  }

  function mouseDownHandler() {
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  function mouseMoveHandler(e: MouseEvent) {
    scrollBy(e.movementY);
  }

  function mouseUpHandler() {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    scrollToBound();
  }

  function scrollToBound() {
    if (!resultsListRef.current.length || !containerRef.current) return;

    const topResult = resultsListRef.current[0];
    const bottomResult =
      resultsListRef.current[resultsListRef.current.length - 1];
    const centerPoint = getElCenterPoint(containerRef.current);

    const topBound = centerPoint - getElCenterPoint(topResult);
    const bottomBound = centerPoint - getElCenterPoint(bottomResult);

    if (topBound < 0) {
      scrollToElement(topResult);
    } else if (bottomBound > 0) {
      scrollToElement(bottomResult);
    }
  }

  function scrollBy(amount: number) {
    setActiveResult(null);
    setYPos((prev) => prev + amount);
  }

  return (
    <animated.div
      style={transitionAnimation}
      onMouseDown={mouseDownHandler}
      onWheel={onScrollHandler}
      className="result-container"
    >
      <hr
        className={`indicator-line left-line ${
          !activeResult ? 'selecting' : ''
        }`}
      />
      <hr
        className={`indicator-line right-line ${
          !activeResult ? 'selecting' : ''
        }`}
      />
      <ul ref={containerRef} className="search-results-wrapper">
        {Array.from(generatedQueries).map(([index, queries], i) => (
          <SearchResult
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            index={index}
            queries={queries}
            setActiveResult={setActiveResult}
            onUnmount={removeResult}
            onMount={addResultToList}
            yPos={yPos}
          />
        ))}
      </ul>
    </animated.div>
  );
}

function getDistanceFromCenter(el: HTMLElement): number {
  if (!el.parentElement) return 0;
  const centerPoint = getElCenterPoint(el.parentElement);
  const elCenterPoint = getElCenterPoint(el);

  return centerPoint - elCenterPoint;
}

function getElCenterPoint(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  return rect.top + rect.height / 2;
}
