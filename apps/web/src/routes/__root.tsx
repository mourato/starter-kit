/**
 * Root route layout — wraps all pages.
 */
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";

import { APP_NAME } from "@starter/shared/constants";

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-border px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-bg/80 sticky top-0 z-50">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-text font-semibold text-lg no-underline hover:text-accent transition-colors"
                >
                    <NotebookPen className="w-5 h-5 text-accent" />
                    {APP_NAME}
                </Link>

                <nav className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="text-sm text-text-muted hover:text-text transition-colors no-underline [&.active]:text-accent"
                    >
                        Notes
                    </Link>
                </nav>
            </header>

            {/* Page content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-border px-6 py-4 text-center text-xs text-text-dim">
                Built with React · Hono · tRPC · SQLite
            </footer>
        </div>
    );
}
