/**
 * Formatting utilities shared between server and web.
 *
 * @module Formatting
 */

/**
 * Format a date string into a human-readable relative time.
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1)}…`;
}
