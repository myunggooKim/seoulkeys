import type { ThemeId, ThemeSentence, ThemeWord } from "./content-themes";

export type TravelMode = "inKorea" | "welcome";
export type TravelPhrase = { korean: string; meaning: string; situation: string };
export type ProverbEntry = {
  id: number;
  korean: string;
  meaningKo: string;
  meaningEn: string;
  kindKo: "속담" | "격언";
  kindEn: "Proverb" | "Maxim";
};

function parseWords(rows: string): ThemeWord[] {
  return rows.trim().split("\n").map((row) => {
    const [word, meaningKo, meaningEn, rawDifficulty] = row.split("|");
    return {
      word,
      meaningKo,
      meaningEn,
      difficulty: Number(rawDifficulty) as 1 | 2 | 3,
    };
  });
}

function parseSentences(rows: string): ThemeSentence[] {
  return rows.trim().split("\n").map((row) => {
    const [korean, translationEn, situationKo, situationEn] = row.split("|");
    return { korean, translationEn, situationKo, situationEn };
  });
}

function parseTravel(rows: string): TravelPhrase[] {
  return rows.trim().split("\n").map((row) => {
    const [korean, meaning, situation] = row.split("|");
    return { korean, meaning, situation };
  });
}

function parseProverbs(rows: string): ProverbEntry[] {
  return rows.trim().split("\n").map((row, id) => {
    const [korean, meaningKo, meaningEn, kind] = row.split("|");
    return {
      id,
      korean,
      meaningKo,
      meaningEn,
      kindKo: kind === "maxim" ? "격언" : "속담",
      kindEn: kind === "maxim" ? "Maxim" : "Proverb",
    };
  });
}

