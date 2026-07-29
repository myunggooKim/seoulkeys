// Shared themed content banks. A learner picks a concept ("why are you learning
// Korean?") and every content-driven surface — falling words, missing-letter
// generation, conversation practice — pulls from that theme's banks. The word
// generators extend these endlessly, so a theme never runs out.

export type ThemeId = "travel" | "business" | "friends" | "reading";

export type ThemeWord = { word: string; meaningKo: string; meaningEn: string; difficulty?: 1 | 2 | 3 };

export type ThemeSentence = {
  korean: string;
  translationEn: string;
  situationKo: string;
  situationEn: string;
};

export type LearningTheme = {
  id: ThemeId;
  icon: string;
  labelKo: string;
  labelEn: string;
  blurbKo: string;
  blurbEn: string;
  words: ThemeWord[];
  sentences: ThemeSentence[];
};

const travel: LearningTheme = {
  id: "travel",
  icon: "✈️",
  labelKo: "여행",
  labelEn: "Travel in Korea",
  blurbKo: "공항·교통·숙소·주문·길찾기 — 한국 여행에서 바로 쓰는 말",
  blurbEn: "Airports, transit, hotels, ordering, directions — words you use on a Korea trip.",
  words: [
    { word: "공항", meaningKo: "비행기가 뜨고 내리는 곳", meaningEn: "airport", difficulty: 1 },
    { word: "여권", meaningKo: "해외에서 쓰는 신분증", meaningEn: "passport", difficulty: 1 },
    { word: "표", meaningKo: "타거나 들어갈 때 내는 것", meaningEn: "a ticket", difficulty: 1 },
    { word: "지하철", meaningKo: "땅 밑을 달리는 열차", meaningEn: "subway", difficulty: 2 },
    { word: "버스", meaningKo: "도로를 다니는 대중교통", meaningEn: "a bus", difficulty: 1 },
    { word: "택시", meaningKo: "요금을 내고 타는 승용차", meaningEn: "a taxi", difficulty: 1 },
    { word: "기차역", meaningKo: "기차를 타고 내리는 곳", meaningEn: "train station", difficulty: 2 },
    { word: "숙소", meaningKo: "여행 중 묵는 곳", meaningEn: "lodging", difficulty: 2 },
    { word: "호텔", meaningKo: "돈을 내고 자는 시설", meaningEn: "a hotel", difficulty: 1 },
    { word: "예약", meaningKo: "미리 자리를 잡아 두는 것", meaningEn: "a reservation", difficulty: 2 },
    { word: "환전", meaningKo: "돈을 다른 나라 돈으로 바꾸기", meaningEn: "currency exchange", difficulty: 2 },
    { word: "지도", meaningKo: "길을 그려 놓은 그림", meaningEn: "a map", difficulty: 1 },
    { word: "화장실", meaningKo: "손 씻고 용변 보는 곳", meaningEn: "a restroom", difficulty: 2 },
    { word: "편의점", meaningKo: "언제든 물건 사는 작은 가게", meaningEn: "convenience store", difficulty: 2 },
    { word: "시장", meaningKo: "물건을 사고파는 곳", meaningEn: "a market", difficulty: 1 },
    { word: "식당", meaningKo: "밥을 사 먹는 곳", meaningEn: "a restaurant", difficulty: 1 },
    { word: "메뉴", meaningKo: "음식 목록", meaningEn: "a menu", difficulty: 1 },
    { word: "계산", meaningKo: "값을 치르는 것", meaningEn: "the bill / payment", difficulty: 2 },
    { word: "관광지", meaningKo: "구경하러 가는 곳", meaningEn: "a tourist spot", difficulty: 2 },
    { word: "입장권", meaningKo: "들어갈 때 내는 표", meaningEn: "an entry ticket", difficulty: 3 },
    { word: "안내소", meaningKo: "길과 정보를 알려주는 곳", meaningEn: "an info center", difficulty: 3 },
    { word: "출발", meaningKo: "떠나기 시작함", meaningEn: "departure", difficulty: 1 },
    { word: "도착", meaningKo: "목적지에 닿음", meaningEn: "arrival", difficulty: 1 },
    { word: "짐", meaningKo: "들고 다니는 물건", meaningEn: "luggage", difficulty: 1 },
    { word: "길", meaningKo: "다니는 통로", meaningEn: "a road / way", difficulty: 1 },
    { word: "왕복", meaningKo: "갔다가 돌아오는 것", meaningEn: "round trip", difficulty: 2 },
    { word: "요금", meaningKo: "이용하고 내는 돈", meaningEn: "a fare / fee", difficulty: 2 },
    { word: "탑승구", meaningKo: "비행기 타러 가는 문", meaningEn: "a boarding gate", difficulty: 3 },
  ],
  sentences: [
    { korean: "화장실이 어디예요?", translationEn: "Where is the restroom?", situationKo: "길 찾기", situationEn: "Finding a place" },
    { korean: "이 주소로 가 주세요.", translationEn: "Please take me to this address.", situationKo: "택시", situationEn: "Taking a taxi" },
    { korean: "이거 얼마예요?", translationEn: "How much is this?", situationKo: "쇼핑", situationEn: "Shopping" },
    { korean: "영어 메뉴 있어요?", translationEn: "Do you have an English menu?", situationKo: "식당", situationEn: "At a restaurant" },
    { korean: "한 명인데 자리 있어요?", translationEn: "It's just me — is there a seat?", situationKo: "식당", situationEn: "At a restaurant" },
    { korean: "지하철역이 가까워요?", translationEn: "Is the subway station nearby?", situationKo: "교통", situationEn: "Transit" },
    { korean: "공항까지 얼마나 걸려요?", translationEn: "How long does it take to the airport?", situationKo: "교통", situationEn: "Transit" },
    { korean: "카드로 계산할 수 있어요?", translationEn: "Can I pay by card?", situationKo: "계산", situationEn: "Paying" },
    { korean: "예약했는데 확인해 주세요.", translationEn: "I made a reservation — please check it.", situationKo: "숙소", situationEn: "Check-in" },
    { korean: "사진 좀 찍어 주시겠어요?", translationEn: "Could you take a photo for me?", situationKo: "관광", situationEn: "Sightseeing" },
    { korean: "길을 잃었어요. 도와주세요.", translationEn: "I'm lost. Please help me.", situationKo: "긴급", situationEn: "Emergency" },
    { korean: "이 근처에 맛집 있어요?", translationEn: "Is there a good restaurant near here?", situationKo: "추천", situationEn: "Recommendations" },
    { korean: "체크아웃 몇 시예요?", translationEn: "What time is check-out?", situationKo: "숙소", situationEn: "At the hotel" },
    { korean: "다음 버스는 언제 와요?", translationEn: "When does the next bus come?", situationKo: "교통", situationEn: "Transit" },
  ],
};

