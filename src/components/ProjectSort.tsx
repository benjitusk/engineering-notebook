import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * ProjectSort — sort control for the projects listing.
 *
 * The list itself is rendered in publish order and reordered with CSS, keyed
 * off `data-project-sort` on <html> (see ProjectList). This island only sets
 * that attribute and remembers the choice, so the listing still works without
 * JavaScript. The page applies the saved value before paint.
 */
const LABELS = { published: 'Published', updated: 'Last updated' } as const;

type Sort = keyof typeof LABELS;

const STORAGE_KEY = 'project-sort';

export default function ProjectSort() {
    // Start in publish order to match the server-rendered list, then adopt the
    // saved choice. The page's inline script has already applied it to <html>,
    // but read storage too: on a back/forward restore the effect can run before
    // that attribute is set.
    const [sort, setSort] = useState<Sort>('published');

    useEffect(() => {
        let saved: string | null = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch {
            // Storage blocked: fall back to whatever the page applied.
        }
        const current = saved ?? document.documentElement.dataset.projectSort;
        if (current === 'updated') {
            setSort('updated');
            document.documentElement.dataset.projectSort = 'updated';
        }
    }, []);

    const choose = (value: Sort) => {
        setSort(value);
        document.documentElement.dataset.projectSort = value;
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // Private windows and blocked storage: the choice just won't persist.
        }
    };

    return (
        <label className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Sort
            <Select value={sort} onValueChange={(value) => choose(value as Sort)}>
                <SelectTrigger size="sm" aria-label="Sort projects">
                    <SelectValue>{(value: string) => LABELS[value as Sort]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="published">{LABELS.published}</SelectItem>
                    <SelectItem value="updated">{LABELS.updated}</SelectItem>
                </SelectContent>
            </Select>
        </label>
    );
}
