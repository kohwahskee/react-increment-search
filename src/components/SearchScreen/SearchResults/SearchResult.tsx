import { SpringValue, animated } from '@react-spring/web';
import { useEffect, useRef } from 'react';
import './style.scss';
import { clamp, getDistanceFromCenter } from '../Helpers';

interface Props {
  queries: {
    title: string;
    url: string;
  }[];
  index: number;
  setActiveResult: (el: HTMLLIElement | null) => void;
  onMount: (el: HTMLLIElement) => void;
  onUnmount: (el: HTMLLIElement) => void;
  scrollSpring: SpringValue<number>;
}

export default function SearchResult({
  index,
  setActiveResult,
  queries,
  onMount: addResultToList,
  onUnmount: removeResult,
  scrollSpring,
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
      style={(() => {
        if (!searchResultRef.current?.parentElement?.parentElement) return {};

        const el = searchResultRef.current;
        const parentEl = searchResultRef.current.parentElement.parentElement;
        return {
          scale: scrollSpring.to(() => {
            const distanceFromCenter = getDistanceFromCenter(el, parentEl);
            const newTransformProp = clamp(
              1 - (0.003 * distanceFromCenter) ** 2,
              0.1,
              1
            );
            return Math.round(newTransformProp * 100) / 100;
          }),
          opacity: scrollSpring.to(() => {
            const distanceFromCenter = getDistanceFromCenter(el, parentEl);
            const newTransformProp = clamp(
              1 - (0.003 * distanceFromCenter) ** 2,
              0.1,
              1
            );
            return Math.round(newTransformProp * 100) / 100;
          }),
        };
      })()}
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