const business: LearningTheme = {
  id: "business",
  icon: "💼",
  labelKo: "비즈니스",
  labelEn: "Business Korean",
  blurbKo: "인사·회의·이메일·존댓말 — 한국 직장에서 통하는 말",
  blurbEn: "Greetings, meetings, email, honorifics — language that works at a Korean workplace.",
  words: [
    { word: "회사", meaningKo: "일하는 조직", meaningEn: "a company", difficulty: 1 },
    { word: "회의", meaningKo: "모여서 의논하는 자리", meaningEn: "a meeting", difficulty: 2 },
    { word: "명함", meaningKo: "이름과 직함이 적힌 카드", meaningEn: "a business card", difficulty: 2 },
    { word: "부장", meaningKo: "부서를 이끄는 직위", meaningEn: "a department head", difficulty: 2 },
    { word: "팀장", meaningKo: "팀을 이끄는 사람", meaningEn: "a team leader", difficulty: 2 },
    { word: "동료", meaningKo: "함께 일하는 사람", meaningEn: "a coworker", difficulty: 2 },
    { word: "고객", meaningKo: "물건이나 서비스를 사는 사람", meaningEn: "a client", difficulty: 2 },
    { word: "계약", meaningKo: "약속을 문서로 맺는 것", meaningEn: "a contract", difficulty: 2 },
    { word: "일정", meaningKo: "해야 할 일의 시간표", meaningEn: "a schedule", difficulty: 2 },
    { word: "보고서", meaningKo: "결과를 정리해 알리는 글", meaningEn: "a report", difficulty: 2 },
    { word: "발표", meaningKo: "여럿 앞에서 알리는 것", meaningEn: "a presentation", difficulty: 2 },
    { word: "출장", meaningKo: "일로 다른 곳에 가는 것", meaningEn: "a business trip", difficulty: 2 },
    { word: "야근", meaningKo: "정해진 시간을 넘겨 일함", meaningEn: "working overtime", difficulty: 2 },
    { word: "휴가", meaningKo: "일을 쉬는 기간", meaningEn: "vacation / leave", difficulty: 1 },
    { word: "월급", meaningKo: "한 달마다 받는 돈", meaningEn: "monthly salary", difficulty: 2 },
    { word: "면접", meaningKo: "일자리를 위해 만나 이야기함", meaningEn: "a job interview", difficulty: 2 },
    { word: "서류", meaningKo: "일에 쓰는 문서", meaningEn: "documents", difficulty: 2 },
    { word: "결재", meaningKo: "윗사람이 승인하는 것", meaningEn: "approval / sign-off", difficulty: 3 },
    { word: "거래처", meaningKo: "일을 주고받는 상대 회사", meaningEn: "a business partner", difficulty: 3 },
    { word: "담당자", meaningKo: "그 일을 맡은 사람", meaningEn: "the person in charge", difficulty: 3 },
    { word: "부서", meaningKo: "회사를 나눈 조직 단위", meaningEn: "a department", difficulty: 2 },
    { word: "업무", meaningKo: "맡아서 하는 일", meaningEn: "work / duties", difficulty: 2 },
    { word: "약속", meaningKo: "만나기로 정한 것", meaningEn: "an appointment", difficulty: 1 },
    { word: "예산", meaningKo: "쓸 수 있는 돈의 계획", meaningEn: "a budget", difficulty: 2 },
    { word: "실적", meaningKo: "이룬 성과", meaningEn: "performance / results", difficulty: 3 },
    { word: "협력", meaningKo: "힘을 합쳐 함께함", meaningEn: "cooperation", difficulty: 2 },
  ],
  sentences: [
    { korean: "처음 뵙겠습니다. 잘 부탁드립니다.", translationEn: "Nice to meet you. I look forward to working with you.", situationKo: "첫 인사", situationEn: "First meeting" },
    { korean: "명함 한 장 주시겠어요?", translationEn: "May I have your business card?", situationKo: "인사", situationEn: "Greeting" },
    { korean: "회의는 몇 시에 시작해요?", translationEn: "What time does the meeting start?", situationKo: "회의", situationEn: "Meetings" },
    { korean: "자료를 이메일로 보내 드릴게요.", translationEn: "I'll send you the materials by email.", situationKo: "이메일", situationEn: "Email" },
    { korean: "일정을 다시 확인해 주시겠어요?", translationEn: "Could you check the schedule again?", situationKo: "일정", situationEn: "Scheduling" },
    { korean: "이 부분을 조금 더 설명해 주세요.", translationEn: "Please explain this part a bit more.", situationKo: "회의", situationEn: "Meetings" },
    { korean: "검토 후에 다시 연락드리겠습니다.", translationEn: "I'll get back to you after reviewing it.", situationKo: "협의", situationEn: "Negotiation" },
    { korean: "제안서 잘 받았습니다. 감사합니다.", translationEn: "I received your proposal well. Thank you.", situationKo: "이메일", situationEn: "Email" },
    { korean: "혹시 마감이 언제까지예요?", translationEn: "By when is the deadline, if I may ask?", situationKo: "업무", situationEn: "Work" },
    { korean: "수고하셨습니다. 내일 뵙겠습니다.", translationEn: "Good work today. See you tomorrow.", situationKo: "퇴근 인사", situationEn: "End of day" },
    { korean: "담당자와 연결해 주시겠어요?", translationEn: "Could you connect me with the person in charge?", situationKo: "전화", situationEn: "On the phone" },
    { korean: "조금 늦을 것 같습니다. 죄송합니다.", translationEn: "I'll be a little late. I'm sorry.", situationKo: "연락", situationEn: "Notice" },
  ],
};

const friends: LearningTheme = {
  id: "friends",
  icon: "🫶",
  labelKo: "친구·대화",
  labelEn: "Making friends",
  blurbKo: "자기소개·취미·SNS·리액션 — 한국인과 친해지는 대화",
  blurbEn: "Intros, hobbies, social media, reactions — talk that makes Korean friends.",
  words: [
    { word: "친구", meaningKo: "가깝게 지내는 사람", meaningEn: "a friend", difficulty: 1 },
    { word: "취미", meaningKo: "즐겨 하는 일", meaningEn: "a hobby", difficulty: 1 },
    { word: "약속", meaningKo: "만나기로 정한 것", meaningEn: "plans to meet", difficulty: 1 },
    { word: "연락처", meaningKo: "연락할 수 있는 정보", meaningEn: "contact info", difficulty: 2 },
    { word: "단톡방", meaningKo: "여럿이 있는 채팅방", meaningEn: "a group chat", difficulty: 2 },
    { word: "맞팔", meaningKo: "서로 팔로우함", meaningEn: "mutual follow", difficulty: 2 },
    { word: "댓글", meaningKo: "글에 다는 짧은 반응", meaningEn: "a comment", difficulty: 2 },
    { word: "노래방", meaningKo: "노래를 부르는 방", meaningEn: "a karaoke room", difficulty: 2 },
    { word: "맛집", meaningKo: "음식이 맛있는 집", meaningEn: "a foodie spot", difficulty: 2 },
    { word: "회식", meaningKo: "함께 모여 먹는 자리", meaningEn: "a group dinner", difficulty: 2 },
    { word: "취향", meaningKo: "좋아하는 방향", meaningEn: "one's taste", difficulty: 2 },
    { word: "대박", meaningKo: "아주 좋거나 놀랄 때 하는 말", meaningEn: "awesome / wow", difficulty: 1 },
    { word: "진짜", meaningKo: "정말로", meaningEn: "really", difficulty: 1 },
    { word: "인싸", meaningKo: "잘 어울리는 사람", meaningEn: "a social insider", difficulty: 2 },
    { word: "눈치", meaningKo: "분위기를 살피는 감각", meaningEn: "social awareness", difficulty: 2 },
    { word: "부탁", meaningKo: "해 달라고 청함", meaningEn: "a favor", difficulty: 1 },
    { word: "선물", meaningKo: "마음을 담아 주는 것", meaningEn: "a gift", difficulty: 1 },
    { word: "생일", meaningKo: "태어난 날", meaningEn: "a birthday", difficulty: 1 },
    { word: "여행", meaningKo: "다른 곳을 다녀오는 일", meaningEn: "a trip", difficulty: 1 },
    { word: "영화", meaningKo: "극장에서 보는 이야기", meaningEn: "a movie", difficulty: 1 },
    { word: "게임", meaningKo: "함께 즐기는 놀이", meaningEn: "a game", difficulty: 1 },
    { word: "운동", meaningKo: "몸을 움직이는 활동", meaningEn: "exercise", difficulty: 1 },
    { word: "약속시간", meaningKo: "만나기로 한 시간", meaningEn: "the meetup time", difficulty: 2 },
    { word: "분위기", meaningKo: "그 자리의 느낌", meaningEn: "the mood / vibe", difficulty: 2 },
    { word: "동네", meaningKo: "사는 근처 지역", meaningEn: "the neighborhood", difficulty: 1 },
    { word: "추천", meaningKo: "좋은 것을 권함", meaningEn: "a recommendation", difficulty: 2 },
  ],
  sentences: [
    { korean: "우리 친구 하자!", translationEn: "Let's be friends!", situationKo: "친해지기", situationEn: "Getting close" },
    { korean: "취미가 뭐예요?", translationEn: "What are your hobbies?", situationKo: "자기소개", situationEn: "Intro" },
    { korean: "인스타 아이디 알려줄래?", translationEn: "Can you tell me your Instagram?", situationKo: "SNS", situationEn: "Social media" },
    { korean: "이번 주말에 시간 있어?", translationEn: "Are you free this weekend?", situationKo: "약속", situationEn: "Making plans" },
    { korean: "같이 밥 먹으러 갈래?", translationEn: "Want to grab a meal together?", situationKo: "약속", situationEn: "Making plans" },
    { korean: "그거 완전 대박이다!", translationEn: "That's totally awesome!", situationKo: "리액션", situationEn: "Reactions" },
    { korean: "진짜? 나도 그거 좋아해!", translationEn: "Really? I like that too!", situationKo: "리액션", situationEn: "Reactions" },
    { korean: "연락처 좀 교환할까요?", translationEn: "Shall we exchange contacts?", situationKo: "친해지기", situationEn: "Getting close" },
    { korean: "다음에 또 만나요.", translationEn: "Let's meet again next time.", situationKo: "인사", situationEn: "Goodbye" },
    { korean: "맛집 하나 추천해 줄래?", translationEn: "Can you recommend a good place to eat?", situationKo: "추천", situationEn: "Recommendations" },
    { korean: "오늘 진짜 재밌었어.", translationEn: "Today was really fun.", situationKo: "마무리", situationEn: "Wrapping up" },
    { korean: "조심히 들어가!", translationEn: "Get home safe!", situationKo: "인사", situationEn: "Goodbye" },
  ],
};

