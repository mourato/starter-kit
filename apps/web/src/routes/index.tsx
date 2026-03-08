/**
 * Home page — Notes list with create/edit/delete.
 *
 * Demonstrates: tRPC v11 + TanStack Query + Zustand + micro-animations.
 */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X, Check, FileText } from "lucide-react";

import { formatRelativeTime } from "@starter/shared/formatting";

import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    // ---------------------------------------------------------------------------
    // Queries & Mutations
    // ---------------------------------------------------------------------------

    const { data: notes, isLoading } = useQuery(trpc.notes.list.queryOptions());

    const createMutation = useMutation(
        trpc.notes.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.notes.list.queryFilter());
                setNewTitle("");
                setNewContent("");
                setIsCreating(false);
            },
        }),
    );

    const updateMutation = useMutation(
        trpc.notes.update.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.notes.list.queryFilter());
                setEditingId(null);
            },
        }),
    );

    const deleteMutation = useMutation(
        trpc.notes.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.notes.list.queryFilter());
            },
        }),
    );

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------

    function handleCreate() {
        if (!newTitle.trim()) return;
        createMutation.mutate({ title: newTitle.trim(), content: newContent.trim() });
    }

    function handleUpdate(id: number) {
        if (!editTitle.trim()) return;
        updateMutation.mutate({ id, title: editTitle.trim(), content: editContent.trim() });
    }

    function startEditing(note: { id: number; title: string; content: string }) {
        setEditingId(note.id);
        setEditTitle(note.title);
        setEditContent(note.content);
    }

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            {/* Page header */}
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold text-text">Notes</h1>
                    <p className="text-text-muted text-sm mt-1">
                        {notes?.length ?? 0} note{notes?.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    id="create-note-button"
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.97] cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>
            </div>

            {/* Create form */}
            {isCreating && (
                <div className="mb-6 p-4 bg-bg-card border border-border rounded-xl animate-slide-up">
                    <input
                        id="new-note-title"
                        type="text"
                        placeholder="Note title…"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none transition-colors mb-3"
                        autoFocus
                    />
                    <textarea
                        id="new-note-content"
                        placeholder="Write something…"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        rows={3}
                        className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none transition-colors resize-none mb-3"
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-3 py-1.5 text-sm text-text-muted hover:text-text rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            id="save-new-note"
                            onClick={handleCreate}
                            disabled={createMutation.isPending || !newTitle.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5" />
                            {createMutation.isPending ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="flex items-center justify-center py-20 text-text-muted">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="ml-3 text-sm">Loading notes…</span>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && notes?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-text-muted animate-fade-in">
                    <FileText className="w-12 h-12 mb-4 text-text-dim" />
                    <p className="text-base font-medium mb-1">No notes yet</p>
                    <p className="text-sm text-text-dim">Create your first note to get started.</p>
                </div>
            )}

            {/* Notes list */}
            <div className="space-y-3">
                {notes?.map((note, index) => (
                    <div
                        key={note.id}
                        className="group p-4 bg-bg-card border border-border rounded-xl hover:border-accent/30 transition-all duration-200 animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {editingId === note.id ? (
                            /* Edit mode */
                            <div>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(note.id)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none transition-colors mb-2"
                                    autoFocus
                                />
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={3}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none transition-colors resize-none mb-2"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="px-3 py-1.5 text-sm text-text-muted hover:text-text rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleUpdate(note.id)}
                                        disabled={updateMutation.isPending}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View mode */
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-text truncate">{note.title}</h3>
                                        {note.content && (
                                            <p className="text-xs text-text-muted mt-1 line-clamp-2">{note.content}</p>
                                        )}
                                        <p className="text-xs text-text-dim mt-2">
                                            {formatRelativeTime(note.updatedAt)}
                                        </p>
                                    </div>

                                    {/* Actions — visible on hover */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                                        <button
                                            id={`edit-note-${note.id}`}
                                            onClick={() => startEditing(note)}
                                            className="p-1.5 rounded-md hover:bg-bg-hover text-text-dim hover:text-text transition-colors cursor-pointer"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            id={`delete-note-${note.id}`}
                                            onClick={() => deleteMutation.mutate({ id: note.id })}
                                            className="p-1.5 rounded-md hover:bg-danger/10 text-text-dim hover:text-danger transition-colors cursor-pointer"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
