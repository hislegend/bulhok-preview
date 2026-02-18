import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,146,60,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.2),transparent_50%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              새 콘텐츠가 3일마다 해금됩니다
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              프리미엄 영상 소스,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                매주 새롭게
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl">
              전문 촬영팀이 제작한 고퀄리티 영상 촬영 소스를 구독하고,
              여러분의 프로젝트에 바로 활용하세요. 구독 기간에 따라 새로운 콘텐츠가 순차적으로 해금됩니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl text-lg transition-all shadow-lg shadow-orange-500/25"
              >
                월 25만원으로 시작하기
              </Link>
              <Link
                href="/contents"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-lg transition-all backdrop-blur-sm"
              >
                콘텐츠 둘러보기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">왜 불혹청년인가요?</h2>
            <p className="text-gray-500 text-lg">크리에이터를 위한 최고의 영상 소스 구독 서비스</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: '프로급 촬영 소스',
                desc: '전문 장비와 숙련된 촬영팀이 제작한 4K 이상의 고퀄리티 영상 소스를 제공합니다.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: '타임락 해금 시스템',
                desc: '구독 시작일 기준 3일마다 새로운 콘텐츠가 해금됩니다. 오래 구독할수록 더 많은 소스를 이용하세요.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
                title: '무제한 다운로드',
                desc: '해금된 콘텐츠는 횟수 제한 없이 다운로드 가능합니다. Google Drive에서 빠르게 받으세요.',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-50 text-orange-500 rounded-xl mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">심플한 요금제</h2>
            <p className="text-gray-500 text-lg">하나의 플랜, 모든 콘텐츠</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 text-center">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium mb-6">
                정기 구독
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">25만</span>
                <span className="text-xl text-gray-500">원/월</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                {[
                  '3일마다 새 콘텐츠 해금',
                  '해금된 콘텐츠 무제한 다운로드',
                  '4K 이상 고퀄리티 원본 파일',
                  '상업적 이용 가능',
                  '신규 콘텐츠 지속 업데이트',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all"
              >
                구독 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">지금 시작하세요</h2>
          <p className="text-xl text-orange-100 mb-8">매달 새로운 프리미엄 영상 소스가 여러분을 기다립니다.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl text-lg hover:bg-orange-50 transition-colors"
          >
            Google로 시작하기 →
          </Link>
        </div>
      </section>
    </div>
  );
}
