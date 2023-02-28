import EnterIcon from '../../assets/EnterIcon.svg';
import HelperText from './HelperText/HelperText';
import HandIcon from '../../assets/HandIcon.svg';
import SlashIcon from '../../assets/SlashIcon.svg';
import './style.scss';

type InputState = null | 'TYPING' | 'SELECTING' | 'FINISHED';

interface Props {
	inputState: InputState;
}

export default function ShortcutHelpers({ inputState }: Props) {
	return (
		<div className='shortcut-helpers'>
			<HelperText
				icon={SlashIcon}
				text={'to edit text'}
				visible={inputState === 'SELECTING'}
			/>
			<HelperText
				icon={EnterIcon}
				text={inputState === 'TYPING' ? 'to confirm' : 'to search'}
				visible={true}
			/>
		</div>
	);
}
