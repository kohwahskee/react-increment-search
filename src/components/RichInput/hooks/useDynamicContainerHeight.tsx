import { useEffect } from 'react';

export default function useDynamicContainerHeight(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  inputRef: React.MutableRefObject<HTMLDivElement | null>,
  inputValue: string
) {
  useEffect(() => {
    if (!containerRef.current || !inputRef.current) return;
    containerRef.current.style.height = `${inputRef.current.offsetHeight}px`;
  }, [containerRef, inputRef, inputValue]);
}
