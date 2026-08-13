export default function Toast({ msg }: { msg: string }) {
  return (
    <div className="toast">
      <span className="toast-msg">{msg}</span>
    </div>
  );
}