export const expandedThemeWords: Record<ThemeId, ThemeWord[]> = {
  travel: parseWords(`
입국|다른 나라 안으로 들어감|entry into a country|1
출국|나라 밖으로 나감|departure from a country|1
세관|짐과 물품을 검사하는 곳|customs|2
수하물|비행기에 싣는 여행 짐|baggage|2
탑승권|비행기 자리를 적은 표|boarding pass|2
비상구|위급할 때 나가는 문|emergency exit|2
출국장|해외로 떠나는 공항 구역|departure hall|2
입국장|해외에서 들어오는 공항 구역|arrival hall|2
환승|다른 교통편으로 갈아탐|transfer|2
직항|중간에 갈아타지 않는 항공편|direct flight|2
창가|창문 가까운 자리|window side|1
통로|사람이 지나다니는 길|aisle|1
좌석|앉는 자리|seat|1
지연|예정보다 늦어짐|delay|2
결항|예정된 운항이 취소됨|flight cancellation|2
승강장|기차나 지하철을 타는 곳|platform|2
정류장|버스가 서는 곳|bus stop|1
교통카드|대중교통 요금을 내는 카드|transit card|2
충전|카드에 돈을 더 넣음|top-up|1
노선도|교통 노선을 그린 지도|route map|2
막차|그날 마지막으로 다니는 차|last train or bus|2
첫차|그날 처음 다니는 차|first train or bus|2
급행|일부 역만 서는 빠른 열차|express train|2
일반열차|모든 역에 서는 열차|local train|2
환승역|다른 노선으로 갈아타는 역|transfer station|2
교차로|길이 서로 만나는 곳|intersection|2
횡단보도|사람이 길을 건너는 표시|crosswalk|2
육교|차도 위로 건너는 다리|pedestrian overpass|2
골목|건물 사이의 좁은 길|alley|1
큰길|폭이 넓은 주요 도로|main road|1
건너편|맞은쪽 자리|opposite side|1
왼쪽|왼편 방향|left|1
오른쪽|오른편 방향|right|1
직진|곧바로 앞으로 감|go straight|1
모퉁이|길이 꺾이는 귀퉁이|corner|1
신호등|차와 사람의 통행을 알리는 등|traffic light|2
프런트|숙소에서 안내를 맡는 곳|front desk|1
객실|손님이 머무는 방|guest room|1
열쇠|문을 열고 잠그는 도구|key|1
조식|아침에 먹는 식사|breakfast|1
체크인|숙소 이용을 시작하는 절차|check-in|2
체크아웃|숙소 이용을 마치는 절차|check-out|2
연박|여러 날 연이어 묵음|consecutive stay|2
빈방|손님이 없는 방|vacant room|1
수건|몸의 물기를 닦는 천|towel|1
세면도구|씻을 때 쓰는 물건|toiletries|2
세탁실|옷을 빨 수 있는 방|laundry room|2
난방|방을 따뜻하게 하는 장치|heating|2
냉방|방을 시원하게 하는 장치|air conditioning|2
와이파이|무선 인터넷 연결|Wi-Fi|1
비밀번호|본인만 아는 확인 문자열|password|2
주문|음식이나 물건을 요청함|order|1
반찬|밥과 함께 먹는 음식|side dish|1
물컵|물을 담아 마시는 컵|water glass|1
숟가락|음식을 떠먹는 도구|spoon|1
젓가락|음식을 집는 두 막대|chopsticks|1
맵기|음식이 매운 정도|spice level|2
알레르기|특정 물질에 생기는 과민 반응|allergy|2
채식|고기를 먹지 않는 식사|vegetarian food|2
포장|음식을 싸서 가져감|takeout|1
영수증|돈을 낸 내용을 적은 종이|receipt|2
잔돈|거슬러 받는 작은돈|change|1
할인|정해진 값에서 깎아 줌|discount|1
면세점|세금을 빼고 파는 가게|duty-free shop|2
기념품|여행을 기억하려고 사는 물건|souvenir|2
탈의실|옷을 갈아입어 보는 방|fitting room|2
현금|지폐와 동전으로 된 돈|cash|1
신용카드|나중에 값을 내는 결제 카드|credit card|2
입장료|시설에 들어갈 때 내는 돈|admission fee|2
관람|공연이나 전시를 구경함|viewing|2
해설|내용을 알기 쉽게 설명함|commentary|2
전시관|전시물을 보여 주는 건물|exhibition hall|2
공연장|공연을 보는 장소|performance venue|2
사진관|사진을 찍거나 인화하는 가게|photo studio|2
전망대|높은 곳에서 경치를 보는 곳|observatory|2
한옥|한국 전통 방식으로 지은 집|traditional Korean house|2
궁궐|옛 왕이 살던 큰 집|royal palace|2
사찰|불교 예배와 수행을 하는 곳|Buddhist temple|2
해변|바다와 맞닿은 모래나 자갈 땅|beach|1
등산로|산을 오르내리는 길|hiking trail|2
응급실|위급한 환자를 바로 치료하는 곳|emergency room|2
약국|약을 조제하고 파는 곳|pharmacy|1
진통제|통증을 줄이는 약|painkiller|2
분실물|잃어버린 물건|lost property|2
경찰서|경찰이 일하는 관공서|police station|2
신고|사건이나 상황을 기관에 알림|report|2
통역|서로 다른 언어를 바꾸어 전함|interpretation|2
도움|힘을 보태는 일|help|1
안전|위험이 없는 상태|safety|1
주의|조심하며 마음을 기울임|caution|1
`),
  business: parseWords(`
출근|일하러 회사에 감|going to work|1
퇴근|일을 마치고 회사에서 나옴|leaving work|1
사무실|사무 업무를 하는 공간|office|1
직원|회사에서 일하는 사람|employee|1
동료|같은 곳에서 함께 일하는 사람|coworker|1
상사|직장에서 직급이 높은 사람|supervisor|1
부서|업무별로 나눈 조직|department|2
인사팀|채용과 직원 관리를 맡는 팀|human resources team|2
영업팀|상품 판매를 맡는 팀|sales team|2
개발팀|제품과 기술을 만드는 팀|development team|2
회계팀|돈의 기록과 계산을 맡는 팀|accounting team|2
회의실|회의를 하는 방|meeting room|1
회의록|회의 내용을 적은 기록|meeting minutes|2
안건|회의에서 논의할 내용|agenda item|2
발언|회의에서 의견을 말함|statement|2
결론|논의 끝에 내린 판단|conclusion|2
합의|서로 의견을 맞춤|agreement|2
찬성|의견에 동의함|approval|1
반대|의견에 동의하지 않음|opposition|1
보류|결정을 뒤로 미룸|on hold|2
보고서|조사하거나 진행한 일을 적은 문서|report|2
기획서|새로운 일의 계획을 적은 문서|proposal|2
계약서|약속한 조건을 적은 문서|contract|2
견적서|예상 가격을 적은 문서|quotation|2
청구서|받아야 할 돈을 적은 문서|invoice|2
영수증|결제한 내용을 증명하는 문서|receipt|2
서명|이름을 직접 적어 확인함|signature|1
도장|문서에 찍는 이름 표식|seal|1
첨부파일|메일에 함께 보내는 파일|attachment|2
받은편지함|도착한 전자우편이 모이는 곳|inbox|2
참조|메일을 함께 받아보게 함|carbon copy|2
회신|받은 연락에 답함|reply|1
전달|받은 내용을 다른 사람에게 보냄|forwarding|1
마감일|일을 끝내기로 한 날짜|deadline|2
일정표|해야 할 시간과 일을 적은 표|schedule|2
우선순위|먼저 처리할 차례|priority|2
업무량|맡은 일의 분량|workload|2
진행률|전체 중 끝낸 정도|progress rate|2
완료|일을 모두 끝냄|completion|1
수정|잘못되거나 부족한 것을 고침|revision|1
검토|내용을 자세히 살펴봄|review|1
승인|괜찮다고 허락함|approval|1
반려|승인하지 않고 돌려보냄|rejection|2
협업|여러 사람이 함께 일함|collaboration|2
역할|맡아서 하는 일|role|1
책임|맡은 일을 다해야 하는 의무|responsibility|2
권한|일을 결정하고 처리할 수 있는 범위|authority|2
담당자|특정 일을 맡은 사람|person in charge|2
고객|상품이나 서비스를 이용하는 사람|customer|1
문의|알고 싶은 것을 물어봄|inquiry|1
상담|문제를 의논하고 안내받음|consultation|1
요청|필요한 일을 해 달라고 함|request|1
불만|마음에 들지 않는 점|complaint|1
해결책|문제를 풀 수 있는 방법|solution|2
만족도|서비스에 만족하는 정도|satisfaction|2
품질|제품이나 서비스의 좋고 나쁜 정도|quality|2
납기|물건을 넘겨주기로 한 기한|delivery date|2
배송|물건을 목적지로 보냄|delivery|1
재고|팔기 위해 보관한 물건|inventory|2
창고|물건을 쌓아 두는 곳|warehouse|1
발주|물건을 만들어 보내 달라고 주문함|purchase order|2
수량|물건의 개수나 양|quantity|1
단가|한 개당 가격|unit price|2
매출|상품을 팔아 얻은 금액|sales revenue|2
비용|일을 위해 쓰는 돈|cost|1
이익|수입에서 비용을 뺀 돈|profit|1
손실|잃거나 줄어든 금액|loss|1
예산|미리 정한 수입과 지출 계획|budget|2
결산|기간의 수입과 지출을 정리함|settlement of accounts|2
세금|국가나 지방자치단체에 내는 돈|tax|1
투자|미래의 이익을 위해 돈을 넣음|investment|2
성과|일을 해 얻은 결과|performance|1
목표|이루려고 정한 기준|goal|1
지표|상태를 판단하는 기준값|metric|2
자료|판단이나 연구에 쓰는 정보|data|1
통계|자료를 수치로 정리한 결과|statistics|2
분석|내용을 나누어 자세히 살핌|analysis|2
전략|목표를 이루기 위한 큰 계획|strategy|2
실행|계획한 일을 실제로 함|execution|1
개선|더 좋은 상태로 고침|improvement|1
위험|손해가 생길 가능성|risk|1
대응|상황에 맞추어 처리함|response|1
채용|새 직원을 뽑음|recruitment|2
면접|지원자를 만나 묻고 판단함|interview|2
연봉|한 해 동안 받는 급여|annual salary|2
휴가|일을 쉬기로 허락받은 기간|leave|1
복지|직원의 생활을 돕는 제도|benefits|2
교육|지식과 기술을 가르침|training|1
평가|성과나 수준을 판단함|evaluation|2
`),
  friends: parseWords(`
아침|해가 뜬 뒤의 이른 시간|morning|1
점심|낮에 먹는 식사|lunch|1
저녁|해가 질 무렵과 그때 먹는 식사|evening or dinner|1
주말|토요일과 일요일|weekend|1
평일|월요일부터 금요일까지|weekday|1
오늘|지금 보내는 날|today|1
내일|오늘의 다음 날|tomorrow|1
어제|오늘의 전날|yesterday|1
약속|만나거나 행동하기로 정함|appointment|1
모임|여러 사람이 함께 만나는 자리|gathering|1
생일|태어난 날을 해마다 기념하는 날|birthday|1
초대|사람을 모임에 오라고 부름|invitation|1
파티|여럿이 즐기는 모임|party|1
선물|축하나 감사의 뜻으로 주는 물건|gift|1
축하|좋은 일을 함께 기뻐함|congratulations|1
인사|만나거나 헤어질 때 하는 말과 행동|greeting|1
안부|잘 지내는지 묻는 소식|how someone is doing|1
소개|서로 알 수 있도록 설명함|introduction|1
연락처|전화번호나 전자우편 주소|contact information|2
메시지|짧게 보내는 글이나 말|message|1
전화|멀리 있는 사람과 말하는 통신|phone call|1
답장|받은 글이나 연락에 보내는 대답|reply|1
사진|카메라로 담은 모습|photograph|1
영상|움직이는 장면을 담은 화면|video|1
음악|소리를 리듬과 가락으로 표현한 것|music|1
노래방|반주에 맞춰 노래하는 곳|karaoke room|2
영화관|영화를 큰 화면으로 보는 곳|movie theater|2
공연|사람들 앞에서 음악이나 연기를 보임|performance|1
전시|작품이나 물건을 늘어놓아 보여 줌|exhibition|1
산책|천천히 걸으며 바람을 쐼|walk|1
소풍|야외로 나가 놀고 쉬는 일|picnic|1
등산|산에 오르는 활동|hiking|1
캠핑|야외에서 천막을 치고 지냄|camping|1
여행|다른 지역으로 떠나 보고 즐김|travel|1
운동|몸을 움직여 건강을 기르는 활동|exercise|1
축구|발로 공을 차는 경기|soccer|1
야구|방망이로 공을 치는 경기|baseball|1
농구|공을 바구니에 넣는 경기|basketball|1
수영|물속에서 몸을 움직여 나아감|swimming|1
요리|음식 만드는 일|cooking|1
그림|선과 색으로 나타낸 모습|drawing|1
독서|책을 읽는 일|reading|1
게임|규칙에 따라 즐기는 놀이|game|1
취미|즐거움을 위해 하는 활동|hobby|1
가족|한집에서 함께 살아가는 사람들|family|1
부모님|아버지와 어머니를 높여 이르는 말|parents|1
형제|형과 아우를 함께 이르는 말|siblings|1
자매|언니와 여동생을 함께 이르는 말|sisters|1
할머니|부모님의 어머니|grandmother|1
할아버지|부모님의 아버지|grandfather|1
아이|나이가 어린 사람|child|1
반려동물|사람과 함께 사는 동물|companion animal|2
강아지|개의 새끼나 작은 개|puppy|1
고양이|쥐를 잘 잡는 작은 반려동물|cat|1
기쁨|즐겁고 좋은 마음|joy|1
슬픔|마음이 아프고 괴로운 느낌|sadness|1
설렘|기대되어 마음이 두근거림|excitement|2
긴장|마음과 몸이 편하지 않고 굳음|nervousness|1
걱정|잘못될까 마음을 쓰는 상태|worry|1
위로|힘든 사람의 마음을 달래 줌|comfort|1
응원|힘을 내도록 격려함|encouragement|1
감사|고마움을 느끼고 표현함|gratitude|1
미안함|잘못하거나 폐를 끼쳐 마음이 불편함|feeling sorry|2
친절|다정하고 따뜻하게 대함|kindness|1
웃음|기쁘거나 재미있을 때 웃는 소리|laughter|1
농담|재미있게 하려고 하는 말|joke|1
비밀|남에게 알리지 않는 일|secret|1
믿음|상대가 진실하다고 여기는 마음|trust|1
우정|친구 사이의 따뜻한 정|friendship|1
추억|지나간 일을 떠올리는 기억|memory|1
날씨|비와 바람과 기온의 상태|weather|1
햇빛|해에서 오는 빛|sunlight|1
비바람|비와 바람이 함께 부는 날씨|wind and rain|2
눈사람|눈을 뭉쳐 사람처럼 만든 것|snowman|1
봄꽃|봄에 피는 꽃|spring flower|1
여름밤|여름철의 밤|summer night|1
가을길|가을 풍경이 있는 길|autumn road|1
겨울바다|겨울철의 바다|winter sea|2
거실|집에서 가족이 함께 쉬는 방|living room|1
주방|음식을 만드는 공간|kitchen|1
침실|잠을 자는 방|bedroom|1
베란다|건물 바깥으로 이어진 공간|balcony|1
책상|책을 읽거나 일을 하는 상|desk|1
의자|사람이 앉는 가구|chair|1
냉장고|음식을 차갑게 보관하는 기계|refrigerator|2
세탁기|옷을 빠는 기계|washing machine|2
청소|더러운 것을 깨끗하게 함|cleaning|1
빨래|옷이나 천을 빠는 일|laundry|1
휴식|하던 일을 멈추고 쉼|rest|1
`),
  reading: parseWords(`
한글|한국어를 적는 문자|Hangul|1
자음|공기의 흐름을 막아 내는 소리|consonant|1
모음|공기의 흐름을 막지 않는 소리|vowel|1
받침|글자 아래에 놓이는 자음|final consonant|1
음절|한 번에 소리 내는 말의 단위|syllable|1
낱말|뜻을 가진 말의 가장 작은 단위|word|1
문장|생각을 완결되게 나타낸 말|sentence|1
문단|여러 문장을 내용별로 묶은 단위|paragraph|2
제목|글의 이름|title|1
본문|문서의 중심이 되는 내용|body text|1
목차|글의 차례를 적은 목록|table of contents|2
쪽수|책의 페이지 번호|page number|1
표지|책의 겉을 싸는 부분|cover|1
작가|글이나 작품을 만든 사람|author|1
독자|글이나 책을 읽는 사람|reader|1
줄거리|이야기의 중요한 흐름|plot summary|2
주인공|이야기의 중심인물|main character|2
배경|사건이 벌어지는 때와 장소|setting|2
사건|이야기에서 일어나는 일|event|1
결말|이야기가 끝나는 부분|ending|1
시작|일이나 이야기가 처음 열림|beginning|1
중간|처음과 끝 사이|middle|1
요약|중요한 내용을 짧게 줄임|summary|1
질문|알고 싶은 것을 묻는 말|question|1
대답|물음에 답하는 말|answer|1
설명|내용을 알기 쉽게 풀어 말함|explanation|1
예시|이해를 돕기 위해 보이는 사례|example|1
의견|어떤 일에 대한 생각|opinion|1
사실|실제로 있었거나 있는 일|fact|1
상상|실제로 없는 일을 마음에 그려 봄|imagination|1
사전|낱말의 뜻과 쓰임을 모은 책|dictionary|1
번역|한 언어를 다른 언어로 바꿈|translation|1
발음|말소리를 내는 방법|pronunciation|1
철자|낱말을 이루는 글자의 차례|spelling|1
띄어쓰기|낱말 사이를 띄어 쓰는 규칙|spacing|2
문장부호|글의 뜻을 분명히 하는 기호|punctuation mark|2
쉼표|잠시 쉬어 읽음을 나타내는 기호|comma|1
마침표|문장이 끝남을 나타내는 기호|period|1
물음표|질문임을 나타내는 기호|question mark|1
느낌표|강한 느낌을 나타내는 기호|exclamation mark|1
간판|가게 이름이나 내용을 적은 판|signboard|1
안내판|길과 정보를 알려 주는 판|information sign|1
표지판|주의나 방향을 알리는 판|sign|1
출입구|들어가고 나오는 문|entrance and exit|1
입구|들어가는 곳|entrance|1
출구|나가는 곳|exit|1
계단|높이가 다른 곳을 오르내리는 시설|stairs|1
엘리베이터|사람을 위아래로 옮기는 기계|elevator|2
지하|땅의 아래쪽 공간|basement|1
옥상|건물 맨 위의 평평한 곳|rooftop|1
금연|담배를 피우지 못하게 함|no smoking|1
정숙|조용히 해야 함|quiet|1
무료|돈을 내지 않음|free of charge|1
유료|돈을 내야 함|paid|1
영업 중|가게가 문을 열고 장사하는 상태|open for business|1
준비 중|일을 시작하려고 마련하는 상태|preparing|1
매진|준비한 상품이 모두 팔림|sold out|2
품절|물건이 다 팔려 없음|out of stock|2
접수|신청이나 서류를 받아 처리함|reception|1
마감|접수나 영업을 끝냄|closed|1
신청서|신청 내용을 적는 문서|application form|2
이름|사람이나 사물을 부르는 말|name|1
주소|사는 곳이나 건물의 위치|address|1
생년월일|태어난 해와 달과 날|date of birth|2
전화번호|전화기에 정해진 숫자|phone number|2
서명란|이름을 직접 적는 자리|signature field|2
달력|날짜와 요일을 적은 표|calendar|1
요일|일주일의 각 날 이름|day of the week|1
날짜|해와 달과 날을 나타낸 수|date|1
시간|시각이나 기간|time|1
오전|밤 열두 시부터 낮 열두 시 전까지|a.m.|1
오후|낮 열두 시부터 밤 열두 시 전까지|p.m.|1
정오|낮 열두 시|noon|1
자정|밤 열두 시|midnight|1
이번 주|지금 지나고 있는 주|this week|1
다음 달|이번 달의 바로 뒤 달|next month|1
메뉴판|음식 이름과 가격을 적은 판|menu|1
재료|음식을 만드는 데 쓰는 것|ingredient|1
매운맛|혀가 화끈하게 느끼는 맛|spicy taste|1
단맛|설탕처럼 달게 느끼는 맛|sweet taste|1
짠맛|소금처럼 짜게 느끼는 맛|salty taste|1
신맛|식초처럼 시게 느끼는 맛|sour taste|1
쓴맛|약처럼 쓰게 느끼는 맛|bitter taste|1
뜨거움|온도가 매우 높은 상태|hot|1
차가움|온도가 매우 낮은 상태|cold|1
원산지|재료나 상품이 처음 나온 곳|country of origin|2
유통기한|식품을 판매할 수 있는 기한|expiration date|2
주의사항|조심해야 할 내용을 적은 것|precautions|2
사용법|물건을 쓰는 방법|instructions|1
`),
};

