import {
  useEffect,
  useRef,
  useState,
} from "react";

import group115Preview from "../img/group-115.svg";
import "./PaymentBottomSheet.css";

const PAYMENT_METHODS = [
  {
    id: "general",
    label: "일반결제",
  },
  {
    id: "other",
    label: "기타결제",
  },
];

function PaymentBottomSheet({
  onClose,
  onPay,
  isPaying = false,
  errorMessage = "",
}) {
  const [selectedMethod, setSelectedMethod] =
    useState("card");
  const payButtonRef = useRef(null);

  useEffect(() => {
    payButtonRef.current?.focus();
  }, []);

  return (
    <section
      className="payment-bottom-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-sheet-title"
    >
      <button
        type="button"
        className="payment-sheet-handle"
        onClick={onClose}
        aria-label="구독 혜택으로 돌아가기"
      >
        <span aria-hidden="true" />
      </button>

      <div className="payment-sheet-content">
        <fieldset className="payment-method-fieldset">
          <legend id="payment-sheet-title">결제수단</legend>

          <div className="payment-primary-method">
            <label className="payment-method-choice payment-method-choice--primary">
              <input
                type="radio"
                name="payment-method"
                value="card"
                checked={selectedMethod === "card"}
                onChange={() => setSelectedMethod("card")}
              />
              <span className="payment-method-radio" aria-hidden="true" />
              <span>카드 간편결제</span>
            </label>

            <button
              type="button"
              className={`payment-card-preview ${
                selectedMethod === "card" ? "is-selected" : ""
              }`}
              onClick={() => setSelectedMethod("card")}
              aria-label="토스뱅크 카드 간편결제 선택"
            >
              <img
                src={group115Preview}
                alt=""
                aria-hidden="true"
                className="payment-card-preview-image"
              />
            </button>
          </div>

          <div className="payment-method-list">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className="payment-method-choice payment-method-choice--row"
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                />
                <span
                  className="payment-method-radio"
                  aria-hidden="true"
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="payment-sheet-notice">
          결제/할인혜택 안내
          <br />
          등록 계좌는 설정&gt;계좌정보 에서 변경 가능합니다.
        </p>

        {errorMessage && (
          <p className="payment-sheet-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <footer className="payment-sheet-footer">
        <button
          ref={payButtonRef}
          type="button"
          className="payment-sheet-pay-button"
          onClick={onPay}
          disabled={isPaying}
          aria-busy={isPaying}
        >
          {isPaying ? "처리 중" : "결제하기"}
        </button>
      </footer>

    </section>
  );
}

export default PaymentBottomSheet;
