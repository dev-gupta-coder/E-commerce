const RatingStars = ({ rating = 0, max = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }, (_, i) => (
      <span key={i} className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
    ))}
  </div>
);
export default RatingStars;
