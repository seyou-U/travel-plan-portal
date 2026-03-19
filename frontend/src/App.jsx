import { TopFooter } from "./components/TopFooter";
import { TopHeader } from "./components/TopHeader";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopHeader/>
      <main>
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
            <div>
              <p className="mb-4 text-xs font-extrabold tracking-[0.14em] text-teal-600 sm:text-sm">
                PERSONALIZED JOURNEY
              </p>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                あなただけの特別な旅をここから。
              </h1>
              <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                AIが提案する旅行プランで、新しい発見に満ちた最高の旅行を。
                <br />
                あなたの好みやスタイルに合わせたパーソナライズ体験を提供します。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-teal-700/20 transition hover:bg-teal-700"
                  type="button"
                >
                  無料で始める
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/15">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1400&q=80"
                alt="日本の寺院と桜のある風景"
              />
            </div>
          </div>
        </section>

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
      </main>
      <TopFooter/>
    </div>
  );
}

export default App;
