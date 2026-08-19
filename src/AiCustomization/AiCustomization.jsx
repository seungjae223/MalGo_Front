import {
  useEffect,
  useState,
} from "react";

import "./AiCustomization.css";

const FACE_OPTIONS = [
  { value: "serious", label: "차분한 표정" },
  { value: "smile", label: "웃는 표정" },
  { value: "neutral", label: "담담한 표정" },
];

const LANGUAGE_OPTIONS = [
  { value: "EN", label: "영어" },
  { value: "JA", label: "일본어" },
  { value: "ZH", label: "중국어" },
  { value: "VI", label: "베트남어" },
  { value: "ES", label: "스페인어" },
  { value: "DE", label: "독일어" },
];

const RELATIONSHIP_OPTIONS = [
  {
    value: "LOVER",
    label: "연인",
    relationshipType: "LOVER",
  },
  {
    value: "SPOUSE",
    label: "배우자",
    relationshipType: "SPOUSE",
  },
  {
    value: "FAMILY",
    label: "가족",
    relationshipType: "FAMILY",
  },
  {
    value: "TEACHER",
    label: "선생님",
    relationshipType: "TEACHER",
  },
  {
    value: "ACQUAINTANCE",
    label: "지인",
    relationshipType: "ACQUAINTANCE",
  },
  {
    value: "JUNIOR",
    label: "후배",
    relationshipType: "JUNIOR",
  },
  {
    value: "US_CLIENT",
    label: "거래처·US",
    relationshipType: "CLIENT",
    targetCountry: "US",
  },
  {
    value: "JP_FRIEND",
    label: "친구·JP",
    relationshipType: "FRIEND",
    targetCountry: "JP",
  },
  {
    value: "VN_BOSS",
    label: "상사·VN",
    relationshipType: "BOSS",
    targetCountry: "VN",
  },
];

const GENDER_OPTIONS = [
  { value: "FEMALE", label: "여자" },
  { value: "MALE", label: "남자" },
];

const SPEECH_OPTIONS = [
  { value: "FORMAL", label: "격식체" },
  { value: "POLITE", label: "정중체" },
  { value: "FRIENDLY", label: "친근체" },
  { value: "WARM", label: "다정체" },
  { value: "PLAYFUL", label: "장난체" },
  { value: "PLAIN", label: "담백체" },
  { value: "SINCERE", label: "진성체" },
  { value: "EMOTIONAL", label: "감성체" },
  { value: "DIALECT", label: "사투리" },
];

function normalizeSpeechStyle(value) {
  return {
    AFFECTIONATE: "WARM",
    CASUAL: "PLAIN",
  }[value] ?? value;
}

function findRelationshipValue(partner) {
  const exactOption = RELATIONSHIP_OPTIONS.find(
    (option) =>
      option.relationshipType ===
        partner?.relationshipType &&
      option.targetCountry ===
        partner?.targetCountry
  );

  if (exactOption) {
    return exactOption.value;
  }

  return (
    RELATIONSHIP_OPTIONS.find(
      (option) =>
        option.relationshipType ===
        partner?.relationshipType
    )?.value ?? RELATIONSHIP_OPTIONS[0].value
  );
}

