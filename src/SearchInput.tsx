import { useState } from 'react';

export default function SearchInput() {
	const [searchInput, setSearchInput] = useState('');
	function generateText() {
		const text = searchInput.split('');
		const textElements = text.map((word, i) => {
			if (word === ' ') return <span key={i}>&nbsp;</span>;
			return <span key={i}>{word}</span>;
		});
		return textElements;
	}

	return (
		<div className='input-container'>
			<input
				id='search-input'
				placeholder='Let me help you...'
				onInput={(e) => setSearchInput(e.currentTarget.value)}
				value={searchInput}
			/>
			<div className='text-container'>
				{generateText()}
				{/* <span>Test</span>
				<span> </span>
				<span>Test</span> */}
			</div>
		</div>
	);
}
