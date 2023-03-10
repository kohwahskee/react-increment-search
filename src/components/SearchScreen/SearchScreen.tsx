import './style.scss';
import SearchResult from './SearchResults/SearchResult';
import { useSpringValue } from '@react-spring/web';
import { useEffect, useRef, useState, WheelEvent } from 'react';

export default function SearchScreen() {
	const SCROLL_AMOUNT = 100;
	const [yPos, setYPos] = useState(0);
	const resultsListRef = useRef<HTMLDivElement[]>([]);
	const [activeResult, setActiveResult] = useState<HTMLElement | null>(null);
	const scrollYAnimation = useSpringValue(yPos);
	const containerRef = useRef<HTMLDivElement>(null);

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
		console.log('mouse up');
		document.removeEventListener('mousemove', mouseMoveHandler);
		document.removeEventListener('mouseup', mouseUpHandler);
	}

	function scrollBy(amount: number) {
		setYPos((prev) => prev + amount);
		setActiveResult(null);
	}

	return (
		<div
			onMouseDown={mouseDownHandler}
			onWheel={onScrollHandler}
			className='result-container'>
			<hr className={`indicator-line left-line ${!activeResult ? 'selecting' : ''}`} />
			<hr className={`indicator-line right-line ${!activeResult ? 'selecting' : ''}`} />
			<div
				ref={containerRef}
				className='search-results-wrapper'>
				{[...Array(40)].map((item, i) => {
					return (
						<SearchResult
							index={i}
							key={i}
							setActiveResult={setActiveResult}
							yPos={yPos}
						/>
					);
				})}
			</div>
		</div>
	);
}

function getDistanceFromCenter(el: HTMLElement): number {
	if (!el.parentElement) return 0;

	const parentEl = el.parentElement;
	const parentRect = parentEl.getBoundingClientRect();
	const elRect = el.getBoundingClientRect();
	const centerPoint = parentRect.top + parentRect.height / 2;
	const elCenterPoint = elRect.top + elRect.height / 2;

	// debugger;
	return centerPoint - elCenterPoint;
}
