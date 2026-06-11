const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

const OrderStatusTimeline = ({
  currentStatus,
}) => {
  const currentIndex =
    statuses.indexOf(currentStatus);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-between gap-4">
        {statuses.map((status, index) => (
          <div
            key={status}
            className="flex flex-1 flex-col items-center"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                index <= currentIndex
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {index + 1}
            </div>

            <p
              className={`mt-2 text-sm font-medium ${
                index <= currentIndex
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;