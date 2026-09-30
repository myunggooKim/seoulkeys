/** Display-only definitions. Never used to normalize or score typed text. */
export const coreGlossary = `
하마|hippopotamus|큰 몸과 짧은 다리를 가진 물가의 동물
나라|country|국민이 모여 사는 국가
머리|head|몸의 맨 위에 있는 부분
오리|duck|물에서 헤엄치는 새
허리|waist|몸통 가운데의 잘록한 부분
미리|in advance|어떤 일이 일어나기 전에
이마|forehead|눈썹 위의 얼굴 부분
아마|probably|그럴 가능성이 높다는 말
어머니|mother|자기를 낳거나 길러 준 여성
나이|age|살아온 해의 수
오이|cucumber|길쭉하고 초록색인 채소
모이|bird feed|새가 먹는 먹이
바다|sea|넓게 펼쳐진 짠물
사자|lion|갈기가 있는 큰 고양잇과 동물
가게|shop|물건을 파는 곳
제비|swallow (bird)|날개가 길고 꼬리가 갈라진 작은 새
자매|sisters|여자 형제
개미|ant|무리를 지어 사는 작은 곤충
아기|baby|태어난 지 얼마 안 된 어린아이
소리|sound|귀로 들리는 것
여자|woman|성인 여성
고래|whale|바다에 사는 큰 포유동물
다리|leg / bridge|몸을 지탱하는 부분 또는 건너가는 구조물
노래|song|가락에 맞추어 부르는 음악
나무|tree|줄기와 가지가 있는 식물
우유|milk|소의 젖으로 만든 음료
구두|dress shoes|격식을 갖추어 신는 신발
치마|skirt|허리 아래를 둘러 입는 옷
포도|grapes|송이로 열리는 둥근 과일
타조|ostrich|날지 못하고 빨리 달리는 큰 새
커피|coffee|커피콩으로 만든 음료
기차|train|철길 위를 달리는 교통수단
쿠키|cookie|작고 바삭하게 구운 과자
주머니|pocket|작은 물건을 넣는 공간
고추|chili pepper|맵거나 단맛이 나는 길쭉한 열매
파도|wave|바닷물이 높아졌다 낮아지는 움직임
산|mountain|땅이 높이 솟아 있는 곳
달|moon|지구 주위를 도는 천체
밤|night|해가 진 뒤의 어두운 시간
공|ball|둥글게 만들어 놀이나 운동에 쓰는 물건
문|door|드나들 수 있도록 여닫는 것
눈|eye / snow|보는 신체 기관 또는 겨울에 내리는 흰 결정
몸|body|사람이나 동물의 신체
강|river|길게 흐르는 큰 물줄기
방|room|집 안에서 벽으로 나뉜 공간
길|road / way|사람이나 차가 다니는 통로
봄|spring|겨울과 여름 사이의 계절
별|star|밤하늘에서 빛나는 천체
책|book|글이나 그림을 모아 묶은 것
밥|cooked rice / meal|익힌 쌀 또는 끼니로 먹는 음식
옷|clothes|몸에 입는 것
맛|taste|음식 등을 혀로 느끼는 감각
빛|light|눈으로 볼 수 있게 하는 밝음
국|soup|물이나 육수에 재료를 넣고 끓인 음식
숲|forest|나무가 많이 자라는 곳
낮|daytime|해가 떠 있는 밝은 시간
낯|face|사람의 얼굴
밭|field|작물을 기르는 땅
앞|front|바라보는 방향에 있는 쪽
히읗|letter ㅎ|한글 자음 ㅎ의 이름
까치|magpie|검고 흰 깃털을 가진 새
토끼|rabbit|긴 귀와 짧은 꼬리를 가진 동물
아빠|dad|아버지를 친근하게 부르는 말
쓰다|to write / use|글자를 적거나 도구 등을 이용하다
찌개|stew|재료와 적은 국물을 함께 끓인 음식
뿌리|root|식물의 땅속 부분 또는 어떤 것의 근본
짜장|black bean sauce|중국식 볶은 춘장 소스
쑥|mugwort|향이 나는 풀로 음식에도 쓰는 식물
딸기|strawberry|작은 씨가 박힌 붉은 과일
꼬마|little child|어린아이를 친근하게 이르는 말
빨리|quickly|시간을 짧게 들여서
깨끗|clean|더러움이 없고 말끔한 상태
한국|Korea|한반도에 있는 나라
서울|Seoul|대한민국의 수도
여행|travel|다른 곳에 가서 구경하거나 머무는 일
친구|friend|가깝게 지내는 사람
음악|music|소리와 리듬으로 표현하는 예술
사진|photo|카메라로 찍은 모습
행복|happiness|기쁘고 만족스러운 마음
자연|nature|사람이 만들지 않은 세상과 환경
도서관|library|책을 모아 읽거나 빌려 주는 곳
컴퓨터|computer|정보를 처리하는 전자 기기
스마트폰|smartphone|전화와 여러 앱을 쓰는 휴대 기기
비행기|airplane|하늘을 나는 교통수단
지하철|subway|주로 땅 아래를 달리는 도시 철도
학교|school|학생들이 배우는 곳
이야기|story|말이나 글로 전하는 내용
`.trim().split('\n').map((line) => {
  const [word, meaningEn, meaningKo] = line.split('|');
  return { word, meaningEn, meaningKo };
});
