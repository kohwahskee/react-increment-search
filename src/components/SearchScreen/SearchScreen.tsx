import './style.scss';
import SearchResult from './SearchResults/SearchResult';
import { animated, useSpring, useSpringValue } from '@react-spring/web';
import { useEffect, useRef, useState, WheelEvent } from 'react';

export default function SearchScreen() {
	const SCROLL_AMOUNT = 100;
	const [yPos, setYPos] = useState(0);
	const resultsRef = useRef<HTMLDivElement[]>(null);
	const [activeResult, setActiveResult] = useState<HTMLElement | null>(null);

	const scrollYAnimation = useSpringValue(yPos);

	const containerRef = useRef<HTMLDivElement>(null);

	const onScrollHandler = (e: WheelEvent) => {
		const nextItem = e.currentTarget.children[0].children;
		setYPos((prev) => {
			return e.deltaY < 0 ? prev + SCROLL_AMOUNT : prev - SCROLL_AMOUNT;
		});
		setActiveResult(null);
	};

	useEffect(() => {
		scrollYAnimation.start(yPos, {
			config: {
				mass: 1,
				tension: 170,
				friction: 26,
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

	return (
		<div
			onWheel={onScrollHandler}
			className='result-container'>
			<div className='indicator-line left-line' />
			<div className='indicator-line right-line' />
			<animated.div
				style={{ transform: scrollYAnimation.to((value) => `translateY(${value}px)`) }}
				ref={containerRef}
				className='search-results-wrapper'>
				{[...Array(50)].map((item, i) => {
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
