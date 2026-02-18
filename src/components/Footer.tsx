export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">불</span>
              </div>
              <span className="text-xl font-bold text-white">불혹청년</span>
            </div>
            <p className="text-sm">프리미엄 영상 촬영 소스를 정기 구독으로 만나보세요.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/contents" className="hover:text-white transition-colors">콘텐츠 둘러보기</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">요금제</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">고객지원</h3>
            <ul className="space-y-2 text-sm">
              <li>이메일: support@bulhok.com</li>
              <li>운영시간: 평일 10:00 - 18:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          © 2026 불혹청년. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
