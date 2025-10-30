/* eslint-disable prettier/prettier */

/**
 * A utility class that provides smooth scrolling functionality with easing effects.
 *
 * @example
 * Used in FloatingEditor component to provide smooth scrolling animations when the editor expands/collapses:
 * - Scrolls to bottom when the editor expands
 * - Scrolls to top when the editor collapses
 *
 * ```typescript
 * // In FloatingEditor.tsx
 * if (isExpanded) {
 *   SmoothScroll.scroll(editor.root, editor.root.scrollHeight, 500); // Scroll to bottom
 * } else {
 *   SmoothScroll.scroll(editor.root, 0, 500); // Scroll to top
 * }
 * ```
 */
class SmoothScroll {
  /**
   * Calculates the easing value using quadratic in-out function.
   * @param t - Current time
   * @param b - Start value
   * @param c - Change in value
   * @param d - Duration
   * @returns {number} The calculated easing value
   */
  static easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b; //prettier-ignore
    t--;
    return (-c / 2) * (t * (t - 2)) - 1 + b; //prettier-ignore
  }

  /**
   * Smoothly scrolls an element to a target position over a specified duration.
   * @param element - The HTML element to scroll
   * @param target - The target scroll position
   * @param duration - The duration of the scroll animation in milliseconds
   */
  static scroll(element: HTMLElement, target: number, duration: number): void {
    const start = element.scrollTop;
    const change = target - start;
    const increment = 2; // Decrease the increment value for slower scrolling
    let currentTime = 0;

    const animateScroll = () => {
      currentTime += increment;
      const val = SmoothScroll.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };

    animateScroll();
  }
}

export default SmoothScroll;
