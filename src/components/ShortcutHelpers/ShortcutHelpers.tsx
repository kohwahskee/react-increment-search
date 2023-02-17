import EnterIcon from '../../assets/EnterIcon.svg';
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
			<h3 style={{ opacity: inputState === 'SELECTING' ? 1 : 0 }}>
				<img
					src={SlashIcon}
					alt='Slash Button Icon'
					className='slash-icon helper-icon'
				/>
				to edit text
			</h3>
			<h3>
				<img
					src={EnterIcon}
					alt='Enter Button Icon'
					className='enter-icon helper-icon'
				/>
				to confirm search
			</h3>
		</div>
	);
}