export const expandedThemeSentences: Record<ThemeId, ThemeSentence[]> = {
  travel: parseSentences(`
입국 심사대는 어느 쪽이에요?|Which way is immigration?|공항|At the airport
수하물 찾는 곳이 어디예요?|Where is baggage claim?|공항|At the airport
제 비행기가 한 시간 지연됐어요.|My flight has been delayed by one hour.|공항|At the airport
창가 자리로 바꿀 수 있을까요?|Could I change to a window seat?|공항|At the airport
이 열차는 서울역에 서나요?|Does this train stop at Seoul Station?|교통|Transit
교통카드 한 장 주세요.|One transit card, please.|교통|Transit
여기에서 두 번 갈아타면 돼요?|Do I transfer twice from here?|교통|Transit
막차가 몇 시에 출발해요?|What time does the last train leave?|교통|Transit
다음 교차로에서 오른쪽으로 가세요.|Turn right at the next intersection.|길 안내|Directions
이 길을 따라 계속 직진하세요.|Go straight along this road.|길 안내|Directions
체크인을 조금 일찍 할 수 있을까요?|Could I check in a little early?|숙소|At the hotel
수건을 두 장 더 가져다주세요.|Please bring two more towels.|숙소|At the hotel
와이파이가 연결되지 않아요.|The Wi-Fi is not connecting.|숙소|At the hotel
오늘 밤 빈방이 있나요?|Do you have a room available tonight?|숙소|At the hotel
고기가 들어가지 않은 음식이 있나요?|Do you have any dishes without meat?|식당|At a restaurant
땅콩 알레르기가 있어요.|I have a peanut allergy.|식당|At a restaurant
반찬을 조금 더 주실 수 있나요?|Could I have a little more side dish?|식당|At a restaurant
계산서를 따로 받을 수 있을까요?|Could we get separate bills?|계산|Paying
입어 볼 수 있는 곳이 어디예요?|Where can I try this on?|쇼핑|Shopping
다른 색도 보여 주세요.|Please show me another color.|쇼핑|Shopping
면세 서류를 받을 수 있나요?|Can I get the tax-free paperwork?|쇼핑|Shopping
이 공연은 몇 시에 끝나요?|What time does this performance end?|관람|Sightseeing
한국어 해설도 제공하나요?|Do you provide Korean commentary?|관람|Sightseeing
응급실에 가야 할 것 같아요.|I think I need to go to the emergency room.|긴급|Emergency
가방을 잃어버렸어요.|I lost my bag.|긴급|Emergency
경찰에 신고하고 싶어요.|I would like to report this to the police.|긴급|Emergency
천천히 다시 말씀해 주세요.|Please say that again slowly.|대화|Conversation
글로 적어 주실 수 있나요?|Could you write it down for me?|대화|Conversation
덕분에 무사히 도착했어요.|Thanks to you, I arrived safely.|감사|Gratitude
한국 여행이 정말 즐거워요.|I am really enjoying my trip to Korea.|감상|Sharing impressions
`),
  business: parseSentences(`
오늘 회의는 열 시에 시작합니다.|Today's meeting starts at ten.|회의|Meeting
안건을 먼저 확인해 주세요.|Please check the agenda first.|회의|Meeting
제 의견을 간단히 말씀드리겠습니다.|I will briefly share my opinion.|회의|Meeting
이 부분은 다음 회의까지 보류하겠습니다.|We will put this part on hold until the next meeting.|회의|Meeting
회의록을 오후에 공유하겠습니다.|I will share the minutes this afternoon.|회의|Meeting
첨부파일을 다시 보내 주시겠어요?|Could you send the attachment again?|이메일|Email
확인하는 대로 회신드리겠습니다.|I will reply as soon as I check it.|이메일|Email
담당자를 참조에 넣어 주세요.|Please copy the person in charge.|이메일|Email
마감일을 하루 연장할 수 있을까요?|Could we extend the deadline by one day?|일정|Scheduling
이번 주 우선순위를 정해 봅시다.|Let's set this week's priorities.|일정|Scheduling
현재 진행률은 팔십 퍼센트입니다.|The current progress is eighty percent.|진행|Progress
수정한 보고서를 검토해 주세요.|Please review the revised report.|문서|Documents
승인이 나면 바로 실행하겠습니다.|I will proceed as soon as it is approved.|승인|Approval
각자의 역할과 책임을 확인합시다.|Let's confirm everyone's roles and responsibilities.|협업|Collaboration
이 문제는 함께 해결할 수 있습니다.|We can solve this problem together.|협업|Collaboration
고객의 요청을 정확히 기록해 주세요.|Please record the customer's request accurately.|고객|Customer service
불편을 드려 정말 죄송합니다.|We sincerely apologize for the inconvenience.|고객|Customer service
가장 빠른 해결책을 찾아보겠습니다.|We will find the fastest solution.|고객|Customer service
배송 예정일을 확인해 주세요.|Please check the expected delivery date.|물류|Logistics
현재 창고 재고가 부족합니다.|The current warehouse inventory is low.|물류|Logistics
수량과 단가가 맞는지 확인해 주세요.|Please check the quantity and unit price.|구매|Purchasing
이번 달 매출이 목표를 넘었습니다.|This month's sales exceeded the target.|성과|Performance
예산 안에서 비용을 줄여야 합니다.|We need to reduce costs within the budget.|재무|Finance
자료를 분석한 뒤 전략을 세우겠습니다.|We will set a strategy after analyzing the data.|분석|Analysis
예상되는 위험과 대응 방안을 적어 주세요.|Please write down the expected risks and responses.|위험 관리|Risk management
면접 결과는 다음 주에 알려 드립니다.|We will share the interview result next week.|채용|Recruiting
신입 직원 교육은 월요일부터입니다.|New employee training begins Monday.|교육|Training
휴가 신청서를 제출했습니다.|I submitted my leave request.|인사|Human resources
좋은 성과를 내 주셔서 감사합니다.|Thank you for delivering great results.|격려|Recognition
내일까지 초안을 완성하겠습니다.|I will complete the draft by tomorrow.|약속|Commitment
`),
  friends: parseSentences(`
오늘 하루는 어떻게 보냈어요?|How did you spend your day?|안부|Checking in
주말에 시간 괜찮아요?|Are you free this weekend?|약속|Making plans
몇 시에 어디서 만날까요?|What time and where shall we meet?|약속|Making plans
조금 늦을 것 같아서 먼저 연락해요.|I think I will be a little late, so I am letting you know.|연락|Keeping in touch
생일을 진심으로 축하해요.|Happy birthday from the bottom of my heart.|축하|Celebration
작은 선물을 준비했어요.|I prepared a small gift.|선물|Giving a gift
친구들을 집에 초대했어요.|I invited my friends to my home.|모임|Gathering
처음 뵙겠습니다. 만나서 반가워요.|How do you do? Nice to meet you.|소개|Introduction
연락처를 알려 주실 수 있어요?|Could you share your contact information?|연락|Keeping in touch
메시지를 늦게 봐서 미안해요.|Sorry I saw your message late.|사과|Apology
같이 영화 보러 갈래요?|Would you like to go see a movie together?|취미|Leisure
요즘 어떤 음악을 자주 들어요?|What music do you listen to these days?|취미|Leisure
주말마다 공원에서 산책해요.|I walk in the park every weekend.|일상|Daily life
날씨가 좋으면 소풍을 가고 싶어요.|I want to go on a picnic if the weather is nice.|계획|Plans
새로 배운 요리를 만들어 봤어요.|I tried making a dish I just learned.|취미|Cooking
요즘 읽는 책이 정말 재미있어요.|The book I am reading these days is really interesting.|취미|Reading
가족 모두 잘 지내고 있어요.|Everyone in my family is doing well.|가족|Family
강아지와 매일 아침 산책해요.|I walk my dog every morning.|반려동물|Pets
걱정하지 마세요. 제가 도와줄게요.|Don't worry. I will help you.|위로|Comfort
당신의 새로운 도전을 응원해요.|I support your new challenge.|응원|Encouragement
도와줘서 정말 고마워요.|Thank you so much for helping me.|감사|Gratitude
어제는 제가 너무 미안했어요.|I was very sorry yesterday.|사과|Apology
그 이야기를 들으니 마음이 놓여요.|I feel relieved hearing that.|감정|Feelings
함께 웃었던 순간이 생각나요.|I remember the moments we laughed together.|추억|Memories
오늘 햇빛이 따뜻해서 좋아요.|I like how warm the sunlight is today.|날씨|Weather
비가 오니까 우산을 챙기세요.|It is raining, so take an umbrella.|날씨|Weather
집에 도착하면 연락해 주세요.|Please contact me when you get home.|배려|Care
저녁을 먹고 잠깐 쉴 거예요.|I will rest for a while after dinner.|일상|Daily life
방을 깨끗하게 청소했어요.|I cleaned the room thoroughly.|집|At home
다음 여행도 함께 가고 싶어요.|I want to travel together again.|우정|Friendship
`),
  reading: parseSentences(`
제목을 먼저 읽고 내용을 예상해 보세요.|Read the title first and predict the content.|읽기 전략|Reading strategy
모르는 낱말은 사전에서 찾아보세요.|Look up unfamiliar words in a dictionary.|어휘|Vocabulary
각 문단의 중요한 문장을 표시하세요.|Mark the important sentence in each paragraph.|독해|Reading comprehension
이야기의 줄거리를 짧게 요약해 보세요.|Summarize the story briefly.|요약|Summarizing
주인공은 왜 그런 선택을 했을까요?|Why did the main character make that choice?|생각하기|Thinking
글쓴이의 의견과 사실을 구분하세요.|Separate the writer's opinion from facts.|비판적 읽기|Critical reading
문장 끝에 마침표를 써 주세요.|Please put a period at the end of the sentence.|문장부호|Punctuation
질문에는 물음표를 사용합니다.|Use a question mark for a question.|문장부호|Punctuation
낱말 사이를 한 칸 띄어 쓰세요.|Leave one space between words.|띄어쓰기|Spacing
이 글자는 어떻게 발음하나요?|How is this letter pronounced?|발음|Pronunciation
입구는 건물 오른쪽에 있습니다.|The entrance is on the right side of the building.|안내판|Reading signs
비상구 표지판을 확인하세요.|Check the emergency exit sign.|안전|Safety
이곳은 금연 구역입니다.|This is a non-smoking area.|규칙|Rules
도서관에서는 조용히 해 주세요.|Please be quiet in the library.|규칙|Rules
오늘은 오후 여섯 시에 마감합니다.|We close at six this evening.|영업시간|Opening hours
준비 중이라서 아직 들어갈 수 없습니다.|It is still being prepared, so you cannot enter yet.|가게|At a shop
표가 모두 매진되었습니다.|All tickets have sold out.|공연|Performance
신청서에 이름과 주소를 적으세요.|Write your name and address on the form.|서류|Forms
아래 서명란에 서명해 주세요.|Please sign in the field below.|서류|Forms
회의는 다음 주 화요일 오전입니다.|The meeting is next Tuesday morning.|일정|Schedule
유통기한을 꼭 확인하세요.|Be sure to check the expiration date.|식품|Food labels
이 음식에는 땅콩이 들어 있습니다.|This food contains peanuts.|식품|Food labels
사용하기 전에 주의사항을 읽으세요.|Read the precautions before use.|설명서|Instructions
버튼을 삼 초 동안 눌러 주세요.|Hold the button for three seconds.|설명서|Instructions
매운맛은 세 단계로 고를 수 있습니다.|You can choose from three spice levels.|메뉴|Menu
원산지는 포장지 뒤에 적혀 있습니다.|The country of origin is written on the back of the package.|상품 정보|Product information
첫 문장부터 천천히 다시 읽어 보세요.|Read it again slowly from the first sentence.|읽기 연습|Reading practice
읽은 내용을 자신의 말로 설명해 보세요.|Explain what you read in your own words.|말하기|Speaking
오늘 배운 표현을 공책에 적어 보세요.|Write today's expressions in your notebook.|복습|Review
짧은 글도 매일 읽으면 실력이 늘어요.|Even reading a short text every day improves your skill.|학습|Learning
`),
};

