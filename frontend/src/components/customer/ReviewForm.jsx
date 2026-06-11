import { useState } from "react";
import Button from "@/components/ui/Button";
const ReviewForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <select name="rating" value={form.rating} onChange={handle} className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Comment</label>
        <textarea name="comment" value={form.comment} onChange={handle} rows={3} maxLength={500} className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 resize-none" />
      </div>
      <Button type="submit" loading={loading}>Submit Review</Button>
    </form>
  );
};
export default ReviewForm;
