'use client';

import { useState } from 'react';
export default function PricingPage() {
  const [showModal, setShowModal] = useState(false);

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

          <div className="mb-2">
            <span className="text-5xl font-bold text-gray-900">250,000</span>
            <span className="text-xl text-gray-500">원</span>
          </div>
          <p className="text-gray-400 mb-8">매월 자동 결제</p>

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
            onClick={() => setShowModal(true)}
            className="block w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all text-lg"
          >
            결제하기
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>구독은 언제든 해지할 수 있습니다.</p>
      </div>

      {/* Coming Soon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">서비스 준비 중입니다</h3>
            <p className="text-gray-500 mb-6">
              결제 시스템을 준비하고 있습니다.<br />
              곧 만나볼 수 있으니 조금만 기다려주세요!
            </p>
            <p className="text-sm text-orange-500 font-medium mb-6">Coming Soon</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
