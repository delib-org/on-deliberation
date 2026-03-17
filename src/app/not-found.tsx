import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-20">
      <div className="panel w-full rounded-[2rem] p-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/55">404</p>
        <h1 className="mt-4 text-4xl tracking-tight text-ink">Chapter not found</h1>
        <p className="mt-4 text-base leading-8 text-ink/68">
          The route does not match a published or draft chapter in the current manuscript tree.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-line px-5 py-3 text-sm text-ink/78 transition hover:border-accent hover:text-accent"
        >
          Return to the book index
        </Link>
      </div>
    </main>
  );
}

