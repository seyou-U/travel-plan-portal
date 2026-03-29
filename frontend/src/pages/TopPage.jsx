const DAYS = ['DAY 1', 'DAY 2', 'DAY 3', 'DAY 4'];

const TIMELINE = [
  {
    time: '09:00',
    title: '福岡空港到着',
    window: '09:00 - 10:00',
    type: '移動',
    note: '空港線で博多へ移動',
    accent: 'bg-sky-500',
  },
  {
    time: '11:30',
    title: '博多ラーメン 昼食',
    window: '11:30 - 13:00',
    type: '食事',
    note: '人気店の豚骨ラーメンを満喫',
    accent: 'bg-emerald-500',
  },
  {
    time: '14:00',
    title: '太宰府天満宮 参拝',
    window: '14:00 - 16:00',
    type: '観光',
    note: '参道で梅ヶ枝餅を食べ歩き',
    accent: 'bg-teal-500',
    image:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    time: '18:30',
    title: '中洲 屋台巡り',
    window: '18:30 - 20:30',
    type: '夕食',
    note: '小雨のため店内席を優先',
    accent: 'bg-cyan-600',
  },
];

function ActionIcon({ children }) {
  return (
    <button
      type="button"
      className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 shadow transition hover:text-teal-700"
    >
      {children}
    </button>
  );
}

export default function TopPage() {
  return (
    <section className="relative min-h-screen bg-[#f3f6f8] p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">九州縦断3泊4日の旅</h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
            >
              スポット候補
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
            >
              AIアシスタント
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
            >
              共有
            </button>
            <button
              type="button"
              className="rounded-full bg-teal-700 px-3 py-1.5 text-white hover:bg-teal-800"
            >
              まとめて保存
            </button>
          </div>
        </header>

        <div className="border-b border-slate-200 px-5 py-3 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            {DAYS.map((day, index) => (
              <button
                type="button"
                key={day}
                className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide transition ${
                  index === 0 ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            ))}
            <button
              type="button"
              className="ml-1 grid h-6 w-6 place-items-center rounded-full border border-slate-200 text-slate-400 hover:text-teal-700"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[70px_1fr] gap-3 px-4 py-5 sm:px-7">
          <div className="pt-1">
            {TIMELINE.map((item) => (
              <div
                key={`${item.time}-${item.title}`}
                className="h-[108px] text-right text-[11px] text-slate-400"
              >
                {item.time}
              </div>
            ))}
          </div>

          <div className="space-y-4 border-l border-slate-200 pl-4">
            <div className="h-2 w-11/12 rounded bg-slate-100" />
            {TIMELINE.map((item) => (
              <article
                key={`${item.time}-${item.title}`}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_1px_rgba(15,23,42,0.02)]"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-10 w-1 rounded-full ${item.accent}`} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-800">{item.title}</h2>
                        <p className="mt-0.5 text-[11px] text-slate-500">{item.window}</p>
                      </div>
                      <button type="button" className="text-xs text-slate-400 hover:text-slate-600">
                        ...
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{item.note}</p>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="mt-3 h-20 w-full rounded-lg object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <ActionIcon>◎</ActionIcon>
        <ActionIcon>↕</ActionIcon>
        <ActionIcon>☰</ActionIcon>
      </div>

      <button
        type="button"
        className="fixed bottom-6 right-6 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-slate-700"
      >
        ＋ 予定を追加
      </button>
    </section>
  );
}
