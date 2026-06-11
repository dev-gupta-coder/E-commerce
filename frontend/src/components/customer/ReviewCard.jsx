import { formatDate } from "@/utils/formatDate";
import RatingStars    from "@/components/ui/RatingStars";
import Avatar         from "@/components/ui/Avatar";
const ReviewCard = ({ review }) => (
  <div className="flex gap-3 py-4 border-b dark:border-gray-700">
    <Avatar name={review.user?.name ?? "U"} size="sm" />
    <div>
      <div className="flex items-center gap-2"><p className="font-medium text-sm">{review.user?.name}</p><RatingStars rating={review.rating} /></div>
      <p className="text-xs text-gray-400 mb-1">{formatDate(review.createdAt)}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
    </div>
  </div>
);
export default ReviewCard;
