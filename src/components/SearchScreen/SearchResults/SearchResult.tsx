import { SpringValue, animated, useSpringValue, easings } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import './style.scss';

interface Props {
	setActiveResult: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
	yPos: number;
}

export default function SearchResult({ setActiveResult, yPos }: Props) {
	const searchResultRef = useRef<HTMLDivElement>(null);
	const parentRectRef = useRef<DOMRect>();
	const [scale, setScale] = useState(1);
	const initialCenterPoint = useRef(0);
	const scaleAnimation = useSpringValue(scale);

	useEffect(() => {
		if (!searchResultRef.current) return;
		const elRect = searchResultRef.current.getBoundingClientRect();
		parentRectRef.current =
			searchResultRef.current.parentElement?.parentElement?.getBoundingClientRect();
		const elCenterPoint = elRect.top + elRect.height / 2;
		initialCenterPoint.current = elCenterPoint;
	}, []);

	useEffect(() => {
		if (!searchResultRef.current || !parentRectRef.current) return;
		setScale(
			getScaleFromDistance(
				searchResultRef.current,
				yPos,
				initialCenterPoint.current,
				parentRectRef.current
			)
		);
	}, [yPos]);

	useEffect(() => {
		scaleAnimation.start(scale, {
			config: {
				mass: 1,
				tension: 200,
				friction: 20,
			},
		});
	}, [scale, scaleAnimation]);

	return (
		<animated.div
			className='search-result'
			style={{ transform: scaleAnimation.to((value) => `scale3d(${value},${value},1)`) }}
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

function getScaleFromDistance(
	el: HTMLElement,
	yPos: number,
	initialCenterPoint: number,
	parentRect: DOMRect
) {
	if (!el.parentElement?.parentElement) return 1;

	const centerPoint = parentRect.top + parentRect.height / 2;
	const elCenterPoint = initialCenterPoint + yPos;
	const distanceFromCenter = Math.abs(centerPoint - elCenterPoint);

	if (elCenterPoint < parentRect.top || elCenterPoint > parentRect.bottom) return 0;

	return Math.max(0, Math.min(1, 1 - Math.pow(0.003 * distanceFromCenter, 2)));
	// return Math.max(0, Math.min(1, 1 - (distanceFromCenter / 1000) * 2));
}
