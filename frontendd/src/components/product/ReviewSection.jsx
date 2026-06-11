import { FaStar } from "react-icons/fa";

const ReviewSection = ({ reviews = [] }) => {
  return (
    <div className="mt-12 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold dark:text-white">
        Customer Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500">
          No reviews available.
        </p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border-b pb-4 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold dark:text-white">
                  {review?.user?.name || "Anonymous"}
                </h4>

                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span className="dark:text-white">
                    {review.rating}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;