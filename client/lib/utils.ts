// utils.ts

/**
 * Conditionally join class names.
 * Similar to the popular `clsx` or `classnames` libraries.
 *
 * Usage:
 *  cn('btn', isActive && 'btn-active', someCondition ? 'text-lg' : 'text-sm')
 *
 * @param {...(string | false | null | undefined)} classes
 * @returns {string} Joined class names
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
