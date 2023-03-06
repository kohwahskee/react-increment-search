import { SpringValue, animated } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import './style.scss';

interface Props {
	setActiveResult: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
	scrollSpring: { y: SpringValue<number> };
}

export default function SearchResult({ setActiveResult, scrollSpring }: Props) {
	const searchResultRef = useRef<HTMLDivElement>(null);
	const initialDistanceFromCenter = useRef<number>(0);
	useEffect(() => {
		if (!searchResultRef.current) return;
		const parentEl = searchResultRef.current.parentElement?.parentElement;
		if (!parentEl) return;
		const parentRect = parentEl.getBoundingClientRect();
		const elRect = searchResultRef.current.getBoundingClientRect();
		const centerPoint = parentRect.top + parentRect.height / 2;
		const elCenterPoint = elRect.top + elRect.height / 2;

		// console.log(elCenterPoint);
		initialDistanceFromCenter.current = Math.abs(centerPoint - elCenterPoint);
		searchResultRef.current.style.transform = getScaleFromDistance();
	}, []);

	function getScaleFromDistance(value?: number) {
		console.log(value);
		if (!(searchResultRef.current && searchResultRef.current.parentElement?.parentElement))
			return 'scale(1)';

		const parentEl = searchResultRef.current.parentElement.parentElement;
		const parentRect = parentEl.getBoundingClientRect();
		const elRect = searchResultRef.current.getBoundingClientRect();
		const centerPoint = parentRect.top + parentRect.height / 2;
		const elCenterPoint = elRect.top + elRect.height / 2;
		const distanceFromCenter = Math.abs(centerPoint - elCenterPoint);

		return `scale(${1 - (distanceFromCenter / 1000) * 2})`;
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
