import HelperText from './HelperText/HelperText';
import DragIcon from '../../assets/DragIndicator.svg';
import EnterIcon from '../../assets/EnterIcon.svg';
import NoNumbersIcon from '../../assets/NoNumbersIcon.svg';
import SlashIcon from '../../assets/SlashIcon.svg';
import './style.scss';

type InputState = null | 'TYPING' | 'SELECTING' | 'FINISHED';

interface Props {
  inputValue: string;
  inputState: InputState;
}

export default function ShortcutHelpers({ inputState, inputValue }: Props) {
  const numbersInQuery =
    inputValue.match(/(?<!\S)\d+(?!\S)/g)?.map((word) => Number(word)) ?? [];

  return (
    <div className="shortcut-helpers">
      {numbersInQuery.length >= 2 && (
        <HelperText
          text="Drag and drop bubble on the desired number"
          icon={DragIcon}
        />
      )}
      <HelperText
        icon={SlashIcon}
        text="to edit text"
        visible={inputState === 'SELECTING'}
      />
      <HelperText
        icon={
          inputState === 'TYPING'
            ? EnterIcon
            : numbersInQuery.length > 0 && inputState === 'SELECTING'
            ? EnterIcon
            : NoNumbersIcon
        }
        text={
          inputState === 'TYPING'
            ? 'to confirm '
            : numbersInQuery.length > 0 && inputState === 'SELECTING'
            ? 'to search'
            : 'No number was found'
        }
        visible
      />
    </div>
  );
}
