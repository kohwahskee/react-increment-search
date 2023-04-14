import './style.scss';
import { SpringValue, animated, useSpring } from '@react-spring/web';
import { WheelEvent, useEffect, useRef, useState } from 'react';
import SearchResult from './SearchResults/SearchResult';

type QueriesMap = Map<number, { title: string; url: string }[]>;
interface Props {
  placeholderMap: QueriesMap;
  transitionAnimation: Record<
    string,
    SpringValue<number> | SpringValue<string>
  >;
  generatedQueries: QueriesMap;
}

export default function SearchScreen({
  placeholderMap,
  transitionAnimation,
  generatedQueries,
}: Props) {
  const SCROLL_AMOUNT = 100;

  const [yPos, setYPos] = useState(0);
  const [activeResult, setActiveResult] = useState<HTMLElement | null>(null);

  const resultsListRef = useRef<HTMLElement[]>([]);
  const containerRef = useRef<HTMLUListElement>(null);

  const scrollYAnimation = useSpring({
    to: { y: yPos },
    config: {
      round: 1,
    },
    onChange: () => {
      scrollToBound();
    },
  });

  function onScrollHandler(e: WheelEvent) {
    scrollBy(e.deltaY < 0 ? SCROLL_AMOUNT : -SCROLL_AMOUNT);
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
  }

  function scrollToElement(el: HTMLElement) {
    setYPos(getDistanceFromCenter(el));
  }

  function scrollToBound() {
    if (!containerRef.current?.parentElement) return;

    const { top, bottom } = containerRef.current.getBoundingClientRect();
    const centerPoint = getElCenterPoint(containerRef.current.parentElement);

    if (top > centerPoint) {
      scrollToElement(resultsListRef.current[0]);
    } else if (bottom < centerPoint) {
      scrollToElement(
        resultsListRef.current[resultsListRef.current.length - 1]
      );
    }
  }

  function scrollBy(amount: number) {
    setActiveResult(null);
    setYPos((prev) => prev + amount);
  }

  function generateSearchResults() {
    const addResultToList = (el: HTMLLIElement) => {
      resultsListRef.current.push(el);
    };

    const removeResult = (el: HTMLLIElement) => {
      resultsListRef.current.splice(resultsListRef.current.indexOf(el), 1);
    };

    const queriesToUse =
      generatedQueries.size === 0 ? placeholderMap : generatedQueries;

    return Array.from(queriesToUse).map(([index, queries], i) => (
      <SearchResult
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        index={index}
        queries={queries}
        setActiveResult={(value: HTMLElement | null) => setActiveResult(value)}
        onUnmount={removeResult}
        onMount={addResultToList}
        scrollYSpring={scrollYAnimation.y}
      />
    ));
  }

  useEffect(() => {
    const activeResultIndex = localStorage.getItem('activeResultIndex') ?? 0;
    setActiveResult(resultsListRef.current[+activeResultIndex]);

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

  useEffect(() => {
    if (!activeResult) return;
    const activeResultIndex = resultsListRef.current.indexOf(activeResult);
    localStorage.setItem('activeResultIndex', activeResultIndex.toString());
  }, [activeResult]);

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
      <animated.ul
        style={scrollYAnimation}
        ref={containerRef}
        className="search-results-wrapper"
      >
        {generateSearchResults()}
      </animated.ul>
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
