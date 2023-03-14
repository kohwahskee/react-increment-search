import './style.scss';
import { SpringValue, animated, easings, useSpringValue } from '@react-spring/web';
import { WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SearchResult from './SearchResults/SearchResult';

// TODO:
// 1. Add a scroll boundary

type QueriesMap = Map<number, { title: string; url: string }[]>;
interface Props {
	transitionAnimation: Record<string, SpringValue<number> | SpringValue<string>>;
	generatedQueries: QueriesMap;
}

export default function SearchScreen({ transitionAnimation, generatedQueries }: Props) {
	const SCROLL_AMOUNT = 100;
	const [yPos, setYPos] = useState(0);
	const resultsListRef = useRef<HTMLDivElement[]>([]);
	const [activeResult, setActiveResult] = useState<HTMLElement | null>(null);
	const scrollYAnimation = useSpringValue(yPos);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveResult(resultsListRef.current[0]);
		return () => {
			resultsListRef.current = [];
		};
	}, []);

	useEffect(() => {
		scrollYAnimation.start(yPos, {
			config: {
				easing: easings.linear,
			},
		});
	}, [scrollYAnimation, yPos]);

	useEffect(() => {
		if (!activeResult) return;
		setYPos((prev) => getDistanceFromCenter(activeResult) + prev);
		resultsListRef.current.forEach((el) => {
			el.classList.remove('active-result');
		});
		activeResult.classList.add('active-result');
	}, [activeResult]);

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

	function scrollBy(amount: number) {
		setYPos((prev) => prev + amount);
		setActiveResult(null);
	}

	const addResultToList = useCallback((el: HTMLDivElement) => {
		resultsListRef.current.push(el);
	}, []);
	const removeResult = useCallback((el: HTMLDivElement) => {
		resultsListRef.current.splice(resultsListRef.current.indexOf(el), 1);
	}, []);

	const generateSearchResults = useMemo(() => {
		const results = [];
		for (const [key, value] of generatedQueries) {
			const index = key;
			const queries = value;
			results.push(
				<SearchResult
					key={index}
					index={index}
					queries={queries}
					setActiveResult={setActiveResult}
					onUnmount={removeResult}
					onMount={addResultToList}
					yPos={yPos}
				/>
			);
		}
		return results;
	}, [generatedQueries, addResultToList, removeResult, yPos]);

	return (
		<animated.div
			style={transitionAnimation}
			onMouseDown={mouseDownHandler}
			onWheel={onScrollHandler}
			className='result-container'>
			<hr className={`indicator-line left-line ${!activeResult ? 'selecting' : ''}`} />
			<hr className={`indicator-line right-line ${!activeResult ? 'selecting' : ''}`} />
			<div
				ref={containerRef}
				className='search-results-wrapper'>
				{generateSearchResults}
			</div>
		</animated.div>
	);
}

function getDistanceFromCenter(el: HTMLElement): number {
	if (!el.parentElement) return 0;

	const parentEl = el.parentElement;
	const parentRect = parentEl.getBoundingClientRect();
	const elRect = el.getBoundingClientRect();
	const centerPoint = parentRect.top + parentRect.height / 2;
	const elCenterPoint = elRect.top + elRect.height / 2;

	return centerPoint - elCenterPoint;
}
