'use client';
import { generateDocument } from '@/components/doc-generation/patch';

export default function Home() {
  return (
    <main className="flex items-center">
      <button onClick={() => generateDocument()}>Generate Word document</button>
    </main>
  );
}
