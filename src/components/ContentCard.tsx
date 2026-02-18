import Link from 'next/link';
import TimeLockBadge from './TimeLockBadge';
import { Content } from '@/types';

const CATEGORY_STYLES: Record<string, { gradient: string; icon: string }> = {
  '도시/야경': { gradient: 'from-indigo-600 via-purple-600 to-blue-800', icon: '🌃' },
  '자연/풍경': { gradient: 'from-emerald-500 via-teal-500 to-cyan-600', icon: '🏔️' },
  '라이프스타일': { gradient: 'from-amber-500 via-orange-400 to-yellow-500', icon: '☕' },
  '패션/뷰티': { gradient: 'from-pink-500 via-rose-400 to-fuchsia-500', icon: '👗' },
  '푸드': { gradient: 'from-red-500 via-orange-500 to-amber-500', icon: '🍽️' },
  '비즈니스': { gradient: 'from-slate-600 via-gray-500 to-zinc-600', icon: '💼' },
  '건축/인테리어': { gradient: 'from-stone-500 via-amber-600 to-orange-700', icon: '🏛️' },
  '스포츠/건강': { gradient: 'from-green-500 via-lime-500 to-emerald-500', icon: '💪' },
};

const DEFAULT_STYLE = { gradient: 'from-gray-600 via-gray-500 to-gray-700', icon: '🎬' };

interface ContentCardProps {
  content: Content & { unlocked: boolean };
}

export default function ContentCard({ content }: ContentCardProps) {
  const style = CATEGORY_STYLES[content.category || ''] || DEFAULT_STYLE;

  return (
    <Link
      href={content.unlocked ? `/contents/${content.id}` : '#'}
      className={`group block rounded-xl overflow-hidden border border-gray-200 bg-white transition-all ${
        content.unlocked
          ? 'hover:shadow-lg hover:border-orange-300 hover:-translate-y-0.5 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Thumbnail */}
      <div className={`aspect-video bg-gradient-to-br ${style.gradient} relative overflow-hidden`}>
        {content.thumbnail_url ? (
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/80">
            <span className="text-4xl mb-2">{style.icon}</span>
            <span className="text-xs font-medium tracking-wider uppercase opacity-60">{content.category || 'Video'}</span>
          </div>
        )}
        {!content.unlocked && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
            #{content.release_order}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {content.title}
          </h3>
          <TimeLockBadge unlocked={content.unlocked} releaseOrder={content.release_order} />
        </div>
        {content.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{content.description}</p>
        )}
        {content.category && (
          <span className="inline-block mt-2 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
            {content.category}
          </span>
        )}
      </div>
    </Link>
  );
}
