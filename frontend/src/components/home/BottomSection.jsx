export function BottomSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-3xl font-black sm:text-5xl">最高の旅のパートナーとして。</h2>
        <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:text-lg">
          今すぐ登録して、あなただけの特別なトラベルプランを作成しましょう。
        </p>
        <button
          className="mt-8 rounded-full bg-teal-600 px-10 py-3 text-base font-bold text-white shadow-xl shadow-teal-700/20 transition hover:bg-teal-700"
          type="button"
        >
          無料で始める
        </button>
      </div>
    </section>
  );
}
