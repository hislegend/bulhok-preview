'use client';

export default function PricingPage() {
  const openChannelTalk = () => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).ChannelIO) {
      (window as unknown as Record<string, (...args: unknown[]) => void>).ChannelIO('showMessenger');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">구독 플랜</h1>
        <p className="text-lg text-gray-500">프리미엄 영상 소스를 월정액으로 이용하세요</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-300 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />

          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium mb-6">
            🔥 정기 구독
          </div>

          <div className="mb-1">
            <span className="text-2xl text-gray-400 line-through mr-2">500,000원</span>
            <span className="inline-flex items-center bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">50% OFF</span>
          </div>
          <div className="mb-2">
            <span className="text-5xl font-bold text-gray-900">250,000</span>
            <span className="text-xl text-gray-500">원</span>
          </div>
          <p className="text-gray-400 mb-8">월 구독 요금</p>

          <ul className="text-left space-y-3 mb-8">
            {[
              '구독 즉시 첫 콘텐츠 해금',
              '3일마다 새 콘텐츠 자동 해금',
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

          <button
            onClick={openChannelTalk}
            className="block w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all text-lg cursor-pointer"
          >
            💬 결제 문의하기
          </button>
          <p className="text-xs text-gray-400 mt-3">채널톡 채팅이 열립니다</p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>구독은 언제든 해지할 수 있습니다.</p>
      </div>
    </div>
  );
}
