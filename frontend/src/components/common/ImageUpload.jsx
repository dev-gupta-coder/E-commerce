import { useRef } from "react";
const ImageUpload = ({ onUpload, multiple = false }) => {
  const ref = useRef();
  return (
    <div onClick={() => ref.current.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
      <p className="text-gray-500">Click to upload image{multiple ? "s" : ""}</p>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => onUpload(e.target.files)} />
    </div>
  );
};
export default ImageUpload;
