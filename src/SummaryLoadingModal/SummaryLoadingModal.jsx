import { useEffect } from "react";
import "./SummaryLoadingModal.css";

import krPuzzle from "../img/퍼즐1.svg";
import enPuzzle from "../img/퍼즐2.svg";

function SummaryLoadingModal({ isOpen }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="summary-loading-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-loading-title"
      aria-describedby="summary-loading-description"
    >
      <section
        className="summary-loading-modal"
        aria-busy="true"
      >
        {/* 파도처럼 움직이는 점 */}
        <div
          className="summary-loading-dots"
          aria-hidden="true"
        >
          <span className="summary-loading-dot" />
          <span className="summary-loading-dot" />
          <span className="summary-loading-dot" />
        </div>

        {/* KR / EN 퍼즐 */}
        <div
          className="summary-loading-puzzle-stage"
          aria-hidden="true"
        >
          <img
            src={krPuzzle}
            alt=""
            className="
              summary-loading-puzzle
              summary-loading-puzzle-kr
            "
          />

          <img
            src={enPuzzle}
            alt=""
            className="
              summary-loading-puzzle
              summary-loading-puzzle-en
            "
          />
        </div>

        <p
          id="summary-loading-description"
          className="summary-loading-description"
        >
          내용 요약 정리중입니다.
        </p>

        <h2
          id="summary-loading-title"
          className="summary-loading-title"
        >
          잠시만 기다려주세요
        </h2>

        <span
          className="summary-loading-screen-reader"
          aria-live="polite"
        >
          대화 내용을 요약하고 있습니다.
        </span>
      </section>
    </div>
  );
}

export default SummaryLoadingModal;