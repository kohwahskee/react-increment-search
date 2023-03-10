import './style.scss';
import { useSpringValue } from '@react-spring/web';
import { CSSProperties, WheelEvent, useEffect, useRef, useState } from 'react';
import SearchResult from './SearchResults/SearchResult';

// {1: 'name episode 2 reddit', 2: 'name episode 3 reddit', 3: 'name episode 4 reddit'}
type Queries = Record<number, string>;

interface Props {
	// queries: Queries;
	style: CSSProperties;
}

export default function SearchScreen({ style }: Props) {
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
		document.removeEventListener('mousemove', mouseMoveHandler);
		document.removeEventListener('mouseup', mouseUpHandler);
	}

	function scrollBy(amount: number) {
		setYPos((prev) => prev + amount);
		setActiveResult(null);
	}

	return (
		<div
			style={style}
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

	return centerPoint - elCenterPoint;
}
