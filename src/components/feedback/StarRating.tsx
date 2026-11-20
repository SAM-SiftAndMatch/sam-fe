import { Star } from 'lucide-react';
import { useId } from 'react';
import { ratingLabels } from '../../lib/feedback';

export default function StarRating({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}) {
  const name = useId();
  const stars = [1, 2, 3, 4, 5];
  if (!onChange)
    return (
      <span className="inline-flex items-center gap-1">
        <span className="sr-only">{value} trên 5 sao</span>
        {stars.map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            size={16}
            className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
          />
        ))}
      </span>
    );
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-semibold text-slate-800">Bạn cảm thấy thế nào về SAM?</legend>
      <div className="flex gap-2">
        {stars.map((star) => (
          <label
            key={star}
            className="cursor-pointer rounded-xl p-1.5 transition-colors hover:bg-amber-50 focus-within:ring-2 focus-within:ring-blue-500"
            title={ratingLabels[star]}
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="sr-only"
              aria-label={`${star} sao: ${ratingLabels[star]}`}
              required
            />
            <Star
              aria-hidden="true"
              size={34}
              className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
            />
          </label>
        ))}
      </div>
      <p className="min-h-5 text-sm text-slate-500" aria-live="polite">
        {ratingLabels[value] || 'Chọn từ 1 đến 5 sao'}
      </p>
    </fieldset>
  );
}
