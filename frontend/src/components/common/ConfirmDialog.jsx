import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
const ConfirmDialog = ({ open, onClose, onConfirm, title = "Confirm", message = "Are you sure?" }) => (
  <Modal open={open} onClose={onClose} title={title}>
    <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirm</Button>
    </div>
  </Modal>
);
export default ConfirmDialog;
