import { SpringValue, animated } from '@react-spring/web';
import { useEffect, useRef } from 'react';
import './style.scss';

interface Props {
  queries: {
    title: string;
    url: string;
  }[];
  index: number;
  setActiveResult: (el: HTMLLIElement | null) => void;
  onMount: (el: HTMLLIElement) => void;
  onUnmount: (el: HTMLLIElement) => void;
  scrollYSpring: SpringValue<number>;
}

export default function SearchResult({
  index,
  setActiveResult,
  queries,
  onMount: addResultToList,
  onUnmount: removeResult,
  scrollYSpring,
}: Props) {
  const searchResultRef = useRef<HTMLLIElement>(null);
  const parentRectRef = useRef<DOMRect>();
  const initialRef = useRef<DOMRect>();

  useEffect(() => {
    if (!searchResultRef.current) return;
    const elRect = searchResultRef.current.getBoundingClientRect();
    parentRectRef.current =
      searchResultRef.current.parentElement?.parentElement?.getBoundingClientRect();
    initialRef.current = elRect;
    const currentNode = searchResultRef.current;
    addResultToList(searchResultRef.current);

    return () => {
      removeResult(currentNode);
    };
  }, [addResultToList, removeResult]);

  return (
    <animated.li
      ref={searchResultRef}
      className="search-result"
      style={{
        scale: scrollYSpring.to(() => {
          if (
            !parentRectRef.current ||
            !searchResultRef.current?.parentElement?.parentElement
          )
            return 1;

          if (
            !isElInView(
              searchResultRef.current.parentElement.parentElement,
              searchResultRef.current
            )
          )
            return 0.1;
          const distanceFromCenter = getDistanceFromCenter(
            searchResultRef.current,
            parentRectRef.current
          );

          return clamp(1 - (0.003 * distanceFromCenter) ** 2, 0.1, 1);
        }),

        opacity: scrollYSpring.to(() => {
          if (
            !searchResultRef.current?.parentElement?.parentElement ||
            !parentRectRef.current
          )
            return 1;
          if (
            !isElInView(
              searchResultRef.current.parentElement.parentElement,
              searchResultRef.current
            )
          )
            return 0.1;
          const distanceFromCenter = getDistanceFromCenter(
            searchResultRef.current,
            parentRectRef.current
          );

          return clamp(1 - (0.003 * distanceFromCenter) ** 1.7, 0, 1);
        }),
      }}
      onClick={() => setActiveResult(searchResultRef.current)}
    >
      <div className="search-result-content">
        <h1 className="search-index-number">
          {Number.isNaN(index) ? 0 : index}
        </h1>
        {queries.map((query, i) => (
          <a
            onClick={(e) => {
              // Prevent links from opening when there is no url
              // (e.g. when fetch fails and url is empty)
              if (!query.url) e.preventDefault();
            }}
            style={{
              textDecoration: query.url ? 'underline' : 'none',
            }}
            target="_blank"
            rel="noreferrer"
            // eslint-disable-next-line react/no-array-index-key
            key={`${query.url}+${query.title}+${index} + ${i}`}
            href={query.url}
            title={query.title}
          >
            {query.title}
          </a>
        ))}
      </div>
    </animated.li>
  );
}

function getDistanceFromCenter(el: HTMLElement, parentRect: DOMRect) {
  const elRect = el.getBoundingClientRect();
  const centerPoint = parentRect.top + parentRect.height / 2;
  const elCenterPoint = elRect.top + elRect.height / 2;
  return Math.abs(centerPoint - elCenterPoint);
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function isElInView(parentEl: HTMLElement, el: HTMLElement) {
  const elRect = el.getBoundingClientRect();
  const { top, bottom } = parentEl.getBoundingClientRect();
  const { top: elTop, bottom: elBottom } = elRect;
  return elTop >= top && elBottom <= bottom;
}
