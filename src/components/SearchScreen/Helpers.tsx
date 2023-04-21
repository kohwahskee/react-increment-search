export function getDistanceFromCenter(el: HTMLElement, parentEl: HTMLElement) {
  const { top: parentTop, height: parentHeight } =
    parentEl.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const centerPoint = parentTop + parentHeight / 2;
  const elCenterPoint = elRect.top + elRect.height / 2;
  return Math.abs(centerPoint - elCenterPoint);
}

export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export function isElInView(parentEl: HTMLElement, el: HTMLElement) {
  const elRect = el.getBoundingClientRect();
  const { top, bottom } = parentEl.getBoundingClientRect();
  const { top: elTop, bottom: elBottom } = elRect;
  return elTop >= top && elBottom <= bottom;
}
