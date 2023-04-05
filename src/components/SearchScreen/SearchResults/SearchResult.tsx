import { animated, easings, useSpringValue } from '@react-spring/web';
import { useEffect, useRef } from 'react';
import './style.scss';

interface Props {
  queries: {
    title: string;
    url: string;
  }[];
  index: number;
  setActiveResult: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  yPos: number;
  onMount: (el: HTMLLIElement) => void;
  onUnmount: (el: HTMLLIElement) => void;
}

export default function SearchResult({
  index,
  setActiveResult,
  yPos,
  queries,
  onMount: addResultToList,
  onUnmount: removeResult,
}: Props) {
  const searchResultRef = useRef<HTMLLIElement>(null);
  const parentRectRef = useRef<DOMRect>();
  const initialRef = useRef<DOMRect>();
  const scrollYAnimation = useSpringValue(yPos);

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

  useEffect(() => {
    if (!searchResultRef.current || !parentRectRef.current) return;

    // shouldAnimate() causes animation to overshoot
    if (shouldAnimate()) {
      searchResultRef.current.style.opacity = '1';
      scrollYAnimation.start(yPos, {
        config: {
          easing: easings.linear,
          // Firefox has problem interpolating decimal values
          // causing laggy animation
          round: 1,
        },
      });
    } else {
      searchResultRef.current.style.opacity = '0';
    }

    function shouldAnimate() {
      if (
        !searchResultRef.current ||
        !parentRectRef.current ||
        !initialRef.current
      ) {
        return false;
      }

      const elRect = searchResultRef.current.getBoundingClientRect();
      const parentRect = parentRectRef.current;

      const currentTop = elRect.top;
      const currentBottom = elRect.bottom;
      const futureTop = initialRef.current.top + yPos;
      const futureBottom = initialRef.current.bottom + yPos;

      // If future position OR  current position  is in view
      // -> Animate
      return (
        (currentTop >= parentRect.top && currentBottom <= parentRect.bottom) ||
        (futureTop >= parentRect.top && futureBottom <= parentRect.bottom)
      );
    }
  }, [scrollYAnimation, yPos]);

  return (
    <animated.li
      ref={searchResultRef}
      className="search-result"
      style={{
        transform: scrollYAnimation.to(
          (value) => `translate3d(0,${value}px,0)`
        ),
        scale: scrollYAnimation.to(() => {
          if (!searchResultRef.current || !parentRectRef.current) return 1;
          const distanceFromCenter = getDistanceFromCenter(
            searchResultRef.current,
            parentRectRef.current
          );

          return Math.max(
            0.0001,
            Math.min(1, 1 - (0.003 * distanceFromCenter) ** 2)
          );
        }),
        opacity: scrollYAnimation.to(() => {
          if (!searchResultRef.current || !parentRectRef.current) return 1;

          const distanceFromCenter = getDistanceFromCenter(
            searchResultRef.current,
            parentRectRef.current
          );

          return (
            Math.max(
              0.0001,
              Math.min(1, 1 - (0.003 * distanceFromCenter) ** 1.7)
            ) * 1000
          );
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
