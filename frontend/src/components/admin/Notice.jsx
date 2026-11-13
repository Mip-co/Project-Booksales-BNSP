export default function Notice({ notice }) {
  if (!notice) return null;

  return (
    <p
      role="status"
      className={`rounded-xl p-3 text-sm font-medium ${
        notice.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
      }`}
    >
      {notice.text}
    </p>
  );
}