function SquareChoice({
  name,
  value,
  checked,
  onChange,
  label,
  className = "",
  children,
}) {
  return (
    <label
      className={`ai-customization-choice ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        aria-label={label}
      />

      <span
        className="ai-customization-check"
        aria-hidden="true"
      />

      {children ?? (
        <span className="ai-customization-choice-label">
          {label}
        </span>
      )}
    </label>
  );
}

function AiCustomization({
  partners,
  selectedPartnerId,
  FaceComponent,
  onClose,
  onSave,
  isSaving,
  errorMessage,
}) {
  const initialPartner =
    partners.find(
      (partner) =>
        partner.id === selectedPartnerId
    ) ?? partners[0];

  const [modelId, setModelId] = useState(
    initialPartner
      ? String(initialPartner.id)
      : ""
  );
  const [faceType, setFaceType] = useState(
    initialPartner?.faceType ?? "smile"
  );
  const [targetLanguage, setTargetLanguage] =
    useState(
      initialPartner?.targetLanguage ?? "EN"
    );
  const [relationship, setRelationship] =
    useState(
      findRelationshipValue(initialPartner)
    );
  const [gender, setGender] = useState(
    initialPartner?.gender ?? "FEMALE"
  );
  const [speechStyle, setSpeechStyle] =
    useState(
      normalizeSpeechStyle(
        initialPartner?.speechStyle ?? "POLITE"
      )
    );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
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
  }, [isSaving, onClose]);

  const handleModelChange = (value) => {
    setModelId(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const sourcePartner = partners.find(
      (partner) =>
        String(partner.id) === modelId
    );
    const relationshipOption =
      RELATIONSHIP_OPTIONS.find(
        (option) =>
          option.value === relationship
      );

    if (!sourcePartner || !relationshipOption) {
      return;
    }

    onSave({
      sourcePartner,
      faceType,
      targetLanguage,
      targetCountry:
        relationshipOption.targetCountry ??
        sourcePartner.targetCountry ??
        "US",
      relationshipType:
        relationshipOption.relationshipType,
      relationship,
      gender,
      speechStyle,
    });
  };

  return (
    <div className="ai-customization-viewport">
      <form
        id="ai-customization-panel"
        className="ai-customization-panel"
        role="region"
        aria-labelledby="ai-customization-title"
        onSubmit={handleSubmit}
      >
        <h2
          id="ai-customization-title"
          className="ai-customization-title"
        >
          원하시는 AI 모델 챗봇을 커스텀 해보세요.
        </h2>

        <fieldset className="ai-customization-models">
          <legend className="ai-customization-visually-hidden">
            AI 모델 선택
          </legend>

          {partners.slice(0, 3).map((partner) => (
            <SquareChoice
              key={partner.id}
              name="ai-model"
              value={String(partner.id)}
              checked={
                modelId === String(partner.id)
              }
              onChange={handleModelChange}
              label={partner.name}
            />
          ))}
        </fieldset>

        <fieldset className="ai-customization-group ai-customization-expression-group">
          <legend>표정 선택</legend>

          <div className="ai-customization-expression-list">
            {FACE_OPTIONS.map((option) => (
              <SquareChoice
                key={option.value}
                name="face-type"
                value={option.value}
                checked={faceType === option.value}
                onChange={setFaceType}
                label={option.label}
                className="ai-customization-expression-choice"
              >
                <span className="ai-customization-face">
                  <FaceComponent
                    type={option.value}
                    selected={
                      faceType === option.value
                    }
                  />
                </span>
              </SquareChoice>
            ))}
          </div>
        </fieldset>

        <fieldset className="ai-customization-group ai-customization-language-group">
          <legend>언어 선택</legend>

          <div className="ai-customization-grid ai-customization-language-grid">
            {LANGUAGE_OPTIONS.map((option) => (
              <SquareChoice
                key={option.value}
                name="target-language"
                value={option.value}
                checked={targetLanguage === option.value}
                onChange={setTargetLanguage}
                label={option.label}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="ai-customization-group ai-customization-relationship-group">
          <legend>관계 선택</legend>

          <div className="ai-customization-grid ai-customization-relationship-grid">
            {RELATIONSHIP_OPTIONS.map((option) => (
              <SquareChoice
                key={option.value}
                name="relationship"
                value={option.value}
                checked={
                  relationship === option.value
                }
                onChange={setRelationship}
                label={option.label}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="ai-customization-group ai-customization-gender-group">
          <legend>성별</legend>

          <div className="ai-customization-grid ai-customization-gender-grid">
            {GENDER_OPTIONS.map((option) => (
              <SquareChoice
                key={option.value}
                name="gender"
                value={option.value}
                checked={gender === option.value}
                onChange={setGender}
                label={option.label}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="ai-customization-group ai-customization-speech-group">
          <legend>말투 선택</legend>

          <div className="ai-customization-grid ai-customization-speech-grid">
            {SPEECH_OPTIONS.map((option) => (
              <SquareChoice
                key={option.value}
                name="speech-style"
                value={option.value}
                checked={
                  speechStyle === option.value
                }
                onChange={setSpeechStyle}
                label={option.label}
              />
            ))}
          </div>
        </fieldset>

        {errorMessage && (
          <p
            className="ai-customization-error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className="ai-customization-submit"
          disabled={isSaving || !modelId}
        >
          {isSaving ? "저장 중" : "수정 완료"}
        </button>
      </form>
    </div>
  );
}

export default AiCustomization;
