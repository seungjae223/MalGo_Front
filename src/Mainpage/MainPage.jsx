import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import "./MainPage.css";
import { getMemberId } from "../api/auth";
import {
  ApiError,
  getNetworkErrorMessage,
  isMembershipRequiredError,
} from "../api/client";
import {
  conversationApi,
  translationApi,
  partnerApi,
  customizationApi,
  subscriptionApi,
} from "../api/malgoApi";

import mainLogo from "../img/메인페이지 로고.png";
import sendIcon from "../img/메세지.png";
import chatbotIcon from "../img/챗봇아이콘.svg";
import handIcon from "../img/손.png";
import figmaFaceSerious from "../img/figma-face-serious.svg";
import figmaFaceSmile from "../img/figma-face-smile.svg";
import figmaFaceNeutral from "../img/figma-face-neutral.svg";
import figmaSelectedSerious from "../img/figma-selected-serious.svg";
import figmaSelectedSmile from "../img/figma-selected-smile.png";
import figmaSelectedNeutral from "../img/figma-selected-neutral.svg";
import subscriberCustomizationIcon from "../img/subscriber-customization.png";
import group62Icon from "../img/group-62.svg";

const SummaryPage = lazy(() =>
  import("../Summarypage/SummaryPage")
);
const SummaryLoadingModal = lazy(() =>
  import("../SummaryLoadingModal/SummaryLoadingModal")
);
const SubscriptionModal = lazy(() =>
  import("../SubscriptionModal/SubscriptionModal")
);
const AiCustomization = lazy(() =>
  import("../AiCustomization/AiCustomization")
);
const HomeLogoLink = lazy(() =>
  import("../HomeLogoLink/HomeLogoLink")
);

/*
 * 오프라인 화면과 동일한 사전 대화 흐름입니다. 마지막 답변은
 * 실제 대화 API로 보내므로 여기에는 화면용 질문만 둡니다.
 */
const PRE_CONVERSATION_QUESTIONS = [
  {
    key: "targetLanguage",
    prompts: {
      FORMAL: "상대방이 사용하는 언어를 알려주시겠습니까?",
      POLITE: "상대방은 어떤 언어를 사용하나요?",
      FRIENDLY: "상대방은 어떤 언어를 써?",
      WARM: "상대방은 어떤 언어를 쓰는지 알려줄래요?",
      PLAYFUL: "상대방은 무슨 언어를 쓰는지 살짝 알려줄래?",
      PLAIN: "상대방이 사용하는 언어는 무엇인가요?",
      SINCERE: "정확한 도움을 드릴 수 있도록, 상대방이 사용하는 언어를 알려주실 수 있을까요?",
      EMOTIONAL: "더 잘 도와드리고 싶어요. 상대방은 어떤 언어를 사용하나요?",
      DIALECT: "상대방은 무슨 언어 쓰는교?",
    },
  },
  {
    key: "situation",
    prompts: {
      FORMAL: "상대방과의 대화 상황 및 관계를 말씀해 주시겠습니까?",
      POLITE: "상대방과 어떤 상황·관계에서 대화하나요?",
      FRIENDLY: "상대방이랑 어떤 사이고, 어떤 상황이야?",
      WARM: "상대방과 어떤 관계인지, 어떤 상황인지 편하게 알려줄래요?",
      PLAYFUL: "상대방이랑 어떤 사이인지, 상황도 살짝 들려줄래?",
      PLAIN: "상대방과의 관계와 대화 상황을 입력해주세요.",
      SINCERE: "더 알맞은 표현을 드리기 위해, 상대방과의 관계와 대화 상황을 자세히 알려주실 수 있을까요?",
      EMOTIONAL: "상대방과의 관계와 상황을 알려주시면 더 마음에 맞는 표현을 찾아드릴게요.",
      DIALECT: "상대방이랑 어떤 사이고, 무슨 일로 얘기하는 긴가요?",
    },
  },
  {
    key: "sourceQuestion",
    prompts: {
      FORMAL: "전달하고자 하는 한국어 질문 또는 문장을 입력해 주시겠습니까?",
      POLITE: "영어로 전달하고 싶은 한국어 질문이나 문장을 입력해주세요.",
      FRIENDLY: "상대방에게 전하고 싶은 말을 한국어로 적어줘!",
      WARM: "전하고 싶은 말을 한국어로 편하게 적어줄래요?",
      PLAYFUL: "상대방한테 하고 싶은 말, 한국어로 툭 적어줘!",
      PLAIN: "전달할 한국어 문장을 입력해주세요.",
      SINCERE: "마음을 정확히 전할 수 있도록, 전달하고 싶은 한국어 문장을 적어주실 수 있을까요?",
      EMOTIONAL: "전하고 싶은 마음을 한국어로 적어주세요. 더 자연스럽게 다듬어드릴게요.",
      DIALECT: "전하고 싶은 말, 한국어로 적어주이소!",
    },
  },
];

const BASE_INITIAL_GREETING =
  "당신의 비즈니스 해답지 *-* 어떤 도움이 필요하신가요?";

const INITIAL_GREETING_BY_TONE = {
  FORMAL: "당신의 비즈니스를 위해 어떤 도움이 필요하신지 말씀해 주시겠습니까?",
  POLITE: "당신의 비즈니스 해답지 *-* 어떤 도움이 필요하신가요?",
  FRIENDLY: "비즈니스 고민, 같이 풀어볼까? 무엇을 도와줄까?",
  WARM: "비즈니스에 힘이 되어드릴게요. 무엇을 도와드릴까요?",
  PLAYFUL: "비즈니스 고민, 같이 풀어볼까요? 무엇이든 편하게 말해줘요!",
  PLAIN: "비즈니스 관련 도움이 필요하신가요? 원하는 내용을 입력해주세요.",
  SINCERE: "당신의 비즈니스에 실질적인 도움이 되고 싶어요. 무엇이 필요하신가요?",
  EMOTIONAL: "당신의 비즈니스를 진심으로 응원해요. 무엇을 도와드릴까요?",
  DIALECT: "비즈니스 일, 내가 도와줄게예. 뭐가 필요하신교?",
};

