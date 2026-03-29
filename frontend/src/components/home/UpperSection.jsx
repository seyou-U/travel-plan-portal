import top from '../../assets/top.png';

export function UpperSection() {
  return (
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
          <img className="h-full w-full object-cover" src={top} alt="TopSection画像" />
        </div>
      </div>
    </section>
  );
}
