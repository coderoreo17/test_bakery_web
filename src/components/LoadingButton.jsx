export default function LoadingButton({
  loading,
  children,
  className,
  ...props
}) {
  return (
    <button
      disabled={loading}
      className={`flex items-center justify-center gap-2 ${className} ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
      {loading ? "Processing..." : children}
    </button>
  );
}
