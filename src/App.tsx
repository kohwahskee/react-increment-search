import './App.scss';
import './reset.css';
import { useTransition } from '@react-spring/web';
import { useEffect, useMemo, useState } from 'react';
import OptionScreen from './components/OptionScreen/OptionScreen';
import RichInput from './components/RichInput/RichInput';
import SearchScreen from './components/SearchScreen/SearchScreen';
import ShortcutHelpers from './components/ShortcutHelpers/ShortcutHelpers';
import { InputState, ResultResponse } from './components/Utils/TypesExport';

interface SearchQuery {
	firstHalf: string;
	secondHalf: string;
	incrementable: number;
}

interface Options {
	numberOfSearches: number;
	startingNumber: 'selected' | '0' | '1';
	resultsPerSearch: number;
}

type QueriesMap = Map<number, { title: string; url: string }[]>;

function App() {
	const [inputState, setInputState] = useState<InputState>(null);
	const [inputValue, setInputValue] = useState('');
	const [optionShown, setOptionShown] = useState(false);
	const [generatedQueries, setGeneratedQueries] = useState<QueriesMap>(new Map());

	const [searchQuery, setSearchQuery] = useState<SearchQuery>({
		firstHalf: '',
		secondHalf: '',
		incrementable: NaN,
	});
	const [options, setOptions] = useState<Options>({
		numberOfSearches: 10,
		startingNumber: 'selected',
		resultsPerSearch: 2,
	});

	const placeholderMap = useMemo(() => {
		const tempMap = new Map();
		for (let i = 0; i < options.numberOfSearches; i++) {
			tempMap.set(i, [{ title: 'loading...', url: '' }]);
		}
		return tempMap;
	}, [options.numberOfSearches]);

	const searchScreenTransition = useTransition(inputState === 'FINISHED', {
		from: { transform: 'translate3d(-50%, 0%, 0)', opacity: 0 },
		enter: { transform: 'translate3d(-50%, 0%, 0)', opacity: 1 },
		leave: { transform: 'translate3d(-50%, 20%, 0)', opacity: 0 },
	});

	const optionScreenTransition = useTransition(optionShown, {
		from: { translateY: '-100%' },
		enter: { translateY: '0%' },
		leave: { translateY: '-100%' },
		config: {
			mass: 1,
			tension: 500,
			friction: 40,
			clamp: !optionShown,
		},
	});

	useEffect(() => {
		if (optionShown) {
			document.addEventListener('keydown', keyDownHandler);
		}

		function keyDownHandler(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				setOptionShown(false);
			}
		}

		return () => {
			document.removeEventListener('keydown', keyDownHandler);
		};
	}, [optionShown]);

	useEffect(() => {
		if (inputState === 'FINISHED') {
			// setGeneratedQueries(new Map().set(1, [{ title: 'sdf', url: 'sfd' }]));
			setOptionShown(false);
			const queries: QueriesMap = new Map();
			const fetchPromises = [];
			const { numberOfSearches, resultsPerSearch } = options;
			const startingNumber =
				options.startingNumber === 'selected'
					? searchQuery.incrementable
					: options.startingNumber === '0'
					? 0
					: 1;

			for (let i = startingNumber; i < numberOfSearches + startingNumber; i++) {
				fetchPromises.push(fetch('https://run.mocky.io/v3/3f2eb76c-6b19-434e-ac11-79ed41b139d6'));
				for (let j = 0; j < resultsPerSearch; j++) {
					// searchesPerQuery.push({ title: query, url: 'https://www.reddit.com/r/...' });
				}
				// queries.set(i, searchesPerQuery);
			}
			// TODO:
			// 1. Make sure that the queries index are correct
			// 2. Make sure to only fetch when queries change

			console.log(fetchPromises.length);
			Promise.all(fetchPromises).then(async (res) => {
				res.forEach((promise, i) => {
					promise.json().then((json: ResultResponse) => {
						const [{ title, link }] = json.items;
						const shortenedTitle = title.length > 40 ? title.slice(0, 40) + '...' : title;
						queries.set(i, [{ title: shortenedTitle, url: link }]);
						setGeneratedQueries(queries);
					});
				});
			});
		}
	}, [inputState, options, placeholderMap, searchQuery]);

	useEffect(() => {
		setGeneratedQueries(placeholderMap);
	}, [options.numberOfSearches, placeholderMap]);

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

			{inputState !== 'FINISHED' && <ShortcutHelpers inputState={inputState} />}

			{searchScreenTransition(
				(style, show) =>
					show && (
						<SearchScreen
							generatedQueries={generatedQueries}
							transitionAnimation={style}
						/>
					)
			)}

			{optionScreenTransition(
				(style, show) =>
					show && (
						<OptionScreen
							transitionAnimation={style}
							options={options}
							setOptions={setOptions}
						/>
					)
			)}

			{inputState !== 'FINISHED' && (
				<button
					onClick={() => setOptionShown((prev) => !prev)}
					className={`option-button ${optionShown ? 'option-shown' : ''}`}>
					{optionShown ? 'Back' : 'Options'}
				</button>
			)}
		</div>
	);
}

export default App;
