# Project Patterns

Starter examples for Next.js App Router + TypeScript + Tailwind. Replace these
with real examples from this project. Paths are relative to the frontend.
Use the project's token-backed utilities; spacing below uses standard utilities.

## Page (`app/example/page.tsx` or `src/app/example/page.tsx`)
Use when: adding a server-rendered route with a collection.

```tsx
import { listItems } from './api';
import { ItemList } from './item-list';

export default async function Page() {
  const items = await listItems();
  return <main className="space-y-4 p-6">
    <h1>Items</h1>
    <ItemList items={items} />
  </main>;
}
```

## Form with Validation (`email-form.tsx`)
Use when: collecting input with native validation and explicit submission state.
Always validate and authorize again on the backend.

```tsx
'use client';
import { useState, type FormEvent } from 'react';

export function EmailForm({ save }: { save: (email: string) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    if (!email) { setMessage('Email is required.'); return; }
    setBusy(true); setMessage('');
    try { await save(email); setMessage('Saved.'); }
    catch { setMessage('Could not save. Please try again.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
    <label>Email <input name="email" type="email" required disabled={busy} /></label>
    <button disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    <p role="status">{message}</p>
  </form>;
}
```

## Data List (`item-list.tsx`)
Use when: showing a collection with a clear empty state and stable keys.

```tsx
export type Item = { id: string; name: string };

export function ItemList({ items }: { items: Item[] }) {
  if (!items.length) return <p>No items yet.</p>;
  return <ul className="space-y-2">
    {items.map(item => <li key={item.id}>{item.name}</li>)}
  </ul>;
}
```

## API Wrapper (`api.ts`)
Use when: fetching backend data from server code with an explicit response check.
Replace the example endpoint and shape with the documented API contract.

```ts
import 'server-only';
import type { Item } from './item-list';

export async function listItems(): Promise<Item[]> {
  const base = process.env.API_BASE_URL;
  if (!base) throw new Error('API_BASE_URL is not configured');
  const response = await fetch(new URL('/api/items', base), { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load items');
  const body: unknown = await response.json();
  if (!Array.isArray(body) || !body.every(item =>
    item && typeof item.id === 'string' && typeof item.name === 'string')) {
    throw new Error('Unexpected items response');
  }
  return body as Item[];
}
```

## Loading (`loading.tsx`)
Use when: a route suspends while fetching data.

```tsx
export default function Loading() {
  return <p role="status">Loading items…</p>;
}
```

## Error (`error.tsx`)
Use when: a route needs a recoverable error boundary without exposing internals.

```tsx
'use client';
export default function ErrorState({ reset }: { reset: () => void }) {
  return <section role="alert" className="space-y-4">
    <p>Could not load items.</p>
    <button onClick={reset}>Try again</button>
  </section>;
}
```
