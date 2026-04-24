import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <div className="text-7xl" aria-hidden>🦆❓</div>
      <h1 className="display-title mt-4 text-4xl text-duck-ink">迷子のアヒルです</h1>
      <p className="mt-2 text-duck-ink/75">このアヒルは池に戻ってしまったようです。</p>
      <Link to="/" className="btn-primary mt-8">ホームへ戻る</Link>
    </section>
  );
}
