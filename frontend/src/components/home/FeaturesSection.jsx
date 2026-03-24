export function FeaturesSection() {
  return (
    <section className="pb-16 pt-4 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black sm:text-4xl">Travel Plan Portalの特徴</h2>
        <p className="mt-4 max-w-4xl text-base leading-relaxed text-slate-600 sm:text-lg">
          洗練されたインターフェースとAIによる旅程提案。あなたの旅をより豊かに、よりスムーズにサポートします。
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-600">
              ★
            </div>
            <h3 className="mt-4 text-xl font-extrabold">AIによる旅程提案</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              利用者の好みや旅行スタイルに合わせた最適な旅程をAIが提案します。
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-600">
              ✎
            </div>
            <h3 className="mt-4 text-xl font-extrabold">カスタマイズ自在</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              旅程の追加や変更も自由自在。あなたのわがままを形にできます。
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-600">
              ◉
            </div>
            <h3 className="mt-4 text-xl font-extrabold">プラン共有</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              作成した旅行プランを友達や家族と簡単に共有できます。
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
