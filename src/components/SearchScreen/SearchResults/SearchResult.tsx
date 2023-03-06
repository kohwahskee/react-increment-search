import { SpringValue, animated } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import './style.scss';

interface Props {
	setActiveResult: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
	scrollSpring: { y: SpringValue<number> };
}

export default function SearchResult({ setActiveResult, scrollSpring }: Props) {
	const searchResultRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!searchResultRef.current) return;
		searchResultRef.current.style.transform = getScaleFromDistance();
	}, []);

	function getScaleFromDistance() {
		if (!(searchResultRef.current && searchResultRef.current.parentElement?.parentElement))
			return 'scale(1)';

		const parentEl = searchResultRef.current.parentElement.parentElement;
		const parentRect = parentEl.getBoundingClientRect();
		const elRect = searchResultRef.current.getBoundingClientRect();
		const centerPoint = parentRect.top + parentRect.height / 2;
		const elCenterPoint = elRect.top + elRect.height / 2;
		const distanceFromCenter = Math.abs(centerPoint - elCenterPoint);

		if (elCenterPoint < parentRect.top || elCenterPoint > parentRect.bottom) return 'scale(0)';

		return `scale(${Math.max(0, Math.min(1, 1 - Math.pow(0.003 * distanceFromCenter, 2)))})`;
	}

	return (
		<animated.div
			className='search-result'
			style={{
				transform: scrollSpring.y.to(getScaleFromDistance),
			}}
			ref={searchResultRef}>
			<div className='search-result-content'>
				<h1 className='search-index-number'>123</h1>
				<a onClick={() => setActiveResult(searchResultRef.current)}>
					Lorem ipsum dolor sit amet consectetur adipisicing.
				</a>
				<a onClick={() => setActiveResult(searchResultRef.current)}>
					Lorem ipsum dolor sit amet consectetur adipisicing elit.
				</a>
			</div>
		</animated.div>
	);
}
