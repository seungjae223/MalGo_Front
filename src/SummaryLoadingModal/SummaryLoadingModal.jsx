import { createPortal } from "react-dom";

import "./SummaryLoadingModal.css";

import { ReactComponent as PuzzleKr } from "../img/퍼즐1.svg";
import { ReactComponent as PuzzleEn } from "../img/퍼즐2.svg";

function SummaryLoadingModal() {
  return createPortal(
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
        <div
          className="summary-loading-dots"
          aria-hidden="true"
        >
          <span className="summary-loading-dot" />
          <span className="summary-loading-dot" />
          <span className="summary-loading-dot" />
        </div>

        <div
          className="summary-loading-puzzle-stage"
          aria-hidden="true"
        >
          <PuzzleKr
            className="summary-loading-puzzle summary-loading-puzzle-kr"
            aria-hidden="true"
            focusable="false"
          />

          <PuzzleEn
            className="summary-loading-puzzle summary-loading-puzzle-en"
            aria-hidden="true"
            focusable="false"
          />
        </div>

        <p
          id="summary-loading-description"
          className="summary-loading-description"
        >
          내용 요약 정리중입니다.
        </p>

        <p
          id="summary-loading-title"
          className="summary-loading-title"
          aria-live="polite"
        >
          잠시만 기다려주세요
        </p>

        <span className="summary-loading-screen-reader">
          내용 요약 정리중입니다. 잠시만 기다려주세요.
        </span>
      </section>
    </div>,
    document.body
  );
}

export default SummaryLoadingModal;