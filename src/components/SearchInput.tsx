import { FormEvent, useEffect, useRef, useState } from 'react';
import './style-searchInput.scss';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';

export default function SearchInput() {
	const INPUT_PLACEHOLDER = 'Search here...';
	const [searchInput, setSearchInput] = useState('');
	const richInputRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!richInputRef.current) return;

		// contentEditable will add <br> when empty
		if (searchInput === '<br>') {
			setSearchInput('');
			richInputRef.current.innerHTML = '';
		}
	}, [searchInput]);

	return (
		<div
			onClick={() => {
				if (!richInputRef.current) return;
				richInputRef.current.focus();
			}}
			className='input-container'>
			<span
				style={{
					color: searchInput === '' ? 'rgba(255,255,255,.5)' : 'transparent',
					userSelect: 'none',
					pointerEvents: 'none',
				}}
				id='input-placeholder'>
				{INPUT_PLACEHOLDER}
			</span>

			<div
				id='rich-search-input'
				contentEditable
				suppressContentEditableWarning
				ref={richInputRef}
				style={{ color: 'rgba(255,255,255, 0.1)' }}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
					}
				}}
				onInput={(e: FormEvent) => {
					const words = (e.target as HTMLDivElement).innerText.split(' ');
					const spans = words.map((word) => `<span class='text-span'>${word}</span>`);
					setSearchInput(spans.join(''));
				}}
				dangerouslySetInnerHTML={{ __html: searchInput }}
			/>

			{/* <div className='text-container'>{generateText()}</div> */}
		</div>
	);
}

function generateTextSpan(textInput: string) {
	const text = textInput.split(' ');
	const textElements = text.map((word) => (
		<span
			className='text-span'
			key={uuidv4()}>
			{word}
		</span>
	));
	return textElements;
}
