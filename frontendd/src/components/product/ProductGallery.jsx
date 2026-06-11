import { useState, useEffect } from "react";

const ProductGallery = ({ images = [] }) => {
  const normalizedImages = images.map((image) =>
    typeof image === "string" ? image : image?.url
  );

  const [selectedImage, setSelectedImage] = useState(
    normalizedImages[0] || ""
  );

  useEffect(() => {
    setSelectedImage(normalizedImages[0] || "");
  }, [images]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-white dark:border-gray-700 dark:bg-gray-800">
        <img
          src={selectedImage}
          alt="Product"
          className="h-[450px] w-full object-cover"
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {normalizedImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`overflow-hidden rounded-lg border-2 ${
              selectedImage === image
                ? "border-blue-600"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <img
              src={image}
              alt={`Product ${index + 1}`}
              className="h-24 w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;