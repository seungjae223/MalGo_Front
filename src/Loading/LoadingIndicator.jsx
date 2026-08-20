import "./LoadingIndicator.css";

function LoadingIndicator({
  className = "",
  label = "페이지를 불러오는 중입니다.",
}) {
  const classNames = ["loading-indicator", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="loader" aria-hidden="true" />
      <span className="loading-indicator__label">
        {label}
      </span>
    </div>
  );
}

export default LoadingIndicator;