const SPEECH_STYLE_ALIASES = {
  AFFECTIONATE: "WARM",
  CASUAL: "PLAIN",
};

const CONVERSATION_SITUATION = "BUSINESS";
const DEFAULT_CONVERSATION_FIELD = "IT_DEVELOPMENT";

/*
 * 대화·개인화 API에서 사용하는 언어 enum입니다.
 */
const TARGET_LANGUAGE_BY_COUNTRY = {
  US: "EN",
  JP: "JA",
  CN: "ZH",
  VN: "VI",
  ES: "ES",
  DE: "DE",
};

const COUNTRY_BY_TARGET_LANGUAGE = {
  EN: "US",
  JA: "JP",
  ZH: "CN",
  VI: "VN",
  ES: "ES",
  DE: "DE",
};

const PERSONA_BY_PARTNER_NAME = {
  tom: "TOM",
  kash: "KASH",
  sana: "SANA",
};

const FACE_BY_EXPRESSION = {
  NEUTRAL: "neutral",
  SMILE: "smile",
  OTHER: "serious",
};

const EXPRESSION_BY_FACE = {
  neutral: "NEUTRAL",
  smile: "SMILE",
  serious: "OTHER",
};

const RELATIONSHIP_TYPE_BY_CUSTOMIZATION = {
  US_CLIENT: "CLIENT",
  JP_FRIEND: "FRIEND",
  VN_BOSS: "BOSS",
};

function getTargetLanguage(targetCountry, fallbackLanguage) {
  const countryLanguage =
    TARGET_LANGUAGE_BY_COUNTRY[
      String(targetCountry ?? "")
        .trim()
        .toUpperCase()
    ];

  if (countryLanguage) {
    return countryLanguage;
  }

  const normalizedFallback = String(
    fallbackLanguage ?? ""
  ).trim().toUpperCase();

  if (COUNTRY_BY_TARGET_LANGUAGE[normalizedFallback]) {
    return normalizedFallback;
  }

  return "EN";
}

function normalizeSpeechStyle(speechStyle) {
  const normalized = String(speechStyle || "POLITE")
    .trim()
    .toUpperCase();

  return SPEECH_STYLE_ALIASES[normalized] || normalized;
}

function getToneCopy(copies, speechStyle) {
  const tone = normalizeSpeechStyle(speechStyle);
  return copies[tone] || copies.POLITE;
}

export function getInitialGreeting(selectedPartner) {
  return getInitialGreetingForPartner(selectedPartner);
}

function isToneGreetingEnabled(selectedPartner) {
  return (
    selectedPartner?.customizationApplied === true ||
    selectedPartner?.custom === true
  );
}

function getInitialGreetingForPartner(selectedPartner) {
  if (!isToneGreetingEnabled(selectedPartner)) {
    return BASE_INITIAL_GREETING;
  }

  return getToneCopy(
    INITIAL_GREETING_BY_TONE,
    selectedPartner.speechStyle
  );
}

export function getPreConversationPrompt(questionIndex, speechStyle) {
  const question = PRE_CONVERSATION_QUESTIONS[questionIndex];

  return question
    ? getToneCopy(question.prompts, speechStyle)
    : "";
}

function resolveTargetLanguage(preConversationInfo, partner) {
  const languageAnswer = String(
    preConversationInfo?.targetLanguage ?? ""
  )
    .trim()
    .toLowerCase();

  const languageByAnswer = [
    ["english", "EN"],
    ["영어", "EN"],
    ["japanese", "JA"],
    ["일본어", "JA"],
    ["chinese", "ZH"],
    ["중국어", "ZH"],
    ["vietnamese", "VI"],
    ["베트남어", "VI"],
    ["spanish", "ES"],
    ["스페인어", "ES"],
    ["german", "DE"],
    ["독일어", "DE"],
  ].find(([keyword]) => languageAnswer.includes(keyword));

  const languageByCode = {
    en: "EN",
    ja: "JA",
    zh: "ZH",
    vi: "VI",
    es: "ES",
    de: "DE",
  }[languageAnswer];

  return (
    languageByAnswer?.[1] || languageByCode ||
    getTargetLanguage(
      partner?.targetCountry,
      partner?.targetLanguage
    )
  );
}

function getConversationField(request) {
  const normalizedRequest = String(request ?? "").toLowerCase();

  if (/디자인|design|ui|ux/.test(normalizedRequest)) {
    return "DESIGN";
  }

  if (/마케팅|marketing|광고|campaign/.test(normalizedRequest)) {
    return "MARKETING";
  }

  if (/영업|sales|판매|고객 유치/.test(normalizedRequest)) {
    return "SALES";
  }

  if (/금융|finance|재무|회계|투자/.test(normalizedRequest)) {
    return "FINANCE";
  }

  return DEFAULT_CONVERSATION_FIELD;
}

function isPremiumSubscription(subscription) {
  if (
    subscription?.plan !== "PREMIUM" ||
    subscription?.status !== "ACTIVE"
  ) {
    return false;
  }

  if (!subscription.expiresAt) {
    return true;
  }

  const expiresAt = new Date(subscription.expiresAt);

  return (
    !Number.isNaN(expiresAt.getTime()) &&
    expiresAt.getTime() > Date.now()
  );
}

function buildTranslationAnalyzePayload({
  memberId,
  originalText,
  partner,
  preConversationInfo,
}) {
  const targetLanguage = resolveTargetLanguage(
    preConversationInfo,
    partner
  );
  const targetCountry =
    COUNTRY_BY_TARGET_LANGUAGE[targetLanguage] ||
    String(partner?.targetCountry ?? "").trim() ||
    "US";

  return {
    memberId,
    originalText,
    sourceLanguage: "ko",
    targetLanguage,
    targetCountry,
    situation: CONVERSATION_SITUATION,
    relationshipType:
      partner?.relationshipType || undefined,
    communicationPurpose: getConversationField(
      preConversationInfo?.request
    ),
    requestedTone: partner?.speechStyle || undefined,
  };
}

/*
 * 백엔드 응답에는 캐릭터 이미지 정보가 없으므로
 * 기존 화면용 임시 얼굴을 순서대로 적용합니다.
 */
const FACE_TYPES = [
  "serious",
  "smile",
  "neutral",
];

const FACE_MARKER_PATTERN =
  /\[MALGO_FACE:(serious|smile|neutral)\]/i;

const DEFAULT_PARTNER_ORDER = {
  tom: 0,
  kash: 1,
  sana: 2,
};

function getPartnerFaceType(
  partner,
  fallbackIndex
) {
  const savedFaceType =
    partner?.characteristic?.match(
      FACE_MARKER_PATTERN
    )?.[1]?.toLowerCase();

  return FACE_TYPES.includes(savedFaceType)
    ? savedFaceType
    : FACE_TYPES[
        fallbackIndex % FACE_TYPES.length
      ];
}

function getDisplayCharacteristic(
  characteristic
) {
  return String(characteristic ?? "")
    .replace(FACE_MARKER_PATTERN, "")
    .trim();
}

function getPartnerNameKey(partner) {
  return String(partner?.name ?? "")
    .trim()
    .toLowerCase();
}

function buildPartnerSavePayload({
  sourcePartner,
  targetLanguage,
  relationshipType,
  gender,
  speechStyle,
}) {
  return {
    name: sourcePartner.name,
    targetCountry:
      COUNTRY_BY_TARGET_LANGUAGE[targetLanguage] ??
      sourcePartner.targetCountry ??
      "US",
    targetLanguage,
    relationshipType,
    ageGroup: sourcePartner.ageGroup ?? null,
    gender,
    speechStyle,
    /*
     * 표정은 Customization의 expression으로만 저장합니다.
     * 이전 화면 구현에서 사용하던 MALGO_FACE 마커는 AI 프롬프트에
     * 전달되는 characteristic에 남기지 않습니다.
     */
    characteristic:
      getDisplayCharacteristic(
        sourcePartner.characteristic
      ) || null,
  };
}

function preparePartnerList(responseData) {
  const partnerByName = new Map();

  responseData.forEach((partner) => {
    const key =
      getPartnerNameKey(partner) ||
      `partner-${partner?.id}`;
    const previousPartner =
      partnerByName.get(key);

    const shouldReplace =
      !previousPartner ||
      (partner.custom &&
        !previousPartner.custom) ||
      (partner.custom &&
        previousPartner.custom &&
        Number(partner.id) >
          Number(previousPartner.id));

    if (shouldReplace) {
      partnerByName.set(key, partner);
    }
  });

  return Array.from(partnerByName.values())
    .sort((firstPartner, secondPartner) => {
      const firstName = getPartnerNameKey(firstPartner);
      const secondName = getPartnerNameKey(secondPartner);

      const firstOrder =
        DEFAULT_PARTNER_ORDER[firstName] ?? 100;
      const secondOrder =
        DEFAULT_PARTNER_ORDER[secondName] ?? 100;

      return (
        firstOrder - secondOrder ||
        Number(firstPartner.id) -
          Number(secondPartner.id)
      );
    })
    .map((partner, index) => ({
      ...partner,
      targetLanguage: getTargetLanguage(
        partner.targetCountry,
        partner.targetLanguage
      ),
      faceType: getPartnerFaceType(
        partner,
        index
      ),
    }));
}

function applyCustomization(partners, customization) {
  const personaName = String(
    customization?.aiPersona ?? ""
  ).trim().toLowerCase();

  if (!personaName) {
    return partners;
  }

  const targetLanguage = getTargetLanguage(
    null,
    customization.targetLanguage
  );
  const relationship = customization.relationships?.[0];

  return partners.map((partner) => {
    if (String(partner.name).trim().toLowerCase() !== personaName) {
      return partner;
    }

    return {
      ...partner,
      targetLanguage,
      targetCountry:
        COUNTRY_BY_TARGET_LANGUAGE[targetLanguage] ??
        partner.targetCountry,
      relationshipType:
        RELATIONSHIP_TYPE_BY_CUSTOMIZATION[relationship] ??
        relationship ??
        partner.relationshipType,
      gender: customization.gender ?? partner.gender,
      speechStyle:
        customization.speechStyles?.[0] ??
        partner.speechStyle,
      faceType:
        FACE_BY_EXPRESSION[customization.expression] ??
        partner.faceType,
      customizationApplied: true,
    };
  });
}

/*
 * 명세서 예시에 나온 enum을
 * 화면에서 한글로 표시하기 위한 값입니다.
 */
const RELATIONSHIP_LABELS = {
  FRIEND: "친구",
  CLIENT: "거래처",
  LOVER: "연인",
  SPOUSE: "배우자",
  FAMILY: "가족",
  TEACHER: "선생님",
  ACQUAINTANCE: "지인",
  JUNIOR: "후배",
  BOSS: "상사",
};

const AGE_GROUP_LABELS = {
  CHILD: "어린이",
  TEENAGER: "청소년",
  COLLEGE_STUDENT: "대학생",
  WORKER: "직장인",
  SENIOR: "시니어",
};

function getEnumLabel(value, labelMap) {
  if (!value) {
    return "미설정";
  }

  return labelMap[value] ?? value;
}

/*
 * 서버 메시지 응답을 기존 화면에서 사용하던
 * 메시지 형태로 변환합니다.
 */
function createDisplayMessage(
  apiMessage,
  fallbackSender,
  fallbackContent = ""
) {
  const sender =
    apiMessage?.senderType === "USER"
      ? "user"
      : apiMessage?.senderType === "ASSISTANT"
        ? "bot"
        : fallbackSender;

  const apiMessageId =
    apiMessage?.id ?? Date.now();

  return {
    id: `${sender}-${apiMessageId}`,
    apiId: apiMessage?.id ?? null,
    sender,
    content:
      apiMessage?.content ?? fallbackContent,
    createdAt:
      apiMessage?.createdAt ?? null,
  };
}

/*
 * 서버는 AI 답변 전체를 하나의 메시지로 저장합니다. 화면에서는
 * 빈 줄로 구분된 문단을 각각의 말풍선으로 보여 주기 위해 분리합니다.
 * 제목만 있는 문단은 뒤의 본문과 함께 표시합니다.
 */
function splitAssistantMessageContent(content) {
  const paragraphs = String(content ?? "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [""];
  }

  return paragraphs.reduce(
    (messageParts, paragraph) => {
      const previousPart =
        messageParts[messageParts.length - 1];
      const isStandaloneHeading =
        /^[^\n]{1,80}[:：]$/.test(previousPart ?? "");

      if (isStandaloneHeading) {
        messageParts[messageParts.length - 1] =
          `${previousPart}\n${paragraph}`;
        return messageParts;
      }

      messageParts.push(paragraph);
      return messageParts;
    }, []);
}

function createDisplayMessages(
  apiMessage,
  fallbackSender,
  fallbackContent = ""
) {
  const displayMessage = createDisplayMessage(
    apiMessage,
    fallbackSender,
    fallbackContent
  );

  if (displayMessage.sender !== "bot") {
    return [displayMessage];
  }

  return splitAssistantMessageContent(
    displayMessage.content
  ).map((content, index) => ({
    ...displayMessage,
    id: `${displayMessage.id}-${index + 1}`,
    content,
  }));
}

function formatDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function TemporaryFace({
  type,
  selected = false,
}) {
  const selectedFace = {
    serious: figmaSelectedSerious,
    smile: figmaSelectedSmile,
    neutral: figmaSelectedNeutral,
  }[type];

  if (selected && selectedFace) {
    return (
      <img
        src={selectedFace}
        alt=""
        aria-hidden="true"
        className="temporary-face figma-selected-face"
      />
    );
  }

  return (
    <img
      src={
        {
          serious: figmaFaceSerious,
          smile: figmaFaceSmile,
          neutral: figmaFaceNeutral,
        }[type] ?? figmaFaceSerious
      }
      alt=""
      className="temporary-face"
      aria-hidden="true"
    />
  );
}

