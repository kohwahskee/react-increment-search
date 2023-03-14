import { SpringValue, animated, useTransition } from '@react-spring/web';
import { Fragment, MouseEvent, useEffect, useRef, useState } from 'react';
import './style.scss';
interface Options {
	numberOfSearches: number;
	startingNumber: 'selected' | '0' | '1';
	resultsPerSearch: number;
}
interface Props {
	transitionAnimation: Record<string, SpringValue<number> | SpringValue<string>>;
	options: Options;
	setOptions: React.Dispatch<React.SetStateAction<Options>>;
}

interface SelectOptionConfigs {
	optionName: string;
	options: string[];
	setOptionValue: (value: number | string) => void;
}

export default function OptionScreen({ transitionAnimation, options, setOptions }: Props) {
	const [activeOption, setActiveOption] = useState<
		'numberOfSearches' | 'startingNumber' | 'resultsPerSearch' | null
	>(null);
	const optionScreenRef = useRef<HTMLDivElement>(null);

	const resultsPerSearchConfigs = {
		optionName: 'Results per search',
		options: ['1', '2', '3', '4'],
		setOptionValue: (value: number | string) => {
			setOptions((prev) => ({ ...prev, resultsPerSearch: Number(value) }));
		},
	};

	const startingNumberConfigs = {
		optionName: 'Starting number',
		options: ['selected', '0', '1'],
		setOptionValue: (value: string | number) => {
			setOptions((prev) => ({ ...prev, startingNumber: value as 'selected' | '0' | '1' }));
		},
	};

	function parseNOfSearchValue(value: string): number {
		const MAX_NUMBER_OF_SEARCHES = 24;
		const tempValue = Number(value);
		let parsedValue: number = tempValue;
		if (isNaN(tempValue)) parsedValue = 24;
		if (tempValue < 1) parsedValue = 1;
		else if (tempValue > MAX_NUMBER_OF_SEARCHES) parsedValue = 24;
		return parsedValue;
	}

	useEffect(() => {
		optionScreenRef.current?.focus();
	}, []);
	return (
		<animated.div
			ref={optionScreenRef}
			onClick={(e) => {
				e.currentTarget.focus();
				setActiveOption(null);
			}}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === '/') {
					e.preventDefault();
					e.stopPropagation();
				}
			}}
			tabIndex={0}
			style={transitionAnimation}
			className='option-screen'>
			<div className='option-container'>
				<InputOption
					key={'numberOfSearches'}
					optionName='Number of searches'
					parsedValue={options.numberOfSearches.toString()}
					setOptionValue={(value: string) => {
						setOptions((prev) => ({ ...prev, numberOfSearches: parseNOfSearchValue(value) }));
					}}
				/>
				<SelectOption
					setSelected={setActiveOption}
					isSelected={activeOption === 'startingNumber'}
					currentValue={options.startingNumber.toString()}
					configs={startingNumberConfigs}
				/>
				<SelectOption
					setSelected={setActiveOption}
					isSelected={activeOption === 'resultsPerSearch'}
					currentValue={options.resultsPerSearch.toString()}
					configs={resultsPerSearchConfigs}
				/>
			</div>
		</animated.div>
	);
}

interface InputOptionProps {
	optionName: string;
	parsedValue: string;
	setOptionValue: (value: string) => void;
}

function InputOption({ optionName, parsedValue, setOptionValue }: InputOptionProps) {
	const [value, setValue] = useState(parsedValue);
	const [hasParsedValueChanged, setHasParsedValueChanged] = useState(false);

	useEffect(() => {
		if (!hasParsedValueChanged) {
			setValue(parsedValue);
		} else {
			setHasParsedValueChanged(false);
		}
	}, [parsedValue, hasParsedValueChanged]);

	const handleBlur = () => {
		setOptionValue(value);
		setHasParsedValueChanged(true);
	};

	return (
		<div className='option'>
			<h3 className='option-name'>{optionName}</h3>
			<input
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => {
					if (e.key === 'Enter') e.currentTarget.blur();
				}}
				onChange={(e) => setValue(e.currentTarget.value)}
				onBlur={handleBlur}
				type='text'
				value={value}
				className='option-box'
			/>
		</div>
	);
}

interface SelectOptionProps {
	isSelected: boolean;
	setSelected: React.Dispatch<
		React.SetStateAction<'numberOfSearches' | 'startingNumber' | 'resultsPerSearch' | null>
	>;
	currentValue: string;
	configs: SelectOptionConfigs;
}
function SelectOption({
	configs: { optionName, options, setOptionValue },
	currentValue,
	setSelected,
	isSelected,
}: SelectOptionProps) {
	const optionTransition = useTransition(isSelected, {
		from: { opacity: 0.5, transform: 'translate(-20%, -50%)', scaleY: 0 },
		enter: { opacity: 1, transform: 'translate(0%, -50%)', scaleY: 1 },
		leave: { opacity: 0, transform: 'translate(-20%, -50%)', scaleY: 0 },
		config: {
			mass: 1,
			tension: 400,
			friction: 20,
		},
	});
	function selectableOnClick(e: MouseEvent) {
		e.stopPropagation();
		setOptionValue(e.currentTarget.textContent ?? '');
		setSelected(null);
	}

	function optionBoxOnClick(e: MouseEvent) {
		e.stopPropagation();

		switch (optionName) {
			case 'Results per search':
				setSelected('resultsPerSearch');
				break;
			case 'Starting number':
				setSelected('startingNumber');
				break;
			default:
				throw new Error('Invalid option name');
		}
	}

	return (
		<div className='option'>
			<h3 className='option-name'>{optionName}</h3>
			<div
				onClick={optionBoxOnClick}
				className='option-box'>
				{currentValue}
				{optionTransition(
					(style, show) =>
						show && (
							<animated.div
								style={style}
								className='selectable-options-container'>
								{options.map((option, i) => (
									<Fragment key={option}>
										<div
											onClick={selectableOnClick}
											className='selectable-option'>
											{option}
										</div>
										{i !== options.length - 1 && <div className='option-divider' />}
									</Fragment>
								))}
							</animated.div>
						)
				)}
			</div>
		</div>
	);
}
