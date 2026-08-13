interface ConfirmDialogProps {
  name: string;
  skip: boolean;
  onSkip: (skip: boolean) => void;
  onNo: () => void;
  onYes: () => void;
}

export default function ConfirmDialog({ name, skip, onSkip, onNo, onYes }: ConfirmDialogProps) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-title">Delete category "{name}"?</div>
        <div className="modal-body">
          All its items will be deleted. This cannot be undone.
        </div>
        <label className="modal-check">
          <input type="checkbox" checked={skip} onChange={(e) => onSkip(e.currentTarget.checked)} />
          Don't ask again
        </label>
        <div className="modal-btns">
          <button type="button" className="btn-ghost" onClick={onNo}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onYes}>
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}
