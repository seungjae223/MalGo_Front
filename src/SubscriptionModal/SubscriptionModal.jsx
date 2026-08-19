import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import "./SubscriptionModal.css";
import PaymentBottomSheet from "./PaymentBottomSheet";

import { ReactComponent as PuzzleKr } from "../img/퍼즐1.svg";
import { ReactComponent as PuzzleEn } from "../img/퍼즐2.svg";

function SubscriptionModal({
  onClose,
  onStart,
}) {
  const startButtonRef = useRef(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] =
    useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState("");

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;
    const previousDocumentOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
      document.documentElement.style.overflow =
        previousDocumentOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isPaymentSheetOpen) {
        setIsPaymentSheetOpen(false);
        return;
      }

      onClose();
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isPaymentSheetOpen, onClose]);

  useEffect(() => {
    if (!isPaymentSheetOpen) {
      startButtonRef.current?.focus();
    }
  }, [isPaymentSheetOpen]);

  const handleOverlayMouseDown = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (isPaymentSheetOpen) {
      setIsPaymentSheetOpen(false);
      return;
    }

    onClose();
  };

  const handleStart = async () => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);
    setStartError("");

    try {
      await onStart();
      onClose();
    } catch (error) {
      setStartError(
        error?.message ||
          "구독을 시작하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsStarting(false);
    }
  };

  return createPortal(
    <div
      className="subscription-overlay"
      onMouseDown={handleOverlayMouseDown}
    >
      {isPaymentSheetOpen ? (
        <PaymentBottomSheet
          onClose={() => setIsPaymentSheetOpen(false)}
          onPay={handleStart}
          isPaying={isStarting}
          errorMessage={startError}
        />
      ) : (
        <section
          className="subscription-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="subscription-title"
          aria-describedby="subscription-benefits"
        >
          <div
            className="subscription-puzzle-stage"
            aria-hidden="true"
          >
            <PuzzleKr className="subscription-puzzle subscription-puzzle--kr" />
            <PuzzleEn className="subscription-puzzle subscription-puzzle--en" />
          </div>

          <h2
            id="subscription-title"
            className="subscription-title"
          >
            구독을 하시면 <strong>더 많은</strong>
            <br />
            <span>혜택 사용이 가능해요!</span>
          </h2>

          <div
            id="subscription-benefits"
            className="subscription-benefits"
          >
            <p>AI 메이커 기능</p>
            <p>번역 기록함 제한없이 사용 가능</p>
          </div>

          <button
            ref={startButtonRef}
            type="button"
            className="subscription-start-button"
            onClick={() => setIsPaymentSheetOpen(true)}
          >
            지금 시작하기
          </button>

          <button
            type="button"
            className="subscription-later-button"
            onClick={onClose}
          >
            아니요 다음에 할게요
          </button>

        </section>
      )}
    </div>,
    document.body
  );
}

export default SubscriptionModal;