export const expandedTravelPhrases: Record<TravelMode, TravelPhrase[]> = {
  inKorea: parseTravel(`
입국 심사대는 어디에 있나요?|Where is immigration?|Airport arrival
수하물 찾는 곳은 몇 번이에요?|Which baggage claim number is it?|Baggage claim
제 가방이 나오지 않았어요.|My bag has not come out.|Lost baggage
세관 신고서는 어디에서 작성해요?|Where do I fill out the customs form?|Customs
환승하려면 어디로 가야 하나요?|Where should I go to transfer?|Flight transfer
제 비행편이 지연되었나요?|Has my flight been delayed?|Flight status
창가 자리로 부탁드립니다.|A window seat, please.|Seat request
공항버스 표는 어디서 사요?|Where can I buy an airport bus ticket?|Airport transit
서울역까지 가는 표 한 장 주세요.|One ticket to Seoul Station, please.|Buying a ticket
교통카드를 충전하고 싶어요.|I would like to top up my transit card.|Transit card
이 지하철이 시청역에 가나요?|Does this subway go to City Hall Station?|Subway
어느 역에서 갈아타야 해요?|At which station should I transfer?|Subway transfer
급행과 일반열차 중 무엇을 타야 해요?|Should I take the express or local train?|Train choice
막차는 이미 끊겼나요?|Has the last train already left?|Late-night transit
택시 승강장이 어디예요?|Where is the taxi stand?|Taxi
미터기를 켜 주세요.|Please turn on the meter.|Taxi
여기서 내려 주세요.|Please let me off here.|Taxi
이 길이 맞는지 확인해 주세요.|Please check if this is the right way.|Directions
길을 건너서 왼쪽으로 가면 되나요?|Should I cross the street and turn left?|Directions
걸어서 갈 수 있는 거리인가요?|Is it within walking distance?|Directions
예약 번호를 보여 드릴게요.|I will show you my reservation number.|Hotel check-in
조용한 방으로 부탁드립니다.|A quiet room, please.|Room request
체크인을 일찍 할 수 있을까요?|Could I check in early?|Hotel check-in
체크아웃을 한 시간 늦출 수 있나요?|Could I check out one hour later?|Hotel check-out
방에 수건이 부족해요.|There are not enough towels in the room.|Hotel request
에어컨이 작동하지 않아요.|The air conditioner is not working.|Hotel issue
짐을 저녁까지 맡아 주세요.|Please hold my luggage until this evening.|Luggage storage
와이파이 연결 방법을 알려 주세요.|Please show me how to connect to the Wi-Fi.|Hotel amenities
두 명 자리 있나요?|Do you have a table for two?|Restaurant seating
창가 자리에 앉아도 될까요?|May we sit by the window?|Restaurant seating
추천 메뉴를 알려 주세요.|Please recommend a dish.|Ordering
고수는 빼 주세요.|Please leave out the cilantro.|Special request
해산물 알레르기가 있어요.|I have a seafood allergy.|Allergy
물은 무료인가요?|Is water free?|Restaurant
반찬을 더 주실 수 있나요?|Could I have more side dishes?|Restaurant
계산은 어디에서 하나요?|Where do I pay?|Payment
각자 계산할게요.|We will pay separately.|Payment
현금만 받나요?|Do you only accept cash?|Payment
영수증을 주세요.|Please give me a receipt.|Payment
이 옷을 입어 봐도 될까요?|May I try on these clothes?|Shopping
한 치수 큰 것으로 보여 주세요.|Please show me one size larger.|Shopping
다른 색이 있나요?|Do you have another color?|Shopping
조금 할인해 주실 수 있나요?|Could you give me a small discount?|Shopping
면세 환급은 어디에서 받아요?|Where can I get a tax refund?|Tax refund
사진 촬영이 가능한가요?|Is photography allowed?|Sightseeing
한국어 안내 책자가 있나요?|Do you have a Korean guide booklet?|Information desk
오늘 공연 표가 남아 있나요?|Are there tickets left for today's performance?|Tickets
전망대는 몇 층에 있어요?|What floor is the observatory on?|Sightseeing
약국에서 감기약을 사고 싶어요.|I would like to buy cold medicine at a pharmacy.|Pharmacy
배가 아픈데 진료받을 수 있나요?|I have a stomachache. Can I see a doctor?|Medical help
여권을 잃어버렸어요.|I lost my passport.|Emergency
가까운 경찰서가 어디예요?|Where is the nearest police station?|Emergency
통역을 부탁할 수 있을까요?|Could I ask for an interpreter?|Language help
휴대전화를 잠깐 빌릴 수 있을까요?|Could I borrow a phone for a moment?|Emergency
천천히 한 번 더 말해 주세요.|Please say it one more time slowly.|Conversation help
이 말을 한국어로 어떻게 해요?|How do you say this in Korean?|Language learning
종이에 적어 주시겠어요?|Could you write it on paper?|Conversation help
정말 친절하시네요.|You are very kind.|Compliment
덕분에 큰 도움이 됐어요.|You have been a great help.|Gratitude
한국에서 좋은 추억을 만들었어요.|I made wonderful memories in Korea.|Farewell
`),
  welcome: parseTravel(`
한국에서 오신 여행객이세요?|Are you a traveler from Korea?|Starting a conversation
제 나라에는 처음 오셨어요?|Is this your first time in my country?|Starting a conversation
여행은 지금까지 어떠세요?|How has your trip been so far?|Small talk
어느 지역을 방문하실 예정이에요?|Which area are you planning to visit?|Travel plans
제가 길을 알려 드릴까요?|May I show you the way?|Offering help
목적지가 어디인지 보여 주세요.|Please show me your destination.|Directions
이 버스를 타시면 돼요.|You can take this bus.|Transit help
두 정거장 뒤에 내리세요.|Get off after two stops.|Transit help
택시를 불러 드릴까요?|Shall I call a taxi for you?|Offering help
걸어서 십 분 정도 걸려요.|It takes about ten minutes on foot.|Directions
이 길은 밤에도 안전해요.|This road is safe at night too.|Safety
혼자 가기 어려우면 같이 가 드릴게요.|If it is hard to go alone, I will walk with you.|Offering help
이곳에서 가장 유명한 음식이에요.|This is the most famous food here.|Local food
맵지 않은 메뉴도 추천해 드릴게요.|I will recommend a non-spicy menu too.|Food recommendation
알레르기가 있는 음식이 있나요?|Are there any foods you are allergic to?|Hospitality
이 식당은 현지인들이 자주 가요.|Locals often visit this restaurant.|Local tip
제가 주문을 도와드릴게요.|I will help you order.|Restaurant help
계산 방법을 설명해 드릴게요.|I will explain how to pay.|Payment help
시장에서는 현금을 준비하는 게 좋아요.|It is good to carry cash at the market.|Shopping tip
이 기념품이 선물로 인기가 많아요.|This souvenir is popular as a gift.|Shopping tip
사진을 찍어 드릴까요?|Would you like me to take a photo?|Offering help
이곳은 해 질 무렵이 가장 아름다워요.|This place is most beautiful at sunset.|Local tip
주말에는 사람이 많이 붐벼요.|It gets very crowded on weekends.|Local tip
아침 일찍 가면 한적해요.|It is quiet if you go early in the morning.|Local tip
무료 지도를 하나 가져가세요.|Please take a free map.|Visitor information
관광 안내소가 바로 건너편에 있어요.|The tourist information center is just across the street.|Visitor information
와이파이 비밀번호를 알려 드릴게요.|I will tell you the Wi-Fi password.|Amenities
휴대전화 충전이 필요하세요?|Do you need to charge your phone?|Offering help
물을 더 드릴까요?|Would you like more water?|Hospitality
편하게 쉬었다 가세요.|Please rest here comfortably before you go.|Hospitality
몸이 불편한 곳이 있으세요?|Are you feeling unwell anywhere?|Medical help
근처 약국까지 안내해 드릴게요.|I will guide you to a nearby pharmacy.|Medical help
여권을 잃어버렸다면 경찰서에 가야 해요.|If you lost your passport, you need to go to the police station.|Emergency help
한국어 통역이 필요하신가요?|Do you need a Korean interpreter?|Language help
천천히 말씀하셔도 괜찮아요.|It is okay to speak slowly.|Language exchange
제가 아는 한국어로 설명해 볼게요.|I will try to explain in the Korean I know.|Language exchange
한국에서는 어느 계절을 좋아하세요?|Which season do you like in Korea?|Small talk
좋아하는 한국 음식이 뭐예요?|What is your favorite Korean food?|Small talk
제가 한국어를 연습해도 될까요?|May I practice Korean with you?|Language exchange
발음이 틀리면 고쳐 주세요.|Please correct me if my pronunciation is wrong.|Language exchange
제 이름을 한국어로 적어 주세요.|Please write my name in Korean.|Language exchange
함께 사진을 찍어도 될까요?|May we take a photo together?|Making friends
오늘 만나서 정말 반가웠어요.|It was really nice meeting you today.|Farewell
남은 여행도 즐겁게 보내세요.|Enjoy the rest of your trip.|Farewell
조심해서 숙소로 돌아가세요.|Get back to your accommodation safely.|Farewell
다음에 한국에서 다시 만나요.|Let's meet again in Korea next time.|Farewell
제 도시를 기억해 주세요.|Please remember my city.|Farewell
여행 중 도움이 필요하면 연락하세요.|Contact me if you need help during your trip.|Offering help
좋은 추억을 많이 만드시길 바라요.|I hope you make many good memories.|Best wishes
한국에 돌아가셔도 건강하세요.|Stay healthy when you return to Korea.|Farewell
다음에는 친구들과 함께 오세요.|Come again with your friends next time.|Invitation
우리 동네를 좋아해 주셔서 고마워요.|Thank you for liking our neighborhood.|Gratitude
한국 문화를 더 배우고 싶어요.|I want to learn more about Korean culture.|Cultural exchange
추천할 한국 드라마가 있나요?|Is there a Korean drama you recommend?|Cultural exchange
요즘 한국에서 인기 있는 노래가 뭐예요?|What song is popular in Korea these days?|Cultural exchange
서로의 언어를 함께 가르쳐요.|Let's teach each other our languages.|Language exchange
편안하게 말씀해 주세요.|Please feel free to speak comfortably.|Hospitality
필요한 것이 있으면 바로 알려 주세요.|Let me know right away if you need anything.|Hospitality
즐거운 하루 보내세요.|Have a wonderful day.|Farewell
안전하고 행복한 여행 되세요.|Have a safe and happy trip.|Best wishes
`),
};