const reading: LearningTheme = {
  id: "reading",
  icon: "📖",
  labelKo: "리딩·기초",
  labelEn: "Reading & literacy",
  blurbKo: "간판·메뉴·표지판 읽기 — 한글을 소리 내어 읽는 힘",
  blurbEn: "Reading signs, menus, and labels — the power to sound out Hangul.",
  words: [
    { word: "입구", meaningKo: "들어가는 곳", meaningEn: "entrance", difficulty: 1 },
    { word: "출구", meaningKo: "나가는 곳", meaningEn: "exit", difficulty: 1 },
    { word: "정지", meaningKo: "멈추라는 표시", meaningEn: "stop", difficulty: 1 },
    { word: "주의", meaningKo: "조심하라는 말", meaningEn: "caution", difficulty: 1 },
    { word: "금지", meaningKo: "하지 말라는 것", meaningEn: "prohibited", difficulty: 2 },
    { word: "안내", meaningKo: "알려 주는 것", meaningEn: "information", difficulty: 1 },
    { word: "영업중", meaningKo: "지금 문을 연 상태", meaningEn: "open (for business)", difficulty: 2 },
    { word: "준비중", meaningKo: "아직 준비하는 중", meaningEn: "preparing / not yet open", difficulty: 2 },
    { word: "할인", meaningKo: "값을 깎아 줌", meaningEn: "a discount", difficulty: 2 },
    { word: "무료", meaningKo: "돈을 안 받음", meaningEn: "free of charge", difficulty: 1 },
    { word: "가격", meaningKo: "물건의 값", meaningEn: "a price", difficulty: 1 },
    { word: "매운맛", meaningKo: "맵게 하는 맛", meaningEn: "spicy flavor", difficulty: 2 },
    { word: "순한맛", meaningKo: "맵지 않은 맛", meaningEn: "mild flavor", difficulty: 2 },
    { word: "포장", meaningKo: "싸서 가져감", meaningEn: "takeout", difficulty: 1 },
    { word: "매장", meaningKo: "물건을 파는 가게", meaningEn: "a store", difficulty: 2 },
    { word: "층", meaningKo: "건물의 높이 단위", meaningEn: "a floor", difficulty: 1 },
    { word: "계단", meaningKo: "오르내리는 단", meaningEn: "stairs", difficulty: 1 },
    { word: "화살표", meaningKo: "방향을 가리키는 표시", meaningEn: "an arrow sign", difficulty: 2 },
    { word: "번호", meaningKo: "차례를 나타내는 수", meaningEn: "a number", difficulty: 1 },
    { word: "요일", meaningKo: "한 주의 하루 이름", meaningEn: "day of the week", difficulty: 1 },
    { word: "오전", meaningKo: "낮 12시 이전", meaningEn: "morning / a.m.", difficulty: 1 },
    { word: "오후", meaningKo: "낮 12시 이후", meaningEn: "afternoon / p.m.", difficulty: 1 },
    { word: "예약석", meaningKo: "미리 잡아 둔 자리", meaningEn: "a reserved seat", difficulty: 2 },
    { word: "비상구", meaningKo: "위급할 때 나가는 문", meaningEn: "an emergency exit", difficulty: 2 },
    { word: "안내판", meaningKo: "알림을 적어 둔 판", meaningEn: "an info board", difficulty: 2 },
    { word: "주차장", meaningKo: "차를 세우는 곳", meaningEn: "a parking lot", difficulty: 2 },
  ],
  sentences: [
    { korean: "여기 입구가 어디예요?", translationEn: "Where is the entrance here?", situationKo: "표지판", situationEn: "Signs" },
    { korean: "지금 영업 중이에요?", translationEn: "Are you open right now?", situationKo: "가게", situationEn: "At a shop" },
    { korean: "이거 무료예요?", translationEn: "Is this free?", situationKo: "가격", situationEn: "Prices" },
    { korean: "화장실은 몇 층에 있어요?", translationEn: "What floor is the restroom on?", situationKo: "안내", situationEn: "Directions" },
    { korean: "포장 되나요?", translationEn: "Can I get it to go?", situationKo: "주문", situationEn: "Ordering" },
    { korean: "덜 맵게 해 주세요.", translationEn: "Please make it less spicy.", situationKo: "주문", situationEn: "Ordering" },
    { korean: "이 글자는 어떻게 읽어요?", translationEn: "How do you read this character?", situationKo: "읽기", situationEn: "Reading" },
    { korean: "천천히 읽어 주시겠어요?", translationEn: "Could you read it slowly?", situationKo: "읽기", situationEn: "Reading" },
    { korean: "여기 앉아도 돼요?", translationEn: "May I sit here?", situationKo: "자리", situationEn: "Seating" },
    { korean: "비상구가 어느 쪽이에요?", translationEn: "Which way is the emergency exit?", situationKo: "안내", situationEn: "Directions" },
    { korean: "몇 시까지 해요?", translationEn: "Until what time are you open?", situationKo: "영업시간", situationEn: "Hours" },
    { korean: "이 줄이 맞아요?", translationEn: "Is this the right line?", situationKo: "안내", situationEn: "Directions" },
  ],
};

export const learningThemes: LearningTheme[] = [travel, business, friends, reading];

export const defaultThemeId: ThemeId = "travel";

export function getTheme(id: ThemeId): LearningTheme {
  return learningThemes.find((theme) => theme.id === id) ?? travel;
}

const THEME_STORAGE_KEY = "hangeul-pop-learning-theme";

export function readStoredThemeId(storage: Storage | undefined): ThemeId | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return learningThemes.some((theme) => theme.id === value) ? (value as ThemeId) : null;
  } catch {
    return null;
  }
}

export function storeThemeId(storage: Storage | undefined, id: ThemeId): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Preference stays in memory for this session when storage is unavailable.
  }
}
