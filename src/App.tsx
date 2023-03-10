import './App.scss';
import './reset.css';
import { animated, useTransition } from '@react-spring/web';
import { useState } from 'react';
import RichInput from './components/RichInput/RichInput';
import SearchScreen from './components/SearchScreen/SearchScreen';
import ShortcutHelpers from './components/ShortcutHelpers/ShortcutHelpers';
import { InputState } from './components/Utils/TypesExport';

interface SearchQuery {
	firstHalf: string;
	secondHalf: string;
	incrementable: number;
}

function App() {
	const [inputState, setInputState] = useState<InputState>(null);
	const [inputValue, setInputValue] = useState('');
	const [optionShown, setOptionShown] = useState(false);
	const [searchQuery, setSearchQuery] = useState<SearchQuery>({
		firstHalf: '',
		secondHalf: '',
		incrementable: NaN,
	});
	const searchScreenTransition = useTransition(inputState === 'FINISHED', {
		from: { transform: 'translate3d(-50%, 0%, 0)', opacity: 0 },
		enter: { transform: 'translate3d(-50%, 0%, 0)', opacity: 1 },
		leave: { transform: 'translate3d(-50%, 20%, 0)', opacity: 0 },
	});

	const AnimatedSearchScreen = animated(SearchScreen);

	return (
		<div className='App'>
			<div className='circle-container'>
				<div className={`pink-circle ${inputState === 'FINISHED' ? 'finished' : ''}`} />
				<div className={`purple-circle ${inputState === 'FINISHED' ? 'finished' : ''}`} />
				<div className={`red-circle ${inputState === 'FINISHED' ? 'finished' : ''}`} />
			</div>

			<RichInput
				inputValue={[inputValue, setInputValue]}
				inputState={[inputState, setInputState]}
				setSearchQuery={setSearchQuery}
			/>

			<button
				onClick={() => setOptionShown((prev) => !prev)}
				className='option-button'>
				{optionShown ? 'Back' : 'Options'}
			</button>

			{inputState !== 'FINISHED' && <ShortcutHelpers inputState={inputState} />}

			{searchScreenTransition((style, show) => show && <AnimatedSearchScreen style={style} />)}
		</div>
	);
}

export default App;
