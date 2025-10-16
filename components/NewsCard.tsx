'use client';

import { Card as CardType } from '@/lib/store';
import {
  Star,
  ExternalLink,
  Calendar,
  Tag,
  Hash,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsCardProps {
  card: CardType;
  showReadButton?: boolean;
  onMarkAsRead?: (cardId: string) => void;
}

export default function NewsCard({
  card,
  showReadButton = false,
  onMarkAsRead,
}: NewsCardProps) {
  // Runtime guard: ensure rating is a number to prevent toFixed errors
  const ratingNumber =
    typeof card.rating === 'number'
      ? card.rating
      : parseFloat((card as any).rating) || 0;

  return (
    <div className="border rounded-lg p-5 bg-white hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
            <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
            <span className="font-bold text-yellow-900">
              {ratingNumber.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded text-xs">
            <Tag className="h-3 w-3 text-blue-600" />
            <span className="text-blue-900 font-medium">{card.category}</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded text-xs">
            <Hash className="h-3 w-3 text-purple-600" />
            <span className="text-purple-900 font-medium">{card.keyword}</span>
          </div>
        </div>
        {showReadButton && onMarkAsRead && (
          <Button
            size="sm"
            onClick={() => onMarkAsRead(card.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Read
          </Button>
        )}
      </div>

      <h4 className="text-lg font-semibold text-slate-900 mb-2">
        {card.title}
      </h4>

      <p className="text-slate-700 mb-3 leading-relaxed">{card.summary}</p>

      <div className="flex gap-4 text-sm text-slate-500 flex-wrap items-center">
        {card.source && <span>Source: {card.source}</span>}
        {card.date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {card.date}
          </span>
        )}
        {card.archivedAt && (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <CheckCircle className="h-3 w-3" />
            Archived: {new Date(card.archivedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {card.url && (
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm mt-3 inline-flex items-center gap-1"
        >
          Read full article
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
