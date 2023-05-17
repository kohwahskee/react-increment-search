import './style.scss';

interface Props {
  icon: string;
  text: string;
  visible?: boolean;
}

export default function HelperText({ icon, text, visible = true }: Props) {
  return (
    <h3 style={{ opacity: visible ? 1 : 0 }}>
      <img src={icon} alt="Helper Icon" className="helper-icon" />
      {text}
    </h3>
  );
}