export const proverbEntries: ProverbEntry[] = parseProverbs(`
가는 말이 고와야 오는 말이 곱다|내가 남에게 좋게 말해야 남도 나에게 좋게 말한다.|Kind words invite kind words.|proverb
가랑비에 옷 젖는 줄 모른다|작은 변화도 계속되면 큰 결과가 된다.|Small changes accumulate before you notice.|proverb
개구리 올챙이 적 생각 못 한다|형편이 나아진 뒤 어려웠던 때를 잊으면 안 된다.|Do not forget your humble beginnings.|proverb
고래 싸움에 새우 등 터진다|강한 이들의 다툼에 약한 사람이 피해를 본다.|The weak can suffer when the powerful fight.|proverb
고생 끝에 낙이 온다|어려움을 견디면 좋은 날이 온다.|Joy comes after hardship.|proverb
공든 탑이 무너지랴|정성을 다한 일은 쉽게 실패하지 않는다.|Careful effort builds lasting results.|proverb
구슬이 서 말이라도 꿰어야 보배다|좋은 재료도 잘 활용해야 가치가 있다.|Potential becomes valuable through action.|proverb
그림의 떡|보기에는 좋지만 실제로 얻을 수 없다.|Something desirable but unattainable.|proverb
금강산도 식후경|아무리 좋은 일도 배가 불러야 즐길 수 있다.|Even fine sights are better after a meal.|proverb
급할수록 돌아가라|서두를수록 차분하고 안전하게 해야 한다.|The more urgent it is, the more carefully you should proceed.|proverb
낮말은 새가 듣고 밤말은 쥐가 듣는다|비밀스러운 말도 누군가 들을 수 있으니 조심해야 한다.|Be careful because private words may be overheard.|proverb
내 코가 석 자|남을 도울 형편이 되지 않을 만큼 내 사정이 급하다.|My own troubles demand attention first.|proverb
누워서 떡 먹기|하기가 아주 쉬운 일이다.|It is extremely easy.|proverb
달도 차면 기운다|모든 일은 가장 높은 때가 지나면 내려온다.|Everything wanes after reaching its peak.|proverb
도토리 키 재기|비슷비슷한 사람끼리 비교하는 일이다.|It is a comparison among near equals.|proverb
돌다리도 두들겨 보고 건너라|확실해 보여도 다시 확인하고 행동해야 한다.|Check even what seems certain before acting.|proverb
등잔 밑이 어둡다|가까이 있는 것을 오히려 알아차리지 못한다.|What is nearest can be hardest to notice.|proverb
말 한마디에 천 냥 빚도 갚는다|좋은 말은 큰 문제도 풀 수 있다.|A thoughtful word can resolve a great debt.|proverb
모로 가도 서울만 가면 된다|방법이 달라도 목적을 이루면 된다.|Different routes can reach the same goal.|proverb
믿는 도끼에 발등 찍힌다|믿었던 사람이나 일에 뜻밖의 피해를 본다.|Betrayal often comes from where trust was placed.|proverb
백지장도 맞들면 낫다|쉬운 일도 함께하면 더 수월하다.|Even light work is easier together.|proverb
보기 좋은 떡이 먹기도 좋다|내용뿐 아니라 겉모습도 중요하다.|Good presentation adds to good substance.|proverb
비 온 뒤에 땅이 굳어진다|어려움을 겪고 나면 관계나 일이 더 단단해진다.|Hardship can make things stronger.|proverb
빈 수레가 요란하다|실속 없는 사람이 더 떠들기 쉽다.|Empty vessels make the most noise.|proverb
서당 개 삼 년이면 풍월을 읊는다|오래 보고 들으면 자연히 배우게 된다.|Long exposure leads naturally to learning.|proverb
세 살 버릇 여든까지 간다|어릴 때 익힌 습관은 오래간다.|Early habits last a lifetime.|proverb
소 잃고 외양간 고친다|일이 벌어진 뒤에야 뒤늦게 대비한다.|Repairing things after the damage is done.|proverb
시작이 반이다|일을 시작하면 이미 절반은 이룬 셈이다.|A good start is half the work.|proverb
아는 길도 물어 가라|잘 아는 일도 확인하며 조심해야 한다.|Ask and check even on a familiar road.|proverb
아니 땐 굴뚝에 연기 나랴|아무 원인 없이 결과가 생기지는 않는다.|There is no smoke without a cause.|proverb
열 번 찍어 안 넘어가는 나무 없다|꾸준히 노력하면 어려운 일도 이룰 수 있다.|Persistence can overcome a hard task.|proverb
옷이 날개다|차림새가 사람의 인상을 크게 바꾼다.|Clothes can transform an impression.|proverb
우물 안 개구리|좁은 경험만으로 세상을 판단하는 사람이다.|A narrow view mistakes its limits for the world.|proverb
원숭이도 나무에서 떨어진다|능숙한 사람도 실수할 때가 있다.|Even experts make mistakes.|proverb
윗물이 맑아야 아랫물이 맑다|윗사람이 바르게 해야 아랫사람도 바르게 한다.|Good leadership sets the tone below.|proverb
작은 고추가 맵다|몸집이 작아도 능력이 뛰어날 수 있다.|Small size can hide great strength.|proverb
종로에서 뺨 맞고 한강에서 눈 흘긴다|화낼 대상에게 못 하고 다른 데서 분풀이한다.|Do not take anger out on the wrong person.|proverb
지렁이도 밟으면 꿈틀한다|약한 사람도 지나치게 괴롭히면 맞선다.|Even the meek resist when pushed too far.|proverb
천 리 길도 한 걸음부터|큰일도 작은 시작에서 이루어진다.|A long journey begins with one step.|proverb
티끌 모아 태산|작은 것도 모이면 큰 것이 된다.|Small gains accumulate into something great.|proverb
하늘의 별 따기|이루기가 매우 어려운 일이다.|It is almost impossibly difficult.|proverb
하룻강아지 범 무서운 줄 모른다|경험이 적으면 위험을 모르고 덤빈다.|Inexperience may fail to recognize danger.|proverb
호랑이도 제 말 하면 온다|어떤 사람을 말할 때 그 사람이 나타나기도 한다.|Speak of someone and they may appear.|proverb
호미로 막을 것을 가래로 막는다|작을 때 처리하지 않아 일이 커진다.|A small neglected problem becomes a big one.|proverb
웃는 얼굴에 침 못 뱉는다|친절하게 대하는 사람에게 모질게 하기 어렵다.|Kindness is difficult to answer with cruelty.|proverb
가는 날이 장날이다|우연히 예상하지 못한 일을 만난다.|You arrive just when an unexpected event occurs.|proverb
꿩 대신 닭|꼭 맞는 것이 없을 때 비슷한 것으로 대신한다.|Use the next best thing when the ideal is unavailable.|proverb
남의 떡이 더 커 보인다|남이 가진 것이 내 것보다 좋아 보이기 쉽다.|What others have often looks better.|proverb
놓친 고기가 더 크다|놓친 기회가 실제보다 더 좋아 보인다.|A missed chance often seems larger afterward.|proverb
될성부른 나무는 떡잎부터 알아본다|잘될 사람은 어릴 때부터 좋은 기미가 보인다.|Early signs often reveal future promise.|proverb
땅 짚고 헤엄치기|아주 쉽고 확실한 일이다.|It is an easy and certain task.|proverb
배보다 배꼽이 더 크다|주된 것보다 딸린 비용이나 일이 더 크다.|The extra cost exceeds the main value.|proverb
병 주고 약 준다|해를 끼치고 나서 도와주는 척한다.|Someone causes harm and then pretends to help.|proverb
사공이 많으면 배가 산으로 간다|지시하는 사람이 많으면 일이 엉뚱하게 된다.|Too many leaders can send the work astray.|proverb
산 넘어 산|어려움을 넘으면 또 다른 어려움이 나타난다.|One difficulty follows another.|proverb
새 발의 피|전체에 비하면 아주 적은 양이다.|It is only a tiny fraction of the whole.|proverb
콩 심은 데 콩 나고 팥 심은 데 팥 난다|원인에 따라 알맞은 결과가 생긴다.|Results follow from their causes.|proverb
한 술 밥에 배부르랴|큰일은 한 번의 노력으로 이루어지지 않는다.|Great work cannot be completed in one attempt.|proverb
가는 정이 있어야 오는 정이 있다|내가 정을 베풀어야 상대도 정을 돌려준다.|Warmth given invites warmth returned.|proverb
바늘 도둑이 소도둑 된다|작은 나쁜 습관이 큰 잘못으로 자랄 수 있다.|Small wrongdoing can grow into greater wrongdoing.|proverb
발 없는 말이 천 리 간다|말은 아주 빠르게 널리 퍼진다.|Words travel very far and fast.|proverb
뿌린 대로 거둔다|자신의 행동에 맞는 결과를 얻게 된다.|You reap what you sow.|proverb
실패는 끝이 아니라 배움의 시작이다|실패에서 원인을 배우면 다음 도전이 나아진다.|Failure begins learning rather than ending effort.|maxim
꾸준함은 재능을 이기는 힘이 된다|작은 노력을 계속하면 큰 능력으로 자란다.|Consistency can become stronger than talent.|maxim
오늘의 한 걸음이 내일의 길을 만든다|지금의 작은 실천이 미래를 바꾼다.|Today's small step creates tomorrow's path.|maxim
정확함을 먼저 익히면 속도는 따라온다|바른 습관을 만들면 빠르기는 자연히 높아진다.|Speed follows once accuracy becomes a habit.|maxim
모르는 것을 묻는 일은 성장의 시작이다|질문해야 새로운 지식을 제대로 배울 수 있다.|Growth begins with asking what you do not know.|maxim
쉬어 가는 것은 멈추는 것이 아니다|휴식은 더 오래 나아가기 위한 과정이다.|Resting is not the same as giving up.|maxim
작은 성공을 자주 기록하라|성장한 흔적을 보면 계속할 힘이 생긴다.|Record small wins to sustain motivation.|maxim
비교보다 어제의 나를 넘어라|다른 사람보다 자신의 성장을 기준으로 삼아야 한다.|Measure progress against your past self.|maxim
완벽한 때를 기다리지 말고 시작하라|준비가 부족해도 행동하며 배울 수 있다.|Start instead of waiting for a perfect moment.|maxim
천천히 가도 방향이 맞으면 도착한다|속도보다 올바른 방향과 지속이 중요하다.|A steady pace in the right direction still arrives.|maxim
집중한 십 분이 흐트러진 한 시간보다 낫다|짧아도 온전히 몰입한 시간이 효과적이다.|Ten focused minutes can beat a distracted hour.|maxim
배운 것은 써 볼 때 내 것이 된다|지식을 실제로 사용해야 오래 기억한다.|Knowledge becomes yours when you use it.|maxim
좋은 질문은 좋은 답보다 오래 남는다|생각을 여는 질문은 깊은 배움을 만든다.|A good question can outlast a good answer.|maxim
기록은 기억보다 오래간다|중요한 내용은 적어 두어야 다시 활용할 수 있다.|A record lasts longer than memory.|maxim
실수한 글자는 다시 칠수록 선명해진다|오류를 고치는 반복이 정확한 기억을 만든다.|Corrected mistakes build clearer memory.|maxim
어려운 날에도 한 줄은 쓸 수 있다|아주 작은 실천으로도 흐름을 이어 갈 수 있다.|Even on a hard day you can write one line.|maxim
배움의 속도는 사람마다 다르다|자신에게 맞는 리듬을 존중해야 오래 배운다.|Everyone learns at a different pace.|maxim
친절한 말은 짧아도 오래 남는다|작은 배려의 표현이 깊은 인상을 준다.|A brief kind word can leave a lasting mark.|maxim
듣고 따라 하고 직접 써 보라|여러 감각을 함께 쓰면 언어가 더 잘 익는다.|Listen, repeat, and write it yourself.|maxim
매일의 반복이 낯선 글자를 친구로 만든다|꾸준히 접하면 어려운 문자도 자연스러워진다.|Daily practice turns unfamiliar letters into friends.|maxim
`);
