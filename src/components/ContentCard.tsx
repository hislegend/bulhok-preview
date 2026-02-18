import Link from 'next/link';
import TimeLockBadge from './TimeLockBadge';
import { Content } from '@/types';

interface ContentCardProps {
  content: Content & { unlocked: boolean };
}

export default function ContentCard({ content }: ContentCardProps) {
  return (
    <Link
      href={content.unlocked ? `/contents/${content.id}` : '#'}
      className={`group block rounded-xl overflow-hidden border border-gray-200 bg-white transition-all ${
        content.unlocked
          ? 'hover:shadow-lg hover:border-orange-300 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {content.thumbnail_url ? (
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
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
