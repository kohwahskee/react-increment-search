import './App.css';
import './reset.css';

import Bubble1 from './assets/Bubble 1.svg';
import Bubble2 from './assets/Bubble 2.svg';
import Bubble3 from './assets/Bubble 3.svg';
import Bubble4 from './assets/Bubble 4.svg';
import EnterIcon from './assets/EnterIcon.svg';
import HandIcon from './assets/HandIcon.svg';
import IndicatorBubble from './assets/IndicatorBubble.svg';
import SmallIndicatorBubble from './assets/SmallIndicatorBubble.svg';

import SearchInput from './SearchInput';

function App() {
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

			<SearchInput />
		</div>
	);
}

export default App;
