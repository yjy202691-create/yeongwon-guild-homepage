const ISLAND_DATA = [
    {
        id: 'island1',
        name: '아르카디아',
        slug: 'arcadia', // 각 섬 상세 페이지 URL에 사용될 고유 이름 (소문자, 공백 없이)
        description: '위르드의 중심 도시로 많은 기반 시설이 집중되어 있으며, 최초의 개척자 마을이다.',
        requirements: {
            level: '없음',
            recommended_bp: '없음',
            required_bp: 0 // 요구 전투력 0 (항해사 제한 없음)
        },
        map: {
            image: 'island1_map.png',
            width: 1561,
            height: 1098
        },
        icon: 'island1.png',
        position: { x: 45, y: 41, tooltip: 'right' }, // ⭐ 지도 상 위치 (추후 조정) ⭐
        details: {
            npcs: [] // NPC 정보 없음
        }
    },
    {
        id: 'island2',
        name: '플라텀',
        slug: 'flatum',
        description: '견습 개척자들이 수련을 위해 방문하는 견습용 섬으로 푸른 나무들이 넘쳐나는 드넓은 숲이 펼쳐져 있다.',
        requirements: {
            level: 1,
            recommended_bp: 10,
            required_bp: 0 // 요구 전투력 0 (항해사 제한 없음)
        },
        map: {
            image: 'island2_map.png',
            width: 1228,
            height: 896
        },
        icon: 'island2.png',
        position: { x: 32, y: 49, tooltip: 'right' },
        details: { npcs: [] }
    },
    {
        id: 'island3',
        name: '폴리아',
        slug: 'polia',
        description: '견습 개척자들이 수련을 위해 방문하는 견습용 섬으로 붉은 낙엽의 가을 분위기가 물씬 풍긴다.',
        requirements: {
            level: 1,
            recommended_bp: 10,
            required_bp: 0
        },
        map: {
            image: 'island3_map.png',
            width: 1252,
            height: 1095
        },
        icon: 'island3.png',
        position: { x: 38, y: 25, tooltip: 'right' },
        details: { npcs: [] }
    },
    {
        id: 'island4',
        name: '벨리에',
        slug: 'bellie',
        description: '초보 개척자에게 추천되는 평화로운 섬으로 넓은 평원과 목장이 자리하고 있다.',
        requirements: {
            level: 5,
            recommended_bp: 35,
            required_bp: 25
        },
        map: {
            image: 'island4_map.png',
            width: 870,
            height: 1127
        },
        icon: 'island4.png',
        position: { x: 58, y: 56, tooltip: 'left' },
        details: { npcs: [] }
    },
    {
        id: 'island5',
        name: '플로라',
        slug: 'flora',
        description: '꽃이 아름답게 개화한 섬으로 꽃 향기가 가득하다.',
        requirements: {
            level: 7,
            recommended_bp: 50,
            required_bp: 40
        },
        map: {
            image: 'island5_map.png',
            width: 688,
            height: 657
        },
        icon: 'island5.png',
        position: { x: 62, y: 33, tooltip: 'left' },
        details: { npcs: [] }
    },
    {
        id: 'island6',
        name: '루마라',
        slug: 'lumara',
        description: '울창한 숲과 거대한 자연으로 가득찬 섬으로 어마어마한 유적이 있다고 한다.',
        requirements: {
            level: 10,
            recommended_bp: 80,
            required_bp: 65
        },
        map: {
            image: 'island6_map.png',
            width: 1083,
            height: 1149
        },
        icon: 'island6.png',
        position: { x: 71, y: 48, tooltip: 'left' },
        details: { npcs: [] }
    },
    {
        id: 'island7',
        name: '페트람',
        slug: 'petram',
        description: '노란빛 단풍이 만개한 고산지대로 관광객들의 많은 사랑을 받고 있다.',
        requirements: {
            level: 15,
            recommended_bp: 130,
            required_bp: 115
        },
        map: {
            image: 'island7_map.png',
            width: 537,
            height: 1227
        },
        icon: 'island7.png',
        position: { x: 45, y: 65, tooltip: 'right' },
        details: { npcs: [] }
    },
    {
        id: 'island8',
        name: '세르툼',
        slug: 'sertum',
        description: '온통 사막으로 이루어진 건조한 섬이다. 특징으로는 매우 커다란 오아시스가 있다.',
        requirements: {
            level: 20,
            recommended_bp: 200,
            required_bp: 180
        },
        map: {
            image: 'island8_map.png',
            width: 743,
            height: 942
        },
        icon: 'island8.png',
        position: { x: 72, y: 65, tooltip: 'left' },
        details: {
            npcs: [
                { name: '대장장이', coords: '677 73 254' },
                { name: '전리품 상인', coords: '677 73 254' },
                { name: '포션 상인', coords: '677 73 254' },
                { name: '낚시꾼', coords: '646 72 243' },
                { name: '멜', coords: '690 80 190' },
                { name: '코스', coords: '629 73 183' },
                { name: '아툰', coords: '631 73 197' },
                { name: '테론', coords: '597 72 190' },
                { name: '마테르', coords: '576 73 181' },
                { name: '테르크', coords: '586 71 167' },
                { name: '트레드', coords: '592 72 130' }
            ]
        }
    },
    {
        id: 'island9',
        name: '엘도라도',
        slug: 'eldorado',
        description: '황금의 도시라고 불리는 부유한 도시섬이다. 금빛의 찬란함 속에 항상 밝게 빛난다.',
        requirements: {
            level: 25,
            recommended_bp: 300,
            required_bp: null, // 요구 전투력 명시 안됨
            special_entry: '세르툼에서 전조 퀘스트를 완료하고, 항해사에게 말을 걸어야 엘도라도 섬이 열립니다.'
        },
        map: {
            image: 'island9_map.png',
            width: 819,
            height: 903
        },
        icon: 'island9.png',
        position: { x: 55, y: 78, tooltip: 'top' },
        details: { npcs: [] }
    },
    {
        id: 'island10',
        name: '[이벤트섬] 솔티드',
        slug: 'salted_event',
        description: '핫 썸머! 위르드 온라인 여름 이벤트! 햇빛이 쨍쨍한 여름! 베일에 싸여져 있던 미지의 섬, 솔티드가 나타났다고 합니다! 더군다나 5레벨 이상의 개척자라면 모두 항해할 수 있다고 하는데...! 솔티드에서 빙수 상인과 주변 주민들을 도우며 여러 희귀한 아이템들을 획득해 보세요!',
        requirements: {
            level: 5,
            recommended_bp: null,
            required_bp: null,
            event_period: '2025년 8월 2일 ~ 8월 30일 점검 전까지',
            current_status: '이벤트 종료로 인해 항해 지도에서 섬의 위치가 사라졌고, 탐험이 불가능 하다.'
        },
        map: null, // 이벤트 섬이라 맵 파일 없음
        icon: 'island10.png',
        position: { x: 80, y: 10, tooltip: 'left' },
        details: { npcs: [] }
    },
    {
        id: 'island11',
        name: '볼케인',
        slug: 'volkane',
        description: '지하에서 들끓는 용암이 흐르며 만들어진 섬으로 항상 공기가 일렁이며 재가 휘날린다. 2025년 8월 10일에 처음 발견 된 서브 섬으로 여러 불 속성 몬스터들이 등장한다. 볼케인은 인적이 끊긴 만큼 자원이 풍부해 오직 레벨 3 채집물들만이 등장하는 것으로 알려져있다.',
        requirements: {
            level: 30,
            recommended_bp: 450,
            required_bp: 350,
            gathering_Lv: '3레벨'
        },
        map: {
            image: 'island11_map.png',
            width: 1088,
            height: 700
        },
        icon: 'island11.png',
        position: { x: 23, y: 32, tooltip: 'right' },
        details: { npcs: [] }
    },
    {
        id: 'island12',
        name: '에덴',
        slug: 'eden',
        description: '꽁꽁 언 바다로 둘러쌓인 한겨울의 설원 섬이다. 특이하게도, 몇몇 사람들 사이에서는 낙원이라고 불리운다. 25년 9월 12일날 새로 생긴 메인 섬으로 아르카디아의 좌측 아래! 꽁꽁 언 한겨울의 섬, 에덴이 등장했습니다! 에덴은 레벨 35 이상의 개척자들이 탐험할 수 있는 섬으로, 여러 물 속성 몬스터들이 등장합니다. 에덴은 최초로 일반 에픽 무기와 레벨 4의 채집물들이 등장하는 섬입니다! 또한 에덴의 컬렉션 역시 추가되었으니, 여러 아이템들을 수집해보세요!',
        requirements: {
            level: 35,
            recommended_bp: 730,
            required_bp: 580,
            special_entry: '엘도라도 보스(경비 델타 골렘)를 잡고 칼론에게 말을 걸어야 에덴 섬이 열립니다.'
        },
        map: {
            image: 'island12_map.png',
            width: 1080,
            height: 752
        },
        icon: 'island12.png',
        position: { x: 25, y: 65, tooltip: 'right' },
        details: { npcs: [] }
    },
    {
        id: 'island13',
        name: '[이벤트섬] 폴리아',
        slug: 'polia_event',
        description: '단풍 축제 준비 및 할로윈 축제 이벤트 섬. 폴리아에서 가을을 맞이해 단풍 축제를 준비중입니다! 주민들을 도와준다면, 다양한 보상을 얻을 수 있습니다. 또한 /호박 명령어가 추가되었으니 축제 호박을 잔뜩 획득해보세요!',
        requirements: {
            level: null, // 레벨 제한 명시 안됨
            recommended_bp: null,
            required_bp: null,
            event_period: '단풍 축제 준비 이벤트 : 2025년 9월 26일부터 2주간, 단풍 축제 이벤트 : 2025년 10월 10일부터 2주간, 할로윈 축제 이벤트 : 2025년 10월 24일 ~ 2025년 11월 28일 점검 전까지',
            current_status: '이벤트 종료로 인해 항해 지도에서 섬의 위치가 사라졌고, 탐험이 불가능 하다.'
        },
        map: null, // 이벤트 섬이라 맵 파일 없음
        icon: 'island13.png',
        position: { x: 15, y: 10, tooltip: 'right' },
        details: { npcs: [] }
    },
    {
        id: 'island14',
        name: '변형된 플라텀',
        slug: 'transformed_flatum',
        description: '어쩐지 평소의 플라텀과는 다르게 불길한 기운이 맴돈다. 최근 수상한 자들이 목격되었다는 소문이 무성하다. 25년 10월 17일에 출시된 신규 서브 섬으로 40레벨 이상의 개척자라면 언제든지 항해가 가능합니다. 트리 소울, 소심한 보어, 위브! 그리고... 샌드 크래그?! 익숙하지만 어딘가 이상한 몬스터들이 등장하기 시작했다고 하는데... 변형된 플라텀 섬을 탐험해 보세요!',
        requirements: {
            level: 40,
            recommended_bp: 800,
            required_bp: 630
        },
        map: {
            image: 'island14_map.png',
            width: 1248,
            height: 1097
        },
        icon: 'island14.png',
        position: { x: 15, y: 48, tooltip: 'right' },
        details: { npcs: [] }
    },
    {
        id: 'island15',
        name: '판테온',
        slug: 'pantheon',
        description: '신을 모시던 고대의 잔재가 그대로 남아있는 섬이다. 이제는 더 이상 사람이 살지 않는다고 알려져 있다. 2025년 11월 25일 출시된 신규 메인 섬으로 해당 섬에서는 4티어 채집물과 고대 열쇠, 고대 아티팩트, 신규 무기 18종 및 신규 전설 장비 36종을 만나보실 수 있습니다. 판테온 섬에서 나오는 제작 재료, 열쇠는 다른 섬 재화와의 교환식이 존재하지 않습니다. 해당 섬의 전조 퀘스트는 43레벨 이상일 때, 아르카디아 개척자 본부로 향해 만나보실 수 있습니다. 최대 레벨이 53으로 확장되었습니다. 또한 판테온 섬의 컬렉션 역시 추가되었으며, 판테온에서만 낚을 수 있는 물고기와 낚시 컬렉션 [ 판테온의 물고기 ] 가 추가되었습니다.',
        requirements: {
            level: 43,
            recommended_bp: 1500,
            required_bp: 1300,
            special_entry: '43레벨 이상일 때 아르카디아 개척자 본부로 향해 전조 퀘스트를 만나볼 수 있습니다.'
        },
        map: {
            image: 'island15_map.png',
            width: 1035,
            height: 1222
        },
        icon: 'island15.png',
        position: { x: 35, y: 78, tooltip: 'top' },
        details: {
            npcs: [],
            monsters: [
                { name: '고대의 망자', coords: '112, 77, -479' },
                { name: '클레노디움 중급 전투원', coords: '200, 80, -480' }
            ]
         }
    }
];