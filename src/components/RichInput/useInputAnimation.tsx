import { useSpring } from '@react-spring/web';
import { useEffect } from 'react';
import { InputState } from '../Utils/TypesExport';

export default function useInputAnimation(inputState: InputState) {
	const [containerSpring, containerSpringAPI] = useSpring(() => ({}));
	useEffect(() => {
		if (inputState === 'FINISHED') {
			containerSpringAPI.start({
				to: { transform: 'translate(0%, 0%) scale(0.4)', top: `5%`, left: `18%` },
				config: {
					mass: 1,
					tension: 400,
					friction: 30,
				},
			});
		} else if (inputState === 'TYPING') {
			containerSpringAPI.start({
				to: { transform: 'translate(-50%, -50%) scale(1)', top: `50%`, left: `50%` },
			});
		}
	}, [containerSpringAPI, inputState]);

	return containerSpring;
}
