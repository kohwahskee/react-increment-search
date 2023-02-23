import './App.scss';
import './reset.css';
import { useState } from 'react';
import Bubble1 from './assets/Bubble 1.svg';
import Bubble2 from './assets/Bubble 2.svg';
import Bubble3 from './assets/Bubble 3.svg';
import Bubble4 from './assets/Bubble 4.svg';
import RichInput from './components/RichInput/RichInput';
import ShortcutHelpers from './components/ShortcutHelpers/ShortcutHelpers';
import { InputState } from './components/Utils/TypesExport';
interface SearchQuery {
	firstHalf: string;
	secondHalf: string;
	incrementable: number | null;
}

function App() {
	const [inputState, setInputState] = useState<InputState>(null);
	const [inputValue, setInputValue] = useState('');
	const [searchQuery, setSearchQuery] = useState<SearchQuery>({
		firstHalf: '',
		secondHalf: '',
		incrementable: null,
	});
	return (
		<div className='App'>
			<div className='bubble-container'>
				<img
					src={Bubble1}
					className='bubble-decor'
					id='bubble1'
				/>
				<img
					src={Bubble2}
					className='bubble-decor'
					id='bubble2'
				/>
				<img
					src={Bubble3}
					className='bubble-decor'
					id='bubble3'
				/>
				<img
					src={Bubble4}
					className='bubble-decor'
					id='bubble4'
				/>
				<div className='darken-bg' />
			</div>
			<RichInput
				inputValue={[inputValue, setInputValue]}
				inputState={[inputState, setInputState]}
				setSearchQuery={setSearchQuery}
			/>
			<ShortcutHelpers inputState={inputState} />
			<div className='enter-icon'>Enter</div>
		</div>
	);
}

export default App;