function MainPage() {
  const navigate = useNavigate();

  const [memberId, setMemberId] =
    useState(null);

  const [partners, setPartners] =
    useState([]);

  const [
    selectedPartnerId,
    setSelectedPartnerId,
  ] = useState(null);

  const [
    preConversationStep,
    setPreConversationStep,
  ] = useState(-1);

  const [
    preConversationInfo,
    setPreConversationInfo,
  ] = useState({});

  const [
    conversationId,
    setConversationId,
  ] = useState(null);

  const [inputValue, setInputValue] =
    useState("");

  const [
    isPartnersLoading,
    setIsPartnersLoading,
  ] = useState(true);

  const [
    partnersError,
    setPartnersError,
  ] = useState("");

  const [
    isSendingMessage,
    setIsSendingMessage,
  ] = useState(false);

  const [
    isSummaryPageOpen,
    setIsSummaryPageOpen,
  ] = useState(false);

  const [
    isSummaryLoading,
    setIsSummaryLoading,
  ] = useState(false);

  const [summaryData, setSummaryData] =
    useState(null);

  const [latestTranslationData, setLatestTranslationData] =
    useState(null);

  const [latestConversationAnalysis, setLatestConversationAnalysis] =
    useState(null);

  const [summaryMemo, setSummaryMemo] =
    useState("");

  const [
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
  ] = useState(false);

  const [isSubscribed, setIsSubscribed] =
    useState(false);

  const [
    isCustomizationOpen,
    setIsCustomizationOpen,
  ] = useState(false);

  const [
    isCustomizationSaving,
    setIsCustomizationSaving,
  ] = useState(false);

  const [
    customizationError,
    setCustomizationError,
  ] = useState("");

  const [messages, setMessages] = useState([
    {
      id: "initial-bot-message",
      sender: "bot",
      content: getInitialGreeting(),
    },
  ]);

  const messageListRef = useRef(null);

  const selectedPartner = useMemo(() => {
    return partners.find(
      (partner) =>
        partner.id === selectedPartnerId
    );
  }, [partners, selectedPartnerId]);

  const isPreConversationComplete =
    preConversationStep >=
    PRE_CONVERSATION_QUESTIONS.length;

  /*
   * 선택된 AI 상대가 말투 커스터마이징되면 첫 인사말을
   * 해당 말투로 바꾸고, 기본 상태에서는 기본 문구를 유지합니다.
   */
  useEffect(() => {
    if (preConversationStep !== -1) {
      return;
    }

    const greeting =
      getInitialGreetingForPartner(selectedPartner);

    setMessages((previousMessages) =>
      previousMessages.map((message) =>
        message.id === "initial-bot-message"
          ? { ...message, content: greeting }
          : message
      )
    );
  }, [
    selectedPartner,
    preConversationStep,
    selectedPartner?.id,
    selectedPartner?.customizationApplied,
    selectedPartner?.custom,
    selectedPartner?.speechStyle,
  ]);

  /*
   * 로그인 정보를 확인한 뒤
   * AI Partner 목록을 조회합니다.
   *
   * GET /api/partners/member/{memberId}
   */
  useEffect(() => {
    const storedMemberId = getMemberId();

    if (
      storedMemberId === undefined ||
      storedMemberId === null
    ) {
      navigate("/login", {
        replace: true,
      });

      return undefined;
    }

    setMemberId(storedMemberId);

    const controller =
      new AbortController();

    let isActive = true;

    const loadPartners = async () => {
      setIsPartnersLoading(true);
      setPartnersError("");

      try {
        const [responseData, subscription, customization] =
          await Promise.all([
            partnerApi.list(storedMemberId, {
              signal: controller.signal,
            }),
            subscriptionApi.get(storedMemberId, {
              signal: controller.signal,
            }),
            customizationApi
              .get(storedMemberId, {
                signal: controller.signal,
              })
              .catch((error) => {
                if (
                  error instanceof ApiError &&
                  error.status === 404
                ) {
                  return null;
                }

                throw error;
              }),
          ]);

        if (!Array.isArray(responseData)) {
          throw new Error(
            "AI 대화 상대 목록 응답 형식이 올바르지 않습니다."
          );
        }

        const isSubscribed = isPremiumSubscription(
          subscription
        );
        const partnerList = applyCustomization(
          preparePartnerList(responseData),
          isSubscribed ? customization : null
        );

        if (!isActive) {
          return;
        }

        setPartners(partnerList);
        setIsSubscribed(isSubscribed);

        if (partnerList.length > 0) {
          setSelectedPartnerId(
            (previousPartnerId) =>
              previousPartnerId ??
              partnerList[0].id
          );
        }
      } catch (error) {
        if (
          error.name === "AbortError" ||
          !isActive
        ) {
          return;
        }

        console.error(
          "AI Partner 목록 조회 실패:",
          error
        );

        setPartnersError(getNetworkErrorMessage(error));
      } finally {
        if (isActive) {
          setIsPartnersLoading(false);
        }
      }
    };

    loadPartners();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [navigate]);

  /*
   * 새로운 메시지가 추가되면
   * 메시지 영역을 아래로 이동합니다.
   */
  useEffect(() => {
    if (!messageListRef.current) {
      return;
    }

    messageListRef.current.scrollTop =
      messageListRef.current.scrollHeight;
  }, [messages]);

  /*
   * 요약 요청 중에는
   * 배경 스크롤을 막습니다.
   */
  useEffect(() => {
    if (!isSummaryLoading) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isSummaryLoading]);

  const handlePartnerSelect = (
    partnerId
  ) => {
    /*
     * 대화방 생성 후에는 기존 대화방의
     * 상대와 화면의 상대가 달라지지 않도록
     * 변경을 막습니다.
     */
    if (
      conversationId !== null ||
      isSendingMessage
    ) {
      return;
    }

    setSelectedPartnerId(partnerId);
  };

  const handleSubscriptionStart = async () => {
    const activeMemberId =
      memberId ?? getMemberId();

    if (activeMemberId === null) {
      throw new Error(
        "로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요."
      );
    }

    try {
      const subscription =
        await subscriptionApi.activatePremium(
          activeMemberId
        );

      setIsSubscribed(
        isPremiumSubscription(subscription)
      );
    } catch (error) {
      throw new Error(getNetworkErrorMessage(error));
    }
  };

  const handleCustomizationOpen = () => {
    if (
      !isSubscribed ||
      isPartnersLoading ||
      partners.length === 0 ||
      conversationId !== null ||
      isSendingMessage
    ) {
      return;
    }

    setCustomizationError("");
    setIsCustomizationOpen(true);
  };

  const handleCustomizationSave =
    async ({
      sourcePartner,
      faceType,
      targetLanguage,
      relationshipType,
      relationship,
      gender,
      speechStyle,
    }) => {
      if (
        memberId === null ||
        isCustomizationSaving
      ) {
        return;
      }

      setIsCustomizationSaving(true);
      setCustomizationError("");

      const persona = PERSONA_BY_PARTNER_NAME[
        String(sourcePartner.name)
          .trim()
          .toLowerCase()
      ];

      if (!persona) {
        setCustomizationError(
          "기본 AI 모델만 커스터마이징할 수 있습니다."
        );
        setIsCustomizationSaving(false);
        return;
      }

      const payload = {
        aiPersona: persona,
        expression: EXPRESSION_BY_FACE[faceType] ?? "OTHER",
        targetLanguage,
        relationships: [relationship],
        gender,
        speechStyles: [speechStyle],
      };

      const partnerPayload = buildPartnerSavePayload({
        sourcePartner,
        targetLanguage,
        relationshipType,
        gender,
        speechStyle,
      });

      try {
        /*
         * 커스터마이징 API는 화면 설정을 저장하지만 대화 API는
         * AiPartner의 언어 설정을 사용합니다. 따라서 실제 대화에
         * 선택 언어가 반영되도록 커스텀 AI 상대도 함께 저장합니다.
         */
        const savedPartner = sourcePartner.custom
          ? await partnerApi.update(
              memberId,
              sourcePartner.id,
              partnerPayload
            )
          : await partnerApi.create(
              memberId,
              partnerPayload
            );

        if (!Number.isSafeInteger(savedPartner?.id)) {
          throw new Error(
            "AI 상대 저장 응답에서 올바른 ID를 받지 못했습니다."
          );
        }

        const customization =
          await customizationApi.update(memberId, payload);

        setPartners((previousPartners) =>
          applyCustomization(
            preparePartnerList([
              ...previousPartners.filter(
                (partner) =>
                  getPartnerNameKey(partner) !==
                  getPartnerNameKey(savedPartner)
              ),
              savedPartner,
            ]),
            customization
          )
        );
        setSelectedPartnerId(savedPartner.id);
        setIsCustomizationOpen(false);
      } catch (error) {
        console.error(
          "AI 커스터마이징 저장 실패:",
          error
        );

        if (isMembershipRequiredError(error)) {
          setIsCustomizationOpen(false);
          setIsSubscriptionModalOpen(true);
        }

        setCustomizationError(
          getNetworkErrorMessage(error)
        );
      } finally {
        setIsCustomizationSaving(false);
      }
    };

  /*
   * 첫 메시지를 보내기 전에
   * 대화방을 생성합니다.
   *
   * POST /api/conversations
   */
  const createConversation =
    async (conversationInfo = preConversationInfo) => {
      let partnerForConversation = selectedPartner;

      /*
       * 이전 버전에서 저장된 커스터마이징은 기본 AI 상대 자체를
       * 변경하지 않았습니다. 첫 대화 전에 커스텀 AI 상대를 생성해
       * 선택한 언어가 서버의 실제 대화 프롬프트에 전달되게 합니다.
       */
      if (
        selectedPartner.customizationApplied &&
        !selectedPartner.custom
      ) {
        const savedPartner = await partnerApi.create(
          memberId,
          buildPartnerSavePayload({
            sourcePartner: selectedPartner,
            targetLanguage:
              selectedPartner.targetLanguage,
            relationshipType:
              selectedPartner.relationshipType,
            gender: selectedPartner.gender,
            speechStyle: selectedPartner.speechStyle,
          })
        );

        if (!Number.isSafeInteger(savedPartner?.id)) {
          throw new Error(
            "AI 상대 저장 응답에서 올바른 ID를 받지 못했습니다."
          );
        }

        partnerForConversation = {
          ...savedPartner,
          faceType: selectedPartner.faceType,
          customizationApplied: true,
        };

        setPartners((previousPartners) =>
          preparePartnerList([
            ...previousPartners.filter(
              (partner) =>
                getPartnerNameKey(partner) !==
                getPartnerNameKey(savedPartner)
            ),
            savedPartner,
          ]).map((partner) =>
            partner.id === savedPartner.id
              ? {
                  ...partner,
                  faceType:
                    selectedPartner.faceType,
                  customizationApplied: true,
                }
              : partner
          )
        );
        setSelectedPartnerId(savedPartner.id);
      }

      const targetLanguage = resolveTargetLanguage(
        conversationInfo,
        partnerForConversation
      );

      const responseData = await conversationApi.create({
        memberId,
        aiPartnerId: partnerForConversation.id,
        situation: CONVERSATION_SITUATION,
        field: getConversationField(
          conversationInfo?.request
        ),
        targetLanguage,
      });

      const createdConversationId =
        responseData.id;

      if (
        createdConversationId ===
          undefined ||
        createdConversationId === null
      ) {
        throw new Error(
          "대화방 생성 응답에서 id를 받지 못했습니다."
        );
      }

      setConversationId(
        createdConversationId
      );

      return {
        id: createdConversationId,
        partner: partnerForConversation,
      };
    };

  /*
   * 채팅 응답이 정상적으로 생성된 뒤, 같은 문장을 번역 기록으로 저장합니다.
   * 기록 저장은 별도 OpenAI 분석을 수행하므로 실패해도 이미 성공한 채팅을
   * 실패 처리하거나 사용자에게 재전송을 요구하지 않습니다.
   */
  const saveTranslationRecord = async (
    originalText,
    partner = selectedPartner,
    conversationInfo = preConversationInfo
  ) => {
    const payload =
      buildTranslationAnalyzePayload({
        memberId,
        originalText,
        partner,
        preConversationInfo: conversationInfo,
      });

    if (!payload) {
      console.warn(
        "번역 기록 저장을 건너뛰었습니다: 대상 국가 정보가 없습니다."
      );

      return;
    }

    try {
      const analysisData = await translationApi.analyze(payload);
      setLatestTranslationData(analysisData);
    } catch (error) {
      console.error(
        "번역 기록 저장 실패:",
        error
      );

      window.alert(
        `번역 기록을 저장하지 못했어요.\n${getNetworkErrorMessage(
          error
        )}`
      );
    }
  };

  /*
   * 마지막 사전 질문과 이후의 일반 메시지는 모두 같은 실제 API로 보냅니다.
   * 화면에 표시한 임시 사용자 메시지는 서버가 저장한 메시지로 교체합니다.
   */
  const sendMessageToConversation = async ({
    content,
    conversationInfo,
    temporaryMessageId,
  }) => {
    try {
      const createdConversation =
        conversationId === null
          ? await createConversation(conversationInfo)
          : null;
      const activeConversationId =
        createdConversation?.id ?? conversationId;
      const activePartner =
        createdConversation?.partner ?? selectedPartner;
      const responseData = await conversationApi.sendMessage(
        memberId,
        activeConversationId,
        content
      );

      setLatestConversationAnalysis(
        responseData.analysis ?? null
      );
      await saveTranslationRecord(
        content,
        activePartner,
        conversationInfo
      );

      const userMessage = createDisplayMessage(
        responseData.userMessage,
        "user",
        content
      );
      const assistantMessages = createDisplayMessages(
        responseData.assistantMessage,
        "bot",
        "AI 응답을 불러오지 못했습니다."
      );

      setMessages((previousMessages) => [
        ...previousMessages.filter(
          (message) => message.id !== temporaryMessageId
        ),
        userMessage,
        ...assistantMessages,
      ]);
    } catch (error) {
      console.error("대화 메시지 전송 실패:", error);
      setMessages((previousMessages) =>
        previousMessages.filter(
          (message) => message.id !== temporaryMessageId
        )
      );
      setInputValue(content);

      if (isMembershipRequiredError(error)) {
        setIsSubscriptionModalOpen(true);
      }

      window.alert(getNetworkErrorMessage(error));
    }
  };

  /*
   * 오프라인 버전의 사전 질문을 그대로 표시한 뒤, 마지막 한국어 문장은
   * 실제 대화방을 만들고 서버 AI 응답을 받습니다.
   */
  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (isSendingMessage) {
      return;
    }

    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage) {
      return;
    }

    if (memberId === undefined || memberId === null) {
      window.alert(
        "로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요."
      );
      navigate("/login", { replace: true });
      return;
    }

    if (!selectedPartner) {
      window.alert("AI 대화 상대를 먼저 선택해주세요.");
      return;
    }

    if (preConversationStep === -1) {
      setPreConversationInfo({ request: trimmedMessage });
      setPreConversationStep(0);
      setInputValue("");
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: `pre-conversation-request-${Date.now()}`,
          sender: "user",
          content: trimmedMessage,
        },
        {
          id: `pre-conversation-question-${Date.now()}`,
          sender: "bot",
          content: getPreConversationPrompt(
            0,
            selectedPartner.speechStyle
          ),
        },
      ]);
      return;
    }

    const currentQuestion =
      PRE_CONVERSATION_QUESTIONS[preConversationStep];

    if (!isPreConversationComplete && currentQuestion) {
      const nextConversationInfo = {
        ...preConversationInfo,
        [currentQuestion.key]: trimmedMessage,
      };
      const nextQuestion =
        PRE_CONVERSATION_QUESTIONS[preConversationStep + 1];
      const answerMessageId =
        `pre-conversation-answer-${Date.now()}`;

      setPreConversationInfo(nextConversationInfo);
      setPreConversationStep((previousStep) => previousStep + 1);
      setInputValue("");
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: answerMessageId,
          sender: "user",
          content: trimmedMessage,
        },
        ...(nextQuestion
          ? [
              {
                id: `pre-conversation-question-${Date.now()}`,
                sender: "bot",
                content: getPreConversationPrompt(
                  preConversationStep + 1,
                  selectedPartner.speechStyle
                ),
              },
            ]
          : []),
      ]);

      if (!nextQuestion) {
        setIsSendingMessage(true);
        try {
          await sendMessageToConversation({
            content: trimmedMessage,
            conversationInfo: nextConversationInfo,
            temporaryMessageId: answerMessageId,
          });
        } finally {
          setIsSendingMessage(false);
        }
      }

      return;
    }

    const temporaryMessageId = `temporary-user-${Date.now()}`;
    setIsSendingMessage(true);
    setInputValue("");
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: temporaryMessageId,
        sender: "user",
        content: trimmedMessage,
      },
    ]);

    try {
      await sendMessageToConversation({
        content: trimmedMessage,
        conversationInfo: preConversationInfo,
        temporaryMessageId,
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  /*
   * 대화 요약을 생성합니다.
   *
   * POST
   * /api/conversations/member/{memberId}/{conversationId}/summary
   */
  const handleSummary = async () => {
    if (
      isSummaryLoading ||
      isSendingMessage
    ) {
      return;
    }

    if (
      conversationId === undefined ||
      conversationId === null
    ) {
      window.alert(
        "아직 요약할 대화 내용이 없어요."
      );

      return;
    }

    setIsSummaryLoading(true);

    try {
      const responseData =
        await conversationApi.createSummary(
          memberId,
          conversationId
        );

      setSummaryData(responseData);
      setIsSummaryPageOpen(true);
    } catch (error) {
      console.error(
        "대화 요약 생성 실패:",
        error
      );

      window.alert(getNetworkErrorMessage(error));
    } finally {
      setIsSummaryLoading(false);
    }
  };

  /*
   * 기존 SummaryPage에 기존 prop과
   * 요약 API 응답을 함께 전달합니다.
   */
  if (isSummaryPageOpen) {
    return (
      <Suspense fallback={null}>
        <SummaryPage
          messages={messages}
          selectedPartner={selectedPartner}
          selectedRegion={
            selectedPartner?.targetCountry ??
            ""
          }
          selectedArea={getEnumLabel(
            selectedPartner?.relationshipType,
            RELATIONSHIP_LABELS
          )}
          selectedTarget={getEnumLabel(
            selectedPartner?.ageGroup,
            AGE_GROUP_LABELS
          )}
          targetFeature={
            getDisplayCharacteristic(
              selectedPartner?.characteristic
            )
          }
          conversationId={conversationId}
          summaryData={summaryData}
          conversationAnalysis={latestConversationAnalysis}
          translationData={latestTranslationData}
          memo={summaryMemo}
          onMemoChange={setSummaryMemo}
          onBack={() =>
            setIsSummaryPageOpen(false)
          }
          onHome={() =>
            setIsSummaryPageOpen(false)
          }
        />
      </Suspense>
    );
  }

  return (
    <div className="main-page-scroll">
      <div
        className={`main-page ${
          isCustomizationOpen
            ? "ai-customization-active"
            : ""
        }`}
      >
        <header className="main-header">
          {!isSubscribed && (
            <button
              type="button"
              className="history-button"
              aria-label="구독 혜택 보기"
              aria-haspopup="dialog"
              onClick={() =>
                setIsSubscriptionModalOpen(true)
              }
            >
              <img
                src={group62Icon}
                alt=""
                aria-hidden="true"
                className="subscription-benefits-icon"
              />
            </button>
          )}

          <Suspense fallback={null}>
            <HomeLogoLink
              onHome={() =>
                setIsCustomizationOpen(false)
              }
            >
              <img
                src={mainLogo}
                alt="Malgo"
                className="main-logo"
              />

              <h1 className="main-logo-title">
                Malgo
              </h1>
            </HomeLogoLink>
          </Suspense>
        </header>

        <main
          className={`main-chat-container ${
            isCustomizationOpen
              ? "ai-customization-active"
              : ""
          }`}
        >
          {!isCustomizationOpen && (
            <>
          <section className="partner-section">
            <h2 className="partner-section-title">
              AI 대화 상대 선택
            </h2>

            {isSubscribed && (
              <button
                type="button"
                className="partner-customization-button"
                aria-label="AI 대화 상대 커스터마이징"
                aria-controls="ai-customization-panel"
                aria-expanded={isCustomizationOpen}
                onClick={handleCustomizationOpen}
                disabled={
                  isPartnersLoading ||
                  partners.length === 0 ||
                  conversationId !== null ||
                  isSendingMessage
                }
              >
                <img
                  src={subscriberCustomizationIcon}
                  alt=""
                  aria-hidden="true"
                  className="partner-customization-icon"
                />
              </button>
            )}

            <div className="partner-list">
              {isPartnersLoading && (
                <p className="partner-status-message">
                  AI 대화 상대를
                  불러오는 중이에요.
                </p>
              )}

              {!isPartnersLoading &&
                partnersError && (
                  <p className="partner-status-message">
                    {partnersError}
                  </p>
                )}

              {!isPartnersLoading &&
                !partnersError &&
                partners.length === 0 && (
                  <p className="partner-status-message">
                    사용할 수 있는 AI 대화
                    상대가 없습니다.
                  </p>
                )}

              {!isPartnersLoading &&
                !partnersError &&
                partners.map(
                  (partner) => {
                    const isSelected =
                      selectedPartnerId ===
                      partner.id;

                    return (
                      <button
                        key={partner.id}
                        type="button"
                        className={`partner-item ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handlePartnerSelect(
                            partner.id
                          )
                        }
                        aria-pressed={
                          isSelected
                        }
                        disabled={
                          conversationId !==
                            null ||
                          isSendingMessage
                        }
                      >
                        <div className="partner-face-wrapper">
                          <TemporaryFace
                            type={
                              partner.faceType
                            }
                            selected={isSelected}
                          />
                        </div>

                        <span className="partner-name">
                          {partner.name}
                        </span>
                      </button>
                    );
                  }
                )}
            </div>

            <div className="partner-information-bar">
              {!isPartnersLoading &&
                !partnersError &&
                partners.map(
                  (partner) => (
                    <button
                      key={partner.id}
                      type="button"
                      className={`partner-information ${
                        selectedPartnerId ===
                        partner.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handlePartnerSelect(
                          partner.id
                        )
                      }
                      aria-pressed={
                        selectedPartnerId ===
                        partner.id
                      }
                      disabled={
                        conversationId !==
                          null ||
                        isSendingMessage
                      }
                    >
                      {getEnumLabel(
                        partner.relationshipType,
                        RELATIONSHIP_LABELS
                      )}
                      ·
                      {partner.targetCountry ||
                        "미설정"}
                    </button>
                  )
                )}
            </div>
          </section>

          <section className="chat-content chat-started">
            <div className="chat-information-row">
              <time className="chat-date">
                {formatDate(new Date())}
              </time>
            </div>

            <div
              className="message-list expanded"
              ref={messageListRef}
            >
              {messages.map(
                (
                  message,
                  messageIndex
                ) => {
                  const isBotMessage =
                    message.sender ===
                    "bot";

                  const isInitialBotMessage =
                    isBotMessage &&
                    messageIndex === 0;

                  return (
                    <div
                      key={message.id}
                      className={`message-row ${
                        message.sender
                      } ${
                        isInitialBotMessage
                          ? "initial-message"
                          : ""
                      }`}
                    >
                      {isBotMessage && (
                        <div className="chatbot-icon-box">
                          <img
                            src={
                              chatbotIcon
                            }
                            alt="Malgo 챗봇"
                            className="chatbot-icon"
                          />
                        </div>
                      )}

                      <div className="message-bubble">
                        {String(message.content ?? "")
                          .split("\n")
                          .map(
                            (
                              line,
                              lineIndex,
                              lines
                            ) => (
                              <span
                                key={`${message.id}-${lineIndex}`}
                                className="message-line"
                              >
                                {line}

                                {isInitialBotMessage &&
                                  lineIndex ===
                                    lines.length - 1 && (
                                    <img
                                      src={
                                        handIcon
                                      }
                                      alt=""
                                      aria-hidden="true"
                                      className="message-hand-icon"
                                    />
                                  )}

                                {lineIndex <
                                  lines.length -
                                    1 && (
                                  <br />
                                )}
                              </span>
                            )
                          )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

          </section>

          <form
            className="message-input-section"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              className="message-input"
              placeholder={
                isSendingMessage
                  ? "답변을 기다리는 중이에요."
                  : preConversationStep === -1
                    ? "메시지를 입력해주세요."
                    : isPreConversationComplete
                      ? "메시지를 입력해주세요."
                      : "답변을 입력해주세요."
              }
              value={inputValue}
              onChange={(event) =>
                setInputValue(
                  event.target.value
                )
              }
              disabled={
                isSendingMessage ||
                isPartnersLoading ||
                Boolean(partnersError)
              }
            />

            <button
              type="submit"
              className="message-send-button"
              aria-label="메시지 전송"
              disabled={
                !inputValue.trim() ||
                !selectedPartner ||
                isSendingMessage ||
                isPartnersLoading ||
                Boolean(partnersError)
              }
              aria-busy={isSendingMessage}
            >
              <img
                src={sendIcon}
                alt=""
                className="message-send-icon"
              />
            </button>
          </form>

            </>
          )}

          {isCustomizationOpen && (
            <Suspense fallback={null}>
              <AiCustomization
                partners={partners}
                selectedPartnerId={selectedPartnerId}
                FaceComponent={TemporaryFace}
                onClose={() =>
                  setIsCustomizationOpen(false)
                }
                onSave={handleCustomizationSave}
                isSaving={isCustomizationSaving}
                errorMessage={customizationError}
              />
            </Suspense>
          )}
        </main>

        {!isCustomizationOpen && (
          <button
            type="button"
            className="conversation-summary-button"
            onClick={handleSummary}
            disabled={
              isSummaryLoading ||
              isSendingMessage
            }
            aria-busy={isSummaryLoading}
          >
            대화 내용 요약하기
          </button>
        )}
      </div>

      {/* 대화 요약 API 요청 로딩 모달 */}
      {isSummaryLoading && (
        <Suspense fallback={null}>
          <SummaryLoadingModal />
        </Suspense>
      )}

      {isSubscriptionModalOpen && (
        <Suspense fallback={null}>
          <SubscriptionModal
            onClose={() =>
              setIsSubscriptionModalOpen(false)
            }
            onStart={handleSubscriptionStart}
          />
        </Suspense>
      )}

    </div>
  );
}

export default MainPage;
