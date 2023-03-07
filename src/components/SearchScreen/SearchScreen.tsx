import './style.scss';
import SearchResult from './SearchResults/SearchResult';
import { animated, useSpring, useSpringValue } from '@react-spring/web';
import { useEffect, useRef, useState, WheelEvent } from 'react';

// TODO:
// 1. Try animating every single item instead of the container
//  - If items are out of view, they will not be animated (reduce performance cost)

export default function SearchScreen() {
	// const SCROLL_AMOUNT = 50;
	const [yPos, setYPos] = useState(0);
	const resultsRef = useRef<HTMLDivElement[]>(null);
	const resultsListRef = useRef<HTMLDivElement[]>([]);
	const currentResultIndex = useRef(0);
	const [activeResult, setActiveResult] = useState<HTMLElement | null>(null);

	const scrollYAnimation = useSpringValue(yPos);

	const containerRef = useRef<HTMLDivElement>(null);

	const onScrollHandler = (e: WheelEvent) => {
		const nextItem = e.currentTarget.children[0].children;
		// setYPos((prev) => {
		// 	return e.deltaY < 0 ? prev + SCROLL_AMOUNT : prev - SCROLL_AMOUNT;
		// });
		if (e.deltaY < 0) {
			currentResultIndex.current--;
			setActiveResult(resultsListRef.current[currentResultIndex.current]);
		} else {
			currentResultIndex.current++;
			setActiveResult(resultsListRef.current[currentResultIndex.current]);
		}

		// setActiveResult(null);
	};

	useEffect(() => {
		resultsListRef.current = Array.from(document.querySelectorAll('.search-result'));
		setActiveResult(resultsListRef.current[0]);
	}, []);

	useEffect(() => {
		scrollYAnimation.start(yPos, {
			config: {
				easing: (t) => t,
			},
		});
	}, [yPos]);

	useEffect(() => {
		if (!activeResult) return;
		const distanceFromCenter = getDistanceFromCenter(activeResult);
		setYPos(distanceFromCenter);
	}, [activeResult]);

	function getDistanceFromCenter(el: HTMLElement): number {
		if (!el.parentElement) return 0;

		const parentEl = el.parentElement;
		const parentRect = parentEl.getBoundingClientRect();
		const elRect = el.getBoundingClientRect();
		const centerPoint = parentRect.top + parentRect.height / 2;
		const elCenterPoint = elRect.top + elRect.height / 2;

		return centerPoint - elCenterPoint;
	}

	function scrollToItem(el: HTMLElement) {
		setYPos(getDistanceFromCenter(el));
	}

	function mouseDownHandler(e: React.MouseEvent) {
		e.currentTarget?.addEventListener('mousemove', mouseMoveHandler);
	}
	function mouseMoveHandler(e: Event) {
		setYPos((prev) => {
			return prev + (e as MouseEvent).movementY;
		});
	}

	return (
		<div
			onMouseDown={mouseDownHandler}
			onWheel={onScrollHandler}
			className='result-container'>
			<div className='indicator-line left-line' />
			<div className='indicator-line right-line' />
			<animated.div
				style={{ transform: scrollYAnimation.to((value) => `translate3d(0,${value}px, 0)`) }}
				ref={containerRef}
				className='search-results-wrapper'>
				{[...Array(200)].map((item, i) => {
					return (
						<SearchResult
							key={i}
							setActiveResult={setActiveResult}
							yPos={yPos}
						/>
					);
				})}
			</animated.div>
		</div>
	);
}
