import { SpringValue } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import './style.scss';

interface Props {
	setActiveResult: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
	scrollSpring: { y: SpringValue<number> };
}

export default function SearchResult({ setActiveResult, scrollSpring }: Props) {
	const searchResultRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);
	const [opacity, setOpacity] = useState(1);
	const previousCenterPoint = useRef(0);

	useEffect(() => {
		if (!searchResultRef.current) return;
		previousCenterPoint.current =
			searchResultRef.current?.getBoundingClientRect().top +
			searchResultRef.current?.getBoundingClientRect().height / 2;
	}, []);

	useEffect(() => {
		console.log('rendered');
		if (!(searchResultRef.current && searchResultRef.current.parentElement?.parentElement)) return;

		const parentEl = searchResultRef.current.parentElement.parentElement;
		const parentRect = parentEl.getBoundingClientRect();
		const elRect = searchResultRef.current.getBoundingClientRect();
		const centerPoint = parentRect.top + parentRect.height / 2;
		const elCenterPoint = elRect.top + elRect.height / 2;

		const distanceFromCenter = Math.abs(centerPoint - elCenterPoint);

		if (elCenterPoint !== previousCenterPoint.current) {
			setScale(1 - (distanceFromCenter / 1000) * 1.5);
			// setOpacity(1 - (distanceFromCenter / 1000) * 3);
		}
		previousCenterPoint.current = elCenterPoint;
	}, [scrollSpring]);

	return (
		<div
			className='search-result'
			style={{ transform: `scale(${scale})`, opacity: opacity }}
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
		</div>
	);
}
