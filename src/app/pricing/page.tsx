'use client';

import { siteConfig } from '@/lib/siteConfig';

const { pricing } = siteConfig;

export default function PricingPage() {
  const openChannelTalk = () => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).ChannelIO) {
      (window as unknown as Record<string, (...args: unknown[]) => void>).ChannelIO('showMessenger');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{pricing.title}</h1>
        <p className="text-lg text-gray-500">{pricing.subtitle}</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-300 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />

          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium mb-6">
            🔥 {pricing.planName}
          </div>

          <div className="mb-1">
            <span className="text-2xl text-gray-400 line-through mr-2">{pricing.originalPrice}</span>
            <span className="inline-flex items-center bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{pricing.discountBadge}</span>
          </div>
          <div className="mb-2">
            <span className="text-5xl font-bold text-gray-900">{pricing.price}</span>
            <span className="text-xl text-gray-500">{pricing.priceUnit}</span>
          </div>
          <p className="text-gray-400 mb-8">{pricing.priceLabel}</p>

          <ul className="text-left space-y-3 mb-8">
            {pricing.benefits.map((item, i) => (
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
            {pricing.ctaButton}
          </button>
          <p className="text-xs text-gray-400 mt-3">{pricing.ctaSubtext}</p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>{pricing.cancelNote}</p>
      </div>
    </div>
  );
}
