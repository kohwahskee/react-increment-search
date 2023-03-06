import './style.scss';
import SearchResult from './SearchResults/SearchResult';
import { animated, useSpring, useSpringRef } from '@react-spring/web';
import { useEffect, useRef, useState, WheelEvent } from 'react';

export default function SearchScreen() {
	const SCROLL_AMOUNT = 100;

	const [yPos, setYPos] = useState(0);
	const [, setTempPos] = useState(0);
	const [activeResult, setActiveResult] = useState<HTMLElement | null>(null);

	const scrollYAnimation = useSpring({
		// from: { y: 0 },
		to: { y: yPos },
		// ref: scrollAPI,
		config: {
			mass: 1,
			tension: 100,
			friction: 20,
		},
		onChange: (prop) => {
			setTempPos(prop.value.y);
		},
	});

	const containerRef = useRef<HTMLDivElement>(null);

	const onScrollHandler = (e: WheelEvent) => {
		// scroll up
		setYPos((prev) => {
			return e.deltaY < 0 ? prev + SCROLL_AMOUNT : prev - SCROLL_AMOUNT;
		});
		setActiveResult(null);
	};

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

		console.log(centerPoint - elCenterPoint);
		return centerPoint - elCenterPoint;
	}

	return (
		<div
			onWheel={onScrollHandler}
			className='result-container'>
			<div className='indicator-line left-line' />
			<div className='indicator-line right-line' />
			<animated.div
				style={scrollYAnimation}
				ref={containerRef}
				className='search-results-wrapper'>
				<SearchResult
					setActiveResult={setActiveResult}
					scrollSpring={scrollYAnimation}
				/>
				<SearchResult
					setActiveResult={setActiveResult}
					scrollSpring={scrollYAnimation}
				/>
				<SearchResult
					setActiveResult={setActiveResult}
					scrollSpring={scrollYAnimation}
				/>
				<SearchResult
					setActiveResult={setActiveResult}
					scrollSpring={scrollYAnimation}
				/>
				<SearchResult
					setActiveResult={setActiveResult}
					scrollSpring={scrollYAnimation}
				/>
				<SearchResult
					setActiveResult={setActiveResult}
					scrollSpring={scrollYAnimation}
				/>
			</animated.div>
		</div>
	);
}
