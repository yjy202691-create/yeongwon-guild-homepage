document.addEventListener('DOMContentLoaded', function() {
    const rankingMainContent = document.querySelector('.ranking-main-content');
    if (!rankingMainContent) {
        console.warn("ranking.js: '.ranking-main-content' 요소를 찾을 수 없습니다. 이 스크립트는 ranking.html 페이지용입니다.");
        return;
    }

    let currentRankingData = []; // 최신 랭킹 데이터 (전체 유저)
    let allHistoricalData = {}; // 모든 과거 랭킹 데이터 { 'YYMMDD': [{user}, {user}], ... }\
    let allUniqueNicknames = [];
    let uuidToCurrentNicknameMap = new Map(); // UUID -> 현재(최신) 닉네임 매핑
    let nicknameToCurrentNicknameMap = new Map(); // 모든 닉네임 (과거 포함) -> 현재(최신) 닉네임 매핑

    // ========== 뱃지 리스트 ==========
    let allBadgeDefinitions = []; // data/badges.json 에서 로드될 뱃지 정의 리스트
    let devMembersList = []; 
    let yeongwonguildMembersList = []; // data/yeongwon_guild_members.json 에서 로드될 길드원 닉네임 리스트
    let uuidNicknameHistoryMap = new Map(); // UUID -> Set<닉네임>

    // 현재 선택된 유저 정보 (부계정 선택 시 업데이트)
    let selectedUserUniqueId = null; // '닉네임_직업' 조합
    let currentUserData = null; // 현재 프로필에 표시 중인 유저의 최신 데이터
    let selectedCharacterKey = null; // 현재 선택된 캐릭터의 고유 키
    let allCharacterHistories = {}; // { '캐릭터고유키': [{date:'YYMMDD', ...user}, {date:'YYMMDD', ...user}, ...] }
    let latestAvailableDateInfo = null; // 최신 랭킹 데이터의 날짜 정보

    // 차트 인스턴스를 저장할 변수 (이것도 전역으로 관리되어야 destroy 후 재사용 가능)
    let levelChartInstance = null;
    let combatPowerChartInstance = null;
    let playtimeChartInstance = null;
    let rankingChartInstance = null;
    let analysisRadarChartInstance = null; // 상세 분석 레이더 차트
    let analysisBarChartInstance = null;   // 상세 분석 막대 차트

    let currentAnalyzedLevel = 0; // 실제 값을 저장할 내부 변수
    let levelAnalysisInitialized = false; // 초기화 여부 플래그 다시 도입 

    // UI 요소 참조
    const nicknameInput = document.getElementById('nicknameInput');
    const autocompleteList = document.getElementById('autocomplete-list');
    const validationMessage = document.getElementById('validationMessage');
    const searchButton = document.getElementById('searchButton');
    const profileDashboard = document.getElementById('profileDashboard');
    const initialSearchMessage = document.getElementById('initialSearchMessage');

    const accountSelectorContainer = document.getElementById('accountSelectorContainer');
    const jobSelectionTabs = accountSelectorContainer ? accountSelectorContainer.querySelector('.job-selection-tabs') : null;

    const userProfileCard = document.getElementById('userProfileCard');
    const profileNickname = document.getElementById('profileNickname');
    const userSkin = document.getElementById('userSkin');
    const profileJob = document.getElementById('profileJob');
    const profileRanking = document.getElementById('profileRanking');
    const profileLevel = document.getElementById('profileLevel');
    const profileExp = document.getElementById('profileExp');
    const profileMaxCombatPower = document.getElementById('profileMaxCombatPower');
    const profilePlaytime = document.getElementById('profilePlaytime');
    const sameLevelAvgCombatPower = document.getElementById('sameLevelAvgCombatPower');

    const chartsWrapper = document.getElementById('chartsWrapper');
    const chartSelectionTabs = chartsWrapper ? chartsWrapper.querySelector('.chart-selection-tabs') : null;
    const chartTabButtons = chartsWrapper ? chartsWrapper.querySelectorAll('.chart-tab-button') : null;
    const chartsContainer = document.getElementById('chartsContainer');
    const chartMessageOverlay = document.getElementById('chartMessageOverlay');
    const chartMessageText = document.getElementById('chartMessageText');
    
    // 개별 차트 박스와 캔버스
    const levelChartBox = document.getElementById('levelChartBox');
    const combatPowerChartBox = document.getElementById('combatPowerChartBox');
    const playtimeChartBox = document.getElementById('playtimeChartBox');
    const rankingChartBox = document.getElementById('rankingChartBox'); // 랭킹 차트 박스
    let levelChartCanvas = document.getElementById('levelChart');
    let combatPowerChartCanvas = document.getElementById('combatPowerChart');
    let playtimeChartCanvas = document.getElementById('playtimeChart');
    let rankingChartCanvas = document.getElementById('rankingChart'); // 랭킹 차트 캔버스


    // 그래프 데이터 표시 토글 체크박스
    const toggleUserData = document.getElementById('toggleUserData');
    const toggleServerAvgData = document.getElementById('toggleServerAvgData');
    const toggleServerAvgLabel = document.getElementById('toggleServerAvgLabel');
    // 그래프 기간 필터 드롭다운
    const chartTimePeriod = document.getElementById('chartTimePeriod');


    const comparisonSection = document.getElementById('comparisonSection');
    const comparisonButtons = document.querySelectorAll('.comparison-btn');
    const comparisonResults = document.getElementById('comparisonResults');

    // 서버 전체 통계 UI 요소
    const totalGuildMembers = document.getElementById('totalGuildMembers');
    const totalGuildMembersChange = document.getElementById('totalGuildMembersChange');
    const avgGuildLevel = document.getElementById('avgGuildLevel');
    const avgGuildCombatPower = document.getElementById('avgGuildCombatPower');
    const avgGuildPlaytime = document.getElementById('avgGuildPlaytime');
    const avgGuildLevelChange = document.getElementById('avgGuildLevelChange');
    const avgGuildCombatPowerChange = document.getElementById('avgGuildCombatPowerChange');
    const avgGuildPlaytimeChange = document.getElementById('avgGuildPlaytimeChange');
    const jobDistributionChartCanvas = document.getElementById('jobDistributionChart');
    const jobDistributionList = document.getElementById('jobDistributionList'); // 직업 분포 목록

    // 레벨별 분석 요소
    const levelAnalysisControls = document.querySelector('.level-analysis-controls'); 
    const currentAnalyzedLevelSpan = document.getElementById('currentAnalyzedLevel');
    const levelChangeButtons = document.querySelectorAll('.level-change-btn');
    const resetLevelAnalysisButton = document.getElementById('resetLevelAnalysis');
    const levelAnalysisResults = document.getElementById('levelAnalysisResults');
    const toastContainer = document.getElementById('toast-container');

    // 서버 TOP 10 랭킹 요소
    const top10RankingList = document.getElementById('top10RankingList');
    
    const jobSortControls = document.getElementById('jobSortControls');
    // 레벨별 유저 리스트 모달 요소
    const levelUserListModal = document.getElementById('levelUserListModal');
    const levelUserListTitle = document.getElementById('levelUserListTitle');
    const levelUserListContent = document.getElementById('levelUserListContent');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    
    // 모달 내부 검색 및 정렬 요소
    const levelUserSearchInput = document.getElementById('levelUserSearchInput');
    const sortLevelUsersAscBtn = document.getElementById('sortLevelUsersAsc');
    const sortLevelUsersDescBtn = document.getElementById('sortLevelUsersDesc');
    let currentLevelUsersData = []; // 현재 모달에 표시 중인 레벨의 전체 유저 데이터
    let currentLevelSortDirection = 'desc'; // 정렬 방향 (기본: 내림차순)

    // 'label'은 그래프 X축에 표시됩니다.
    // 예: "250911" 파일이 2025년 9월 1차 데이터인 경우
    const rankingFileDates = [
        { date: "250911", label: "9월 1차" },
        { date: "250919", label: "9월 2차" },
        { date: "250925", label: "9월 3차" },
        { date: "251003", label: "10월 1차" },
        { date: "251007", label: "10월 2차" },
        { date: "251020", label: "10월 3차" },
        { date: "251024", label: "10월 4차" },
        { date: "251028", label: "10월 5차" },
        { date: "251103", label: "11월 1차" },
        { date: "251107", label: "11월 2차" },
        { date: "251114", label: "11월 3차" },
        { date: "251121", label: "11월 4차" },
        { date: "251128", label: "11월 5차" },
        { date: "251205", label: "12월 1차" },
        { date: "251230", label: "1월 1차" },
        { date: "260109", label: "1월 2차" },
        { date: "260116", label: "1월 3차" },
        { date: "260123", label: "1월 4차" },
        { date: "260130", label: "1월 5차" },
        { date: "260206", label: "2월 1차" },
        { date: "260213", label: "2월 2차" },
        { date: "260220", label: "2월 3차" },
        { date: "260227", label: "2월 4차" },
        { date: "260306", label: "3월 1차" },
        { date: "260313", label: "3월 2차" },
        { date: "260320", label: "3월 3차" },
        { date: "260326", label: "3월 4차" },
        { date: "260402", label: "4월 1차" },
        { date: "260409", label: "4월 2차" }
    ];
    // 날짜 순으로 정렬 (JS 내부 로직을 위해)
    rankingFileDates.sort((a, b) => a.date.localeCompare(b.date));

    // 커스텀 툴팁 포지셔너 등록 (내 데이터 기준)
    Chart.Tooltip.positioners.myData = function(elements) {
        if (!elements.length) return false;
        // datasetIndex 0은 '내 데이터' (토글되어 있다면)
        const myData = elements.find(e => e.datasetIndex === 0);
        return myData ? { x: myData.element.x, y: myData.element.y } : { x: elements[0].element.x, y: elements[0].element.y };
    };

    //  destroyAllChartInstances 함수 정의 (여기에 반드시 존재해야 합니다!) 
    function destroyAllChartInstances() {
        if (rankingChartInstance) { rankingChartInstance.destroy(); rankingChartInstance = null; }
        if (levelChartInstance) { levelChartInstance.destroy(); levelChartInstance = null; }
        if (combatPowerChartInstance) { combatPowerChartInstance.destroy(); combatPowerChartInstance = null; }
        if (playtimeChartInstance) { playtimeChartInstance.destroy(); playtimeChartInstance = null; }
    }
    if (analysisRadarChartInstance) { analysisRadarChartInstance.destroy(); analysisRadarChartInstance = null; }
    if (analysisBarChartInstance) { analysisBarChartInstance.destroy(); analysisBarChartInstance = null; }

    // ======================== 검색 기록 관리 함수 ========================
    const SEARCH_HISTORY_KEY = 'ywg_search_history';
    const MAX_HISTORY_COUNT = 5;

    function getSearchHistory() {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    }

    function saveSearchHistory(nickname) {
        let history = getSearchHistory();
        // 중복 제거 (대소문자 구분 없이 비교하되 저장은 입력된 대로)
        history = history.filter(item => item.toLowerCase() !== nickname.toLowerCase());
        // 최신 항목을 맨 앞에 추가
        history.unshift(nickname);
        // 최대 개수 제한
        if (history.length > MAX_HISTORY_COUNT) {
            history = history.slice(0, MAX_HISTORY_COUNT);
        }
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    }

    function removeSearchHistory(nickname) {
        let history = getSearchHistory();
        history = history.filter(item => item !== nickname);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
        // renderSearchHistory(); // UI 갱신은 호출자가 담당하도록 변경
    }

    function renderSearchHistory() {
        const history = getSearchHistory();
        autocompleteList.innerHTML = '';
        
        if (history.length === 0) {
            autocompleteList.style.display = 'none';
            return;
        }

        // 헤더 추가
        const header = document.createElement('div');
        header.className = 'autocomplete-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = '최근 검색어';
        header.appendChild(titleSpan);

        const clearAllBtn = document.createElement('span');
        clearAllBtn.className = 'clear-all-btn';
        clearAllBtn.textContent = '전체 삭제';
        clearAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem(SEARCH_HISTORY_KEY);
            renderSearchHistory(); // 목록 갱신 (비어있으므로 숨겨짐)
            nicknameInput.focus();
        });
        header.appendChild(clearAllBtn);

        autocompleteList.appendChild(header);

        history.forEach(nickname => {
            const item = document.createElement('div');
            item.className = 'autocomplete-list-item history-item';
            
            // 닉네임 텍스트
            const textSpan = document.createElement('span');
            textSpan.textContent = nickname;
            item.appendChild(textSpan);

            // 삭제 버튼
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'history-delete-btn';
            deleteBtn.innerHTML = '&times;'; // X 마크
            deleteBtn.title = '삭제';
            
            // 삭제 버튼 클릭 이벤트 (이벤트 버블링 방지)
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeSearchHistory(nickname);
                renderSearchHistory(); // 전체 목록 갱신
                nicknameInput.focus(); // 포커스 유지
            });
            
            item.appendChild(deleteBtn);

            // 항목 클릭 시 검색
            item.addEventListener('click', function() {
                nicknameInput.value = nickname;
                closeAllLists();
                searchButton.click();
            });

            autocompleteList.appendChild(item);
        });

        autocompleteList.style.display = 'block';
    }

    // ======================== 유틸리티 함수 ========================

    // 플레이타임 초 단위를 '시간 분 초' 형식으로 변환
    function formatPlaytime(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds)) return '데이터 없음';
        if (seconds < 0) seconds = 0; // 음수 시간 방지

        const absSeconds = Math.abs(seconds); // 절대값으로 계산하여 시간, 분, 초 추출
        const hours = Math.floor(absSeconds / 3600);
        const minutes = Math.floor((absSeconds % 3600) / 60);
        const remainingSeconds = Math.round(absSeconds % 60);

        let result = [];
        if (hours > 0) result.push(`${hours}시간`);
        if (minutes > 0) result.push(`${minutes}분`);
        // 시간이 0이고, 분도 0일 때만 (또는 모든 단위가 0일 때) 0초를 표시
        if (remainingSeconds > 0 || (hours === 0 && minutes === 0 && absSeconds === 0)) result.push(`${remainingSeconds}초`);

        return result.join(' ').trim() || '0초';
    }

    // 플레이타임 초 단위를 '시간 (소수점 첫째 자리)' 형식으로 변환 (계산 및 차트용)
    function formatPlaytimeForCalculation(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return 0;
        return Math.round((seconds / 3600) * 10) / 10; // 소수점 둘째 자리에서 반올림
    }

    //  통합된 formatPlaytimeChange 함수:
    //    diffSeconds (차이값)을 인자로 받고, includeIcon (아이콘 포함 여부) 플래그를 추가합니다. 
    function formatPlaytimeChange(diffSeconds, includeIcon = true) { // includeIcon 기본값은 false
        if (typeof diffSeconds !== 'number' || isNaN(diffSeconds)) {
            return `<span class="change-same"></span>`; // 데이터 없을 시 비워둠
        }

        // 먼저 텍스트 기호와 변화량 값을 준비합니다.
        let textSymbol = '';
        let changeClass = 'change-same';
        let displayText = formatPlaytime(Math.abs(diffSeconds)); // 값 자체는 항상 양수로 포맷팅

        if (diffSeconds > 0) {
            changeClass = 'change-up';
        } else if (diffSeconds < 0) {
            changeClass = 'change-down';
        } else {
            changeClass = 'change-same';
            displayText = '0'; // 0일 경우 '0초' 대신 '0'만 표시 (필요에 따라 변경 가능)
        }

        //  아이콘 포함 여부에 따라 텍스트 기호와 Font Awesome 아이콘을 선택적으로 추가 
        let directionalOutput = ''; // 최종적으로 방향을 나타낼 부분

        if (includeIcon) { // Font Awesome 아이콘이 필요한 경우
            if (diffSeconds > 0) directionalOutput = `<i class="fas fa-caret-up change-icon"></i>`;
            else if (diffSeconds < 0) directionalOutput = `<i class="fas fa-caret-down change-icon"></i>`;
            else directionalOutput = `<i class="fas fa-minus change-icon"></i>`;
            
            // 아이콘을 사용할 때는 텍스트 기호는 표시하지 않고, 값과 아이콘만 결합합니다.
            return `<span class="${changeClass}">${displayText} ${directionalOutput}</span>`;

        } else { // 텍스트 기호가 필요한 경우
            if (diffSeconds > 0) textSymbol = '▲ ';
            else if (diffSeconds < 0) textSymbol = '▼ ';
            else textSymbol = '- ';
            
            // 텍스트 기호를 사용할 때는 Font Awesome 아이콘을 포함하지 않습니다.
            return `<span class="${changeClass}">${textSymbol}${displayText}</span>`;
        }
    }

    // 숫자 포맷팅 (콤마 추가)
    function formatNumber(num, decimalPlaces = 0) { //  decimalPlaces 매개변수 추가, 기본값 0 
        if (typeof num !== 'number' || isNaN(num)) return '데이터 없음';
        
        // toFixed로 원하는 소수점 자릿수까지 자른 후 숫자로 다시 변환
        // 이렇게 하면 불필요한 뒷자리 0이 제거됩니다.
        const fixedNum = parseFloat(num.toFixed(decimalPlaces)); 
        
        // toLocaleString으로 콤마를 찍고, 소수점 자릿수는 명시적으로 지정
        return fixedNum.toLocaleString(undefined, {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        });
    }

    // 날짜 파일명 (YYMMDD)을 'YYYY년 MM월 DD일' 형식으로 변환 (그래프 라벨용은 아님)
    function formatDateString(dateStr) {
        if (!dateStr || dateStr.length !== 6) return dateStr;
        const year = `20${dateStr.substring(0, 2)}`;
        const month = dateStr.substring(2, 4);
        const day = dateStr.substring(4, 6);
        return `${year}년 ${month}월 ${day}일`;
    }

    // 데이터 변화량 포맷팅 (색상 및 아이콘 포함)
    function formatChange(currentValue, previousValue, isRanking = false, decimalPlaces = 0) { //  decimalPlaces 매개변수 추가 
        if (typeof currentValue !== 'number' || isNaN(currentValue) ||
            typeof previousValue !== 'number' || isNaN(previousValue)) {
            return `<span class="stat-change change-same"></span>`; // 데이터 없을 시 비워둠
        }
        
        // toFixed로 문자열화된 값을 parseFloat로 다시 숫자로 변환하여 비교
        const cur = parseFloat(currentValue.toFixed(decimalPlaces));
        const prev = parseFloat(previousValue.toFixed(decimalPlaces));

        let diff = cur - prev;
        if (isRanking) diff = prev - cur; // 랭킹은 숫자가 낮을수록 좋음 (클수록 좋은 지표와 반대)

        let formattedDiff = formatNumber(Math.abs(diff), decimalPlaces); // 변경량도 formatNumber로 포맷팅

        if (diff > 0) {
            return `<span class="change-up">${formattedDiff} <i class="fas fa-caret-up change-icon"></i></span>`;
        } else if (diff < 0) {
            return `<span class="change-down">${formattedDiff} <i class="fas fa-caret-down change-icon"></i></span>`;
        } else {
            return `<span class="change-same">0 <i class="fas fa-minus change-icon"></i></span>`;
        }
    }

    //  토스트 메시지 함수 
    function showToast(message) {
        // 기존 #copy-toast-message 요소를 재사용
        const toastMessage = document.getElementById('copy-toast-message');
        if (toastMessage) {
            toastMessage.textContent = message; // 메시지 업데이트
            toastMessage.classList.add('show');
            // 이전 타이머가 있다면 클리어
            if (toastMessage.hideTimer) {
                clearTimeout(toastMessage.hideTimer);
            }
            toastMessage.hideTimer = setTimeout(() => {
                toastMessage.classList.remove('show');
            }, 3000); // 3초 후 사라짐
        }
    }

    // 직업명을 표준화하는 함수
    function normalizeJobName(jobName) {
        if (!jobName) return '알 수 없음'; // 직업명이 없는 경우 처리
        const trimmedJobName = String(jobName).trim(); // 소문자로 변환하고 공백 제거

        // 표준 직업명으로 매핑
        switch (trimmedJobName) {
            case '메이지':
            case '매지션':
            case '메지션':
                return '메지션'; // "메지션"로 통일
            case '나이트':
            case '나이츠':
                return '나이트'; // "나이트"로 통일
            case '어쌔신':
            case '어쎄신':
                return '어쌔신'; // "어쌔신"으로 통일
            case '레인저':
            case '래인저':
            case '레인져':
            case '래인져':
                return '레인저'; // "레인저"로 통일
            default:
                return trimmedJobName;
        }
    }

    //  유효성 검사 메시지 함수 (경고 스타일) 
    let validationMessageTimer;
    let hideAfterLineAnimationTimer; // 밑줄 애니메이션 이후 메시지 숨김을 위한 타이머

    function showValidationMessage(message) {
        if (validationMessage) {
            clearTimeout(validationMessageTimer);
            clearTimeout(hideAfterLineAnimationTimer); // 이전 타이머 초기화

            validationMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            validationMessage.classList.add('show'); // CSS transition으로 나타남
            
            // CSS 애니메이션 완료 후 (1.2초) 일정 시간(1.8초) 메시지를 더 보여준 뒤 사라지게
            hideAfterLineAnimationTimer = setTimeout(() => {
                validationMessage.classList.remove('show'); // CSS transition으로 사라짐
            }, 3000); // 1.2s (밑줄) + 1.8s (추가 표시) = 3s
        }
    }

    function hideValidationMessage() {
        if (validationMessage) {
            validationMessage.classList.remove('show');
            clearTimeout(validationMessageTimer);
            clearTimeout(hideAfterLineAnimationTimer);
        }
    }

    // ======================== 데이터 로드 함수 ========================

    async function fetchRankingData(dateFileName) {
        const url = `data/ranking/레벨랭킹${dateFileName}.json`; // GitHub Pages는 대소문자를 구분합니다. 파일명 확인 필수!
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`ranking.js: 랭킹 데이터 로드 실패 (파일 없음 또는 오류): ${url}, status: ${response.status}`);
                return null; // 데이터 로드 실패 시 null 반환
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`ranking.js: 랭킹 데이터 파싱 실패 (${url}):`, error);
            return null; // 파싱 실패 시 null 반환
        }
    }

    async function loadAllHistoricalData() {
        const fetchPromises = rankingFileDates.map(async dateInfo => {
            const data = await fetchRankingData(dateInfo.date);
            if (data) {
                const normalizedData = data.map(user => {
                    return {
                        ...user, // 기존 사용자 정보 유지
                        '직업': normalizeJobName(user['직업']) // '직업' 필드의 값을 표준화
                    };
                });
                allHistoricalData[dateInfo.date] = normalizedData; // 표준화된 데이터를 저장
            }
        });
        await Promise.all(fetchPromises);

        //console.log("[Console Log]: ----- UUID-닉네임 이력 맵 구축 시작 -----");
        Object.keys(allHistoricalData).forEach(date => {
            allHistoricalData[date].forEach(user => {
                const uuid = user['UUID']; 
                const nickname = user['닉네임'];

                if (uuid && nickname) {
                    if (!uuidNicknameHistoryMap.has(uuid)) {
                        uuidNicknameHistoryMap.set(uuid, new Set());
                    }
                    uuidNicknameHistoryMap.get(uuid).add(nickname);
                }
            });
        });
        //console.log("[Console Log]: UUID-닉네임 이력 맵 구축 완료. 고유 UUID 수:", uuidNicknameHistoryMap.size);

        //  새로 추가: UUID별 현재 닉네임 결정 (uuidToCurrentNicknameMap 채우기) 
        // 이 맵은 위에서 채워진 uuidNicknameHistoryMap과 allHistoricalData가 모두 원본 닉네임을 포함한 상태에서 만들어집니다.
        //console.log("[Console Log]: ----- UUID별 현재 닉네임 결정 시작 -----");
        const sortedDates = Object.keys(allHistoricalData).sort((a, b) => {
            const dateA = parseInt(a, 10);
            const dateB = parseInt(b, 10);
            return dateA - dateB;
        });

        for (let i = sortedDates.length - 1; i >= 0; i--) {
            const date = sortedDates[i];
            allHistoricalData[date].forEach(user => {
                if (user['UUID'] && !uuidToCurrentNicknameMap.has(user['UUID'])) {
                    uuidToCurrentNicknameMap.set(user['UUID'], user['닉네임']);
                }
            });
        }
        //console.log("[Console Log]: UUID별 현재 닉네임 맵 구축 완료. 고유 UUID 수:", uuidToCurrentNicknameMap.size);
        
        // nicknameToCurrentNicknameMap 채우기
        // uuidNicknameHistoryMap(모든 닉네임 이력을 가지고 있음)과 uuidToCurrentNicknameMap(각 UUID의 최신 닉네임)을 활용
        //console.log("[Console Log]: ----- nicknameToCurrentNicknameMap 구축 시작 -----");
        uuidNicknameHistoryMap.forEach((pastNicknamesSet, uuid) => {
            const currentNickname = uuidToCurrentNicknameMap.get(uuid); // 해당 UUID의 현재 닉네임

            if (currentNickname) {
                // 이 UUID와 관련된 모든 과거 닉네임을 최신 닉네임에 매핑
                pastNicknamesSet.forEach(pastNickname => {
                    nicknameToCurrentNicknameMap.set(pastNickname.toLowerCase(), currentNickname);
                });
            }
        });
        //console.log("[Console Log]: nicknameToCurrentNicknameMap 구축 완료. 매핑된 닉네임 수:", nicknameToCurrentNicknameMap.size);

        //allHistoricalData 내 모든 과거 닉네임을 현재 닉네임으로 치환 (마지막에 실행)
        //console.log("[Console Log]: ----- allHistoricalData 닉네임 전처리 시작 -----");
        Object.keys(allHistoricalData).forEach(date => {
            allHistoricalData[date] = allHistoricalData[date].map(user => {
                if (user['UUID'] && uuidToCurrentNicknameMap.has(user['UUID'])) {
                    return { ...user, '닉네임': uuidToCurrentNicknameMap.get(user['UUID']) };
                }
                return user;
            });
        });
        //console.log("[Console Log]: allHistoricalData 닉네임 전처리 완료.");

        // 모든 파일 로드가 끝난 후, 없는 파일은 allHistoricalData에서 제외 (값이 null인 경우)
        Object.keys(allHistoricalData).forEach(dateKey => {
            if (!allHistoricalData[dateKey]) {
                delete allHistoricalData[dateKey];
            }
        });

        // 유효한 날짜 정보만 필터링하여 최신 날짜 다시 결정
        const validRankingDates = rankingFileDates.filter(dateInfo => allHistoricalData[dateInfo.date]);
        if (validRankingDates.length === 0) {
            console.error("ranking.js: 유효한 랭킹 데이터 파일이 하나도 없습니다. 데이터 로드 경로 및 파일명을 확인해주세요.");
            showInitialMessage("랭킹 데이터를 불러올 수 없습니다. 파일 경로를 확인해주세요.", true);
            // 서버 통계 등도 데이터 없음을 표시
            if (totalGuildMembers) totalGuildMembers.textContent = "정보 없음";
            if (avgGuildLevel) avgGuildLevel.textContent = "정보 없음";
            if (avgGuildCombatPower) avgGuildCombatPower.textContent = "정보 없음";
            if (avgGuildPlaytime) avgGuildPlaytime.textContent = "정보 없음";
            if (jobDistributionList) jobDistributionList.innerHTML = '<p class="no-results-message">직업 분포 데이터를 불러올 수 없습니다.</p>';
            if (top10RankingList) top10RankingList.innerHTML = '<p class="no-results-message">TOP 15 랭킹 데이터를 불러올 수 없습니다.</p>';
            if (levelAnalysisResults) levelAnalysisResults.innerHTML = '<p class="error-message">데이터를 불러올 수 없습니다.</p>';
            return;
        }

        // 실제로 로드된 데이터 중 가장 최신 날짜를 latestAvailableDateInfo에 저장
        latestAvailableDateInfo = validRankingDates[validRankingDates.length - 1];
        //console.log("ranking.js: 모든 과거 랭킹 데이터 로드 완료. 파일 수:", Object.keys(allHistoricalData).length);

        //  추가된 코드: 모든 과거 스냅샷의 각 캐릭터에 고유 characterKey 부여 
        // 각 날짜별 데이터를 순회하며 캐릭터에 고유 characterKey를 추가합니다.
        Object.keys(allHistoricalData).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
            const dailyData = allHistoricalData[date]; // 특정 날짜의 모든 유저 데이터

            if (dailyData) {
                // 이 날짜의 데이터 내에서 동일 닉네임-직업 조합의 캐릭터 인스턴스들을 추적
                const uniqueCharacterTracker = new Map(); 

                // `allHistoricalData[date]`의 데이터를 `characterKey`가 부여된 새 배열로 교체합니다.
                allHistoricalData[date] = dailyData.map(user => {
                    const nickname = user['닉네임'];
                    const job = normalizeJobName(user['직업']);
                    const baseKey = `${nickname}_${job}`; // 닉네임과 직업을 조합한 기본 키

                    let instanceCount = uniqueCharacterTracker.get(baseKey) || 0;
                    uniqueCharacterTracker.set(baseKey, instanceCount + 1); // 사용하기 전에 먼저 카운트 증가

                    // 닉네임과 직업이 같더라도 여러 캐릭터를 구분할 수 있도록 인덱스를 추가
                    // 첫 번째 인스턴스(instanceCount=0)는 인덱스 없이, 두 번째부터는 _1, _2 ...
                    const characterKey = instanceCount === 0 ? baseKey : `${baseKey}_${instanceCount}`;

                    return {
                        ...user,              // 기존 사용자 정보
                        characterKey: characterKey //  고유 캐릭터 키 추가 
                    };
                });
            }
        });
        // characterKey 부여 로직 끝

        // characterKey가 부여된 최신 데이터로 currentRankingData 업데이트
        currentRankingData = allHistoricalData[latestAvailableDateInfo.date] || [];

        /* // allUniqueNicknames 생성 로직 수정 (characterKey가 부여된 데이터 활용)
        const tempUniqueNicknameSet = new Set();
        Object.values(allHistoricalData).forEach(dailyData => { // 날짜별 데이터 배열들을 순회
            dailyData.forEach(user => {
                tempUniqueNicknameSet.add(user['닉네임']); // 모든 닉네임을 수집
            });
        });
        allUniqueNicknames = Array.from(tempUniqueNicknameSet).sort((a, b) => a.localeCompare(b));     
        //console.log("ranking.js: 수집된 고유 닉네임 수 (자동 완성용):", allUniqueNicknames.length);
        // allUniqueNicknames 생성 로직 수정 끝 */

        const allNicknamesForAutocomplete = new Set();
        // uuidNicknameHistoryMap에는 각 UUID가 사용했던 모든 닉네임(과거 포함)이 저장되어 있습니다.
        uuidNicknameHistoryMap.forEach(nicknameSet => {
            nicknameSet.forEach(nickname => {
                allNicknamesForAutocomplete.add(nickname);
            });
        });
        // Set을 배열로 변환하고 소문자로 정렬하여 자동 완성 목록으로 사용합니다.
        allUniqueNicknames = Array.from(allNicknamesForAutocomplete).sort((a, b) => a.localeCompare(b));
        //console.log("ranking.js: 수집된 고유 닉네임 수 (자동 완성용, 과거 포함):", allUniqueNicknames.length);


        yeongwonguildMembersList = await fetch('data/badges/yeongwon_guild_members.json')
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("data/badges/yeongwon_guild_members.json 파일을 찾을 수 없습니다. 길드원 뱃지 기능이 비활성화됩니다.");
                        return [];
                    }
                    throw new Error(`Failed to load guild_members.json: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => data.map(name => String(name).toLowerCase().trim())) // 모두 소문자로 변환하여 저장
            .catch(error => {
                console.error("길드 멤버 리스트 로드 중 오류 발생:", error);
                return [];
            });
        //console.log("멤버 리스트 로드 완료. 멤버 수:", yeongwonguildMembersList.length);

        devMembersList = await fetch('data/badges/dev_members.json')
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("data/badges/dev_members.json 파일을 찾을 수 없습니다. 스태프 뱃지 기능이 비활성화됩니다.");
                        return [];
                    }
                    throw new Error(`Failed to load dev_members.json: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => data.map(name => String(name).toLowerCase().trim())) // 모두 소문자로 변환하여 저장
            .catch(error => {
                console.error("스태프 멤버 리스트 로드 중 오류 발생:", error);
                return [];
            });
        //console.log("개발자 멤버 리스트 로드 완료. 멤버 수:", devMembersList.length);

        allBadgeDefinitions = await fetch('data/badges/badges.json')
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("data/badges/badges.json 파일을 찾을 수 없습니다. 프로필 뱃지 기능이 비활성화되거나 제한될 수 있습니다.");
                        return [];
                    }
                    throw new Error(`Failed to load badges.json: ${response.statusText}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error("뱃지 정의 로드 중 오류 발생:", error);
                return [];
            });
        //console.log("뱃지 정의 로드 완료. 정의된 뱃지 수:", allBadgeDefinitions.length);

        if (currentRankingData.length > 0) {
            displayGuildStats(); // 서버 전체 통계 표시
            displayServerTop15('combatPower'); // 서버 TOP 15 표시
            initializeLevelAnalysis(); // 레벨 분석 초기화
        } else {
            console.warn("ranking.js: 최신 랭킹 데이터를 로드하지 못했습니다. 서버 통계 및 TOP 15가 표시되지 않을 수 있습니다.");
            if (totalGuildMembers) totalGuildMembers.textContent = "정보 없음";
            if (avgGuildLevel) avgGuildLevel.textContent = "정보 없음";
            if (avgGuildCombatPower) avgGuildCombatPower.textContent = "정보 없음";
            if (avgGuildPlaytime) avgGuildPlaytime.textContent = "정보 없음";
            if (jobDistributionList) jobDistributionList.innerHTML = '<p class="no-results-message">직업 분포 데이터를 불러올 수 없습니다.</p>';
            if (top10RankingList) top10RankingList.innerHTML = '<p class="no-results-message">TOP 15 랭킹 데이터를 불러올 수 없습니다.</p>';
            if (levelAnalysisResults) levelAnalysisResults.innerHTML = '<p class="error-message">데이터를 불러올 수 없습니다.</p>';
        }

        const urlParams = new URLSearchParams(window.location.search);
        const nicknameParam = urlParams.get('nickname');
        if (nicknameParam) {
            nicknameInput.value = nicknameParam;
            searchUser();
        } else {
            showInitialMessage('닉네임을 검색하여 유저 정보를 확인하세요.');
            hideUserProfileAndCharts();
        }
    }

    // ======================== 통계 계산 함수 ========================

    function calculateGuildStats(dataToUse, previousWeekDataToUse = null) {
        if (!dataToUse || dataToUse.length === 0) {
            return {
                totalMembers: 0, 
                avgLevel: "정보 없음", avgCombatPower: "정보 없음", avgPlaytime: "정보 없음",
                avgLevelRaw: 0, avgCombatPowerRaw: 0, avgPlaytimeRaw: 0,
                jobDistribution: {}
            };
        }

        const totalMembers = dataToUse.length;
        const totalLevel = dataToUse.reduce((sum, user) => sum + (user['레벨'] || 0), 0);
        const totalCombatPower = dataToUse.reduce((sum, user) => sum + (parseFloat(user['최고 전투력']) || 0), 0);
        const totalPlaytimeSeconds = dataToUse.reduce((sum, user) => sum + (user['플레이타임_초'] || 0), 0);

        // Raw 값 (계산용)
        const avgLevelRaw = (totalLevel / totalMembers);
        const avgCombatPowerRaw = (totalCombatPower / totalMembers);
        const avgPlaytimeRaw = (totalPlaytimeSeconds / totalMembers);

        // 표시용 값 (toFixed 후 parseFloat/parseInt)
        const avgLevelFormatted = parseFloat(avgLevelRaw.toFixed(1)); //  소수점 한 자리 
        const avgCombatPowerFormatted = parseFloat(avgCombatPowerRaw.toFixed(2)); //  소수점 두 자리 
        const avgPlaytimeFormatted = formatPlaytime(avgPlaytimeRaw); //  '시간 분 초' 형식 

        // 이전 주차 데이터가 있다면 계산
        let previousStats = null;
        if (previousWeekDataToUse && previousWeekDataToUse.length > 0) {
            const prevTotalLevel = previousWeekDataToUse.reduce((sum, user) => sum + (user['레벨'] || 0), 0);
            const prevTotalCombatPower = previousWeekDataToUse.reduce((sum, user) => sum + (parseFloat(user['최고 전투력']) || 0), 0);
            const prevTotalPlaytimeSeconds = previousWeekDataToUse.reduce((sum, user) => sum + (user['플레이타임_초'] || 0), 0);
            
            previousStats = {
                totalMembers: previousWeekDataToUse.length,
                avgLevelRaw: (prevTotalLevel / previousWeekDataToUse.length),
                avgCombatPowerRaw: (prevTotalCombatPower / previousWeekDataToUse.length),
                avgPlaytimeRaw: (prevTotalPlaytimeSeconds / previousWeekDataToUse.length)
            };
        }

        const jobDistribution = dataToUse.reduce((acc, user) => {
            const job = normalizeJobName(user['직업']) || '알 수 없음';
            acc[job] = (acc[job] || 0) + 1;
            return acc;
        }, {});

        return {
            totalMembers,
            avgLevel: formatNumber(avgLevelFormatted, 1),
            avgCombatPower: formatNumber(avgCombatPowerFormatted, 2),
            avgPlaytime: avgPlaytimeFormatted,
            avgLevelRaw: avgLevelRaw, // 증감량 계산을 위한 원시값
            avgCombatPowerRaw: avgCombatPowerRaw, // 증감량 계산을 위한 원시값
            avgPlaytimeRaw: avgPlaytimeRaw, // 증감량 계산을 위한 원시값
            previousStats: previousStats, // 이전 주차 통계 원시값
            jobDistribution
        };
    }

    // 모든 시점의 서버 평균 계산 (그래프 기준선에 사용)
    function calculateOverallStatsByDate(dateData) {
        if (!dateData || dateData.length === 0) {
            return { avgLevel: 0, avgCombatPower: 0, avgPlaytime: 0, avgRanking: 0 };
        }
        const totalUsers = dateData.length;
        const totalLevel = dateData.reduce((sum, user) => sum + (user['레벨'] || 0), 0);
        const totalCombatPower = dateData.reduce((sum, user) => sum + (parseFloat(user['최고 전투력']) || 0), 0);
        const totalPlaytime = dateData.reduce((sum, user) => sum + (user['플레이타임_초'] || 0), 0);
        const totalRanking = dateData.reduce((sum, user) => sum + (user['랭킹'] || 0), 0); // 랭킹 평균 계산

        return {
            avgLevel: totalLevel / totalUsers,
            avgCombatPower: totalCombatPower / totalUsers,
            avgPlaytime: totalPlaytime / totalUsers,
            avgRanking: totalRanking / totalUsers
        };
    }


    function calculateSameLevelAverageCombatPower(level, allUsersData) {
        if (!allUsersData || allUsersData.length === 0) return 0;
        const usersAtSameLevel = allUsersData.filter(user => user['레벨'] === level);
        if (usersAtSameLevel.length === 0) return 0;
        const totalCombatPower = usersAtSameLevel.reduce((acc, user) => acc + (parseFloat(user['최고 전투력']) || 0), 0);
        return parseFloat((totalCombatPower / usersAtSameLevel.length).toFixed(0)); // 정수 반올림
    }


    // ======================== UI 가시성 제어 함수 ========================

    function showInitialMessage(message, isError = false) {
        if (initialSearchMessage) {
            initialSearchMessage.textContent = message;
            initialSearchMessage.classList.toggle('error', isError);
            initialSearchMessage.style.display = 'flex'; // 메시지는 보이게

            // 다른 모든 컨테이너 숨김
            if (accountSelectorContainer) accountSelectorContainer.style.display = 'none';
            if (userProfileCard) userProfileCard.style.display = 'none';
            if (chartsWrapper) chartsWrapper.style.display = 'none';
            if (comparisonSection) comparisonSection.style.display = 'none';
        }
    }

    function hideInitialMessage() {
        if (initialSearchMessage) {
            initialSearchMessage.style.display = 'none';
        }
    }

    function showUserProfileAndCharts() {
        if (userProfileCard) userProfileCard.style.display = 'block';
        if (chartsWrapper) chartsWrapper.style.display = 'block';
        if (comparisonSection) comparisonSection.style.display = 'block';
        hideInitialMessage();

        // profileDashboard의 그리드 레이아웃이 적용될 수 있도록 클래스 추가 (모바일 반응형에서 활용)
        if (profileDashboard) profileDashboard.classList.add('show-items');
    }

    function hideUserProfileAndCharts() {
        if (userProfileCard) userProfileCard.style.display = 'none';
        if (chartsWrapper) chartsWrapper.style.display = 'none';
        if (comparisonSection) comparisonSection.style.display = 'none';
        if (document.getElementById('detailedAnalysisWrapper')) document.getElementById('detailedAnalysisWrapper').style.display = 'none';
        if (accountSelectorContainer) accountSelectorContainer.style.display = 'none';
        if (jobSelectionTabs) jobSelectionTabs.innerHTML = '';

        comparisonResults.innerHTML = '<p class="initial-comparison-message">비교 시점을 선택해주세요.</p>';
        comparisonButtons.forEach(btn => btn.classList.remove('active'));

        // 기존 차트 인스턴스 파괴
        if (levelChartInstance) levelChartInstance.destroy();
        if (combatPowerChartInstance) combatPowerChartInstance.destroy();
        if (playtimeChartInstance) playtimeChartInstance.destroy();
        if (rankingChartInstance) rankingChartInstance.destroy(); // 랭킹 차트 인스턴스 파괴
        if (analysisRadarChartInstance) { analysisRadarChartInstance.destroy(); analysisRadarChartInstance = null; }
        if (analysisBarChartInstance) { analysisBarChartInstance.destroy(); analysisBarChartInstance = null; }

        // profileDashboard의 그리드 아이템 보이기 관련 클래스 제거
        if (profileDashboard) profileDashboard.classList.remove('show-items');
    }


    // ======================== 그래프 관련 함수 ========================

    function updateChart(canvasElement, chartType, chartData, chartOptions) {
        if (!canvasElement) return null;

        if (canvasElement.chartInstance) {
            canvasElement.chartInstance.destroy();
        }

        const chartInstance = new Chart(canvasElement, {
            type: chartType,
            data: chartData,
            options: chartOptions,
        });
        canvasElement.chartInstance = chartInstance;
        return chartInstance;
    }


    // ======================== 서버 전체 통계 표시 ========================

    function displayGuildStats() {
        // currentRankingData가 비어있을 경우 처리
        if (!currentRankingData || currentRankingData.length === 0) {
            console.warn("displayGuildStats: currentRankingData가 비어있어 통계를 표시할 수 없습니다.");
            if (totalGuildMembers) totalGuildMembers.textContent = "0명";
            if (avgGuildLevel) avgGuildLevel.textContent = "정보 없음";
            if (avgGuildCombatPower) avgGuildCombatPower.textContent = "정보 없음";
            if (avgGuildPlaytime) avgGuildPlaytime.textContent = "정보 없음";
            if (avgGuildLevelChange) avgGuildLevelChange.innerHTML = `<span class="change change-same"></span>`;
            if (avgGuildCombatPowerChange) avgGuildCombatPowerChange.innerHTML = `<span class="change change-same"></span>`;
            if (avgGuildPlaytimeChange) avgGuildPlaytimeChange.innerHTML = `<span class="change change-same"></span>`;
            // jobDistributionChart 및 jobDistributionList도 초기화 또는 메시지 표시
            if (jobDistributionList) jobDistributionList.innerHTML = '<p class="no-results-message">데이터 없음</p>';
            return;
        }

        // 현재 데이터의 인덱스 찾기
        const currentDataDate = latestAvailableDateInfo.date;
        const currentDataIndex = rankingFileDates.findIndex(dateInfo => dateInfo.date === currentDataDate);

        // 이전 주차 데이터 (1주 전 파일) 가져오기
        let previousWeekData = null;
        if (currentDataIndex > 0) {
            const previousDateInfo = rankingFileDates[currentDataIndex - 1];
            previousWeekData = allHistoricalData[previousDateInfo.date];
        }
        
        // 현재 및 이전 주차 데이터를 바탕으로 통계 계산
        const stats = calculateGuildStats(currentRankingData, previousWeekData);

        if (totalGuildMembers) totalGuildMembers.textContent = `${stats.totalMembers}명`;
        if (avgGuildLevel) avgGuildLevel.textContent = stats.avgLevel; 
        if (avgGuildCombatPower) avgGuildCombatPower.textContent = stats.avgCombatPower;
        if (avgGuildPlaytime) avgGuildPlaytime.textContent = stats.avgPlaytime;

        //  변화량 표시 
        if (stats.previousStats) {
            if (totalGuildMembersChange) totalGuildMembersChange.innerHTML = formatChange(stats.totalMembers, stats.previousStats.totalMembers, false, 0);
            if (avgGuildLevelChange) avgGuildLevelChange.innerHTML = formatChange(stats.avgLevelRaw, stats.previousStats.avgLevelRaw, false, 1);
            if (avgGuildCombatPowerChange) avgGuildCombatPowerChange.innerHTML = formatChange(stats.avgCombatPowerRaw, stats.previousStats.avgCombatPowerRaw, false, 2);
            //  avgGuildPlaytimeChange 업데이트 로직 수정 
            if (avgGuildPlaytimeChange) {
                const diffPlaytimeSeconds = stats.avgPlaytimeRaw - stats.previousStats.avgPlaytimeRaw;
                avgGuildPlaytimeChange.innerHTML = formatPlaytimeChange(diffPlaytimeSeconds);
            }
        } else {
            // 이전 데이터 없을 경우 초기화 또는 메시지 표시
            if (avgGuildLevelChange) avgGuildLevelChange.innerHTML = ``;
            if (avgGuildCombatPowerChange) avgGuildCombatPowerChange.innerHTML = ``;
            if (avgGuildPlaytimeChange) avgGuildPlaytimeChange.innerHTML = ``;
        }

        // 직업 분포 원형 그래프
        const jobLabels = Object.keys(stats.jobDistribution);
        const jobData = Object.values(stats.jobDistribution);
        const backgroundColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9933',
            '#C9CBCF', '#E7E9ED', '#8AC926', '#FFCA3A', '#6A4C93', '#F4A261',
            '#B0D9B1', '#C1A3BB', '#8D99AE', '#264653', '#E9C46A', '#F4A261',
            '#E76F51', '#A7C957'
        ];

        if (jobDistributionChartCanvas) {
            jobDistributionChartInstance = updateChart(jobDistributionChartCanvas, 'pie', {
                labels: jobLabels,
                datasets: [{
                    data: jobData,
                    backgroundColor: backgroundColors.slice(0, jobLabels.length),
                    hoverOffset: 8,
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            }, {
                responsive: true,
                maintainAspectRatio: true, // 컨테이너 크기에 맞춰 유연하게 조절
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 14
                            },
                            boxWidth: 20
                        }
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 13, weight: 'bold', family: "'Noto Sans KR', sans-serif" },
                        bodyFont: { size: 12, family: "'Noto Sans KR', sans-serif" },
                        boxPadding: 4,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                    label += `${formatNumber(context.parsed)}명 (${percentage}%)`;
                                }
                                return label;
                            }
                        }
                    }
                }
            });
        }
        
        // 직업 분포 목록 표시
        if (jobDistributionList) {
            if (jobLabels.length > 0) {
                // 직업 인원수로 내림차순 정렬 (최신 데이터와 1주 전 데이터 비교)
                const sortedJobsWithChange = [];
                const previousDataIndex = rankingFileDates.findIndex(dateInfo => dateInfo.date === latestAvailableDateInfo.date) - 1; // 1주 전 인덱스
                const previousSnapshotData = previousDataIndex >= 0 ? allHistoricalData[rankingFileDates[previousDataIndex].date] : [];
                const previousJobDistribution = previousSnapshotData ? previousSnapshotData.reduce((acc, user) => {
                    const job = normalizeJobName(user['직업']) || '알 수 없음';
                    acc[job] = (acc[job] || 0) + 1;
                    return acc;
                }, {}) : {};

                Object.entries(stats.jobDistribution).sort(([, a], [, b]) => b - a).forEach(([job, count]) => {
                    const prevCount = previousJobDistribution[job] || 0;
                    const change = count - prevCount;
                    sortedJobsWithChange.push({ job, count, change });
                });


                let listHtml = '<h3>직업 순위</h3><ol>';
                sortedJobsWithChange.forEach(({ job, count, change }) => {
                    let changeTextContent = '';
                    if (change > 0) changeTextContent = `(+${change})`;
                    else if (change < 0) changeTextContent = `(${change})`;
                    else changeTextContent = `(-)`;

                    let changeClass = '';
                    if (change > 0) changeClass = 'change-up';
                    else if (change < 0) changeClass = 'change-down';
                    else changeClass = 'change-same';

                    listHtml += `<li>
                                    <span class="job-name">${job}</span>
                                    <span class="job-stats">
                                        <span class="job-value">${count}명</span>
                                        <span class="job-change-value ${changeClass}">${changeTextContent}</span>
                                    </span>
                                </li>`;
                });
                listHtml += '</ol>';
                jobDistributionList.innerHTML = listHtml;
            } else {
                jobDistributionList.innerHTML = '<p class="no-results-message">직업 분포 데이터를 불러올 수 없습니다.</p>';
            }
        }
    }

    // ======================== 서버 TOP 15 랭킹 표시 ========================
    function displayServerTop15(sortBy = 'combatPower', filterJob = null) { // 함수 이름 변경 및 인자 추가
        if (!top10RankingList) return; // top10RankingList는 TOP 15 랭킹을 표시하는 영역 ID이므로 유지

        if (currentRankingData.length === 0) {
            top10RankingList.innerHTML = '<p class="no-results-message">TOP 15 랭킹 데이터를 불러올 수 없습니다.</p>';
            return;
        }

        // 직업별 보기 모드인데 직업이 선택되지 않은 경우
        if (sortBy === 'job' && !filterJob) {
            top10RankingList.innerHTML = '<p class="no-results-message">원하는 직업을 선택하여 랭킹을 확인하세요.</p>';
            return;
        }

        let sortedData = [...currentRankingData]; // currentRankingData는 이미 닉네임 전처리된 최신 데이터
        let sortKey = ''; // 정렬 기준이 되는 객체 키

        // 직업 필터링 적용
        if (sortBy === 'job' && filterJob) {
            sortedData = sortedData.filter(u => normalizeJobName(u['직업']) === filterJob);
            // 직업별 랭킹은 기본적으로 전투력 순으로 정렬
            sortKey = '최고 전투력';
            sortedData.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
        } else {
            //  정렬 기준에 따라 데이터 정렬 
            switch (sortBy) {
                case 'level':
                    sortKey = '레벨';
                    sortedData.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
                    break;
                case 'playtime':
                    sortKey = '플레이타임_초'; // 데이터에 따라 적절한 키 사용
                    sortedData.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
                    break;
                case 'combatPower':
                default: // 기본은 전투력
                    sortKey = '최고 전투력';
                    sortedData.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
                    break;
            }
        }

        const top15Users = sortedData.slice(0, 15);

        let html = '';
        if (top15Users.length === 0) {
            html = '<p class="no-results-message">TOP 15 랭킹 정보가 없습니다.</p>';
        } else {
            top15Users.forEach((user, index) => {
                const skinUrl = `https://mineskin.eu/headhelm/${user['닉네임']}/100.png`;
                let displayValue = ''; // 랭킹 옆에 표시될 값 (전투력, 레벨, 플레이타임)

                switch (sortBy) {
                    case 'level':
                        displayValue = `레벨: Lv. ${user[sortKey]}`;
                        break;
                    case 'playtime':
                        displayValue = `시간: ${formatPlaytime(user[sortKey])}`; // formatPlaytime 함수 활용
                        break;
                    case 'combatPower':
                    case 'job':
                    default:
                        displayValue = `전투력: ${formatNumber(user[sortKey])}`;
                        break;
                }
                
                html += `
                    <div class="top10-ranking-item" data-nickname="${user['닉네임']}" data-job="${user['직업']}" data-uuid="${user['UUID']}">
                        <span class="rank-number">${index + 1}</span>
                        <img src="images/스킨/placeholder_skin.png"
                            data-actual-src="${skinUrl}"
                            alt="${user['닉네임']} 스킨" 
                            class="rank-skin" 
                            onload="this.classList.add('loaded'); this.src = this.dataset.actualSrc;"
                            onerror="this.onerror=null; this.src='images/스킨/placeholder_skin.png'; this.classList.add('error');">
                        <div class="rank-info">
                            <h4>${user['닉네임']}</h4>
                            <p>직업: ${normalizeJobName(user['직업'])}</p>
                            <p>${displayValue}</p>
                        </div>
                    </div>
                `;
            });
        }
        top10RankingList.innerHTML = html;

        // TOP 15 항목 클릭 이벤트 추가 (기존 로직 유지, 필요시 characterKey 사용하도록 확장)
        top10RankingList.querySelectorAll('.top10-ranking-item').forEach(item => {
            item.addEventListener('click', function() {
                const nickname = this.dataset.nickname;
                const job = this.dataset.job;
                const uuid = this.dataset.uuid;

                // 해당 닉네임의 최신 정보(allHistoricalData는 이미 전처리되어 있음)를 찾습니다.
                // displaySelectedUserProfile에서 사용할 userRecord와 characterKey를 생성
                const userRecord = currentRankingData.find(u => u['닉네임'] === nickname && normalizeJobName(u['직업']) === normalizeJobName(job));
                const characterKey = `${nickname}_${normalizeJobName(job)}`; // characterKey는 검색창 로직에서 고유하게 생성되는 것을 따름.
                                                                        // 여기서는 단순화하여 UUID 전까지 사용하던 방식 활용.
                                                                        // 실제 검색은 `searchUser`가 처리할 것이므로, 닉네임만 전달해도 됩니다.
                                                                        // 아니면 해당 아이템을 클릭했을 때의 UUID 기반으로 통합 프로필 검색.

                if (nickname) {
                    // 검색창에 닉네임을 넣고 searchUser 함수를 호출하여 통합 검색 로직을 타게 합니다.
                    nicknameInput.value = nickname;
                    searchButton.click(); // 검색 버튼 클릭 (자동 검색 실행)
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 상단으로 스크롤
                }
            });
        });
    }

    // ======================== 플레이어 상세 분석 ========================
    
    function analyzePlayerData(player, allUsersData) {
        if (!player || !allUsersData || allUsersData.length === 0) {
            return null;
        }
    
        const totalPlayers = allUsersData.length;
    
        // 1. 서버 전체 백분위
        const serverPercentile = ((player['랭킹'] / totalPlayers) * 100).toFixed(2);
    
        // 1-2. 전투력 백분위 (전투력 기준)
        const sortedByCP = [...allUsersData].sort((a, b) => (parseFloat(b['최고 전투력']) || 0) - (parseFloat(a['최고 전투력']) || 0));
        const cpRank = sortedByCP.findIndex(p => p['UUID'] === player['UUID'] && p['characterKey'] === player['characterKey']) + 1;
        const cpPercentile = ((cpRank / totalPlayers) * 100).toFixed(2);

        // 2. 직업 내 순위 및 백분위
        const sameClassPlayers = allUsersData.filter(p => p['직업'] === player['직업']);
        sameClassPlayers.sort((a, b) => (parseFloat(b['최고 전투력']) || 0) - (parseFloat(a['최고 전투력']) || 0));
        const classRank = sameClassPlayers.findIndex(p => p['UUID'] === player['UUID'] && p['characterKey'] === player['characterKey']) + 1;
        const classPercentile = (sameClassPlayers.length > 0) ? ((classRank / sameClassPlayers.length) * 100).toFixed(1) : "0.0";
    
        // 3. 시간당 전투력 효율
        const hoursPlayed = player['플레이타임_초'] / 3600;
        const cpEfficiency = hoursPlayed > 1 ? player['최고 전투력'] / hoursPlayed : 0; // 1시간 이상 플레이한 경우만 계산
    
        // 4. 동일 레벨 평균 전투력 대비
        const sameLevelPlayers = allUsersData.filter(p => p['레벨'] === player['레벨']);
        let vsLevelAvg = 0;
        const avgCpSameLevelVal = sameLevelPlayers.length > 0 ? sameLevelPlayers.reduce((sum, p) => sum + (p['최고 전투력'] || 0), 0) / sameLevelPlayers.length : 0;
        if (sameLevelPlayers.length > 1 && avgCpSameLevelVal > 0) { // 본인 외 다른 유저가 있을 때만 비교
            vsLevelAvg = ((player['최고 전투력'] - avgCpSameLevelVal) / avgCpSameLevelVal) * 100;
        }
    
        // 4-2. 동일 직업 & 동일 레벨대 평균 전투력
        const levelRange = 5;
        const playerLevel = player['레벨'];
        const sameJobAndLevelRangePlayers = allUsersData.filter(p => 
            p['직업'] === player['직업'] && 
            p['레벨'] >= playerLevel - levelRange && 
            p['레벨'] <= playerLevel + levelRange
        );
        const avgCpSameJobAndLevelRangeVal = sameJobAndLevelRangePlayers.length > 0
            ? sameJobAndLevelRangePlayers.reduce((sum, p) => sum + (parseFloat(p['최고 전투력']) || 0), 0) / sameJobAndLevelRangePlayers.length
            : 0;
    
        // 5. 전투력 등급 (상위 % 기준)
        let cpGrade = 'F';
        const cpPercentileVal = parseFloat(cpPercentile);
        if (cpPercentileVal <= 1) cpGrade = 'SSS';
        else if (cpPercentileVal <= 5) cpGrade = 'SS';
        else if (cpPercentileVal <= 10) cpGrade = 'S';
        else if (cpPercentileVal <= 25) cpGrade = 'A';
        else if (cpPercentileVal <= 50) cpGrade = 'B';
        else if (cpPercentileVal <= 75) cpGrade = 'C';
    
        // 6. 차트용 데이터 점수화 (개선된 로직: 평균 고려 및 상대평가 + 순위 반영)
        const allCPs = allUsersData.map(p => parseFloat(p['최고 전투력']) || 0);
        const allLevels = allUsersData.map(p => p['레벨'] || 0);
        const allPlaytimes = allUsersData.map(p => p['플레이타임_초'] || 0);

        const maxCP = Math.max(...allCPs, 1); // 0 나누기 방지
        const avgCP = allCPs.reduce((a, b) => a + b, 0) / (allCPs.length || 1);

        const maxLevel = Math.max(...allLevels, 1);

        const maxPlaytime = Math.max(...allPlaytimes, 1);
        const avgPlaytime = allPlaytimes.reduce((a, b) => a + b, 0) / (allPlaytimes.length || 1);

        // 1. 수치 기반 점수 (평균=50점 기준 상대평가)
        const getScoreWithAvg = (val, max, avg) => {
            if (val <= avg) return (val / Math.max(avg, 1)) * 50;
            return 50 + ((val - avg) / Math.max(max - avg, 1)) * 50;
        };

        // 2. 순위 기반 점수 (1위=100점, 꼴등=0점)
        const getRankScore = (val, allValues) => {
             const sorted = [...allValues].sort((a, b) => b - a);
             const rank = sorted.indexOf(val) + 1; 
             const total = sorted.length;
             if (total <= 1) return 100;
             return 100 - ((rank - 1) / (total - 1) * 100);
        };

        // 3. 하이브리드 점수 (수치 40% + 순위 60%) - 압도적 1위 때문에 2위가 점수 깎이는 현상 방지
        const getHybridScore = (val, max, avg, allValues) => {
            const valueScore = getScoreWithAvg(val, max, avg);
            const rankScore = getRankScore(val, allValues);
            return (valueScore * 0.4) + (rankScore * 0.6);
        };

        const cpScore = getHybridScore(parseFloat(player['최고 전투력'] || 0), maxCP, avgCP, allCPs);
        const levelScore = ((player['레벨'] || 0) / maxLevel) * 100; // 레벨은 만렙 기준 비율
        const playtimeScore = getHybridScore((player['플레이타임_초'] || 0), maxPlaytime, avgPlaytime, allPlaytimes);
        
        const serverRankScore = 100 - parseFloat(serverPercentile); 
        
        // 직업 내 순위 점수 (1위~꼴등 비율, 1위=100점, 꼴등=0점)
        const classTotal = sameClassPlayers.length;
        let classRankScore = 100;
        if (classTotal > 1) {
            classRankScore = ((classTotal - classRank) / (classTotal - 1)) * 100;
        }
    
        return {
            serverPercentile,
            cpPercentile,
            classRank,
            classPercentile,
            cpEfficiency: cpEfficiency,
            vsLevelAvg: vsLevelAvg.toFixed(1),
            avgCpSameLevel: avgCpSameLevelVal,
            avgCpSameJobAndLevelRange: avgCpSameJobAndLevelRangeVal,
            cpGrade,
            chartData: {
                cpScore,
                levelScore,
                playtimeScore,
                serverRankScore,
                classRankScore,
            }
        };
    }
    // 새로운 함수: 상세 분석 섹션 렌더링 (그래프 아래 위치)
    function renderDetailedAnalysis(player) {
        const wrapper = document.getElementById('detailedAnalysisWrapper');
        const metricsContainer = document.getElementById('newAnalysisMetricsContainer');
        const radarCanvas = document.getElementById('analysisRadarChart');
        const barCanvas = document.getElementById('analysisBarChart');

        if (!wrapper || !metricsContainer || !radarCanvas || !barCanvas) return;

        wrapper.style.display = 'block'; // 섹션 표시

        const analysisData = analyzePlayerData(player, currentRankingData);
        if (!analysisData) {
            metricsContainer.innerHTML = '<p class="no-results-message">데이터 부족으로 분석할 수 없습니다.</p>';
            return;
        }

        // 1. 상세 지표 (KPI) 생성
        metricsContainer.innerHTML = `
            <div class="metric-box">
                <span class="label">전투력 등급</span>
                <span class="value grade-${analysisData.cpGrade}">${analysisData.cpGrade}</span>
                <span class="sub-text">상위 ${analysisData.cpPercentile}%</span>
            </div>
            <div class="metric-box">
                <span class="label">직업 내 순위</span>
                <span class="value">#${analysisData.classRank}</span>
                <span class="sub-text">상위 ${analysisData.classPercentile}%</span>
            </div>
            <div class="metric-box">
                <span class="label">시간당 전투력 효율</span>
                <span class="value">${formatNumber(analysisData.cpEfficiency, 1)}</span>
                <span class="sub-text">CP / Hour</span>
            </div>
            <div class="metric-box">
                <span class="label">동일 레벨 대비</span>
                <span class="value ${analysisData.vsLevelAvg > 0 ? 'change-up' : 'change-down'}">
                    ${analysisData.vsLevelAvg > 0 ? '+' : ''}${analysisData.vsLevelAvg}%
                </span>
                <span class="sub-text">평균 전투력 기준</span>
            </div>
        `;

        // 2. Radar 차트 렌더링 (육각형 능력치)
        if (analysisRadarChartInstance) {
            analysisRadarChartInstance.destroy();
        }
        
        // 차트 데이터 준비
        const radarDataValues = [
            analysisData.chartData.cpScore,
            analysisData.chartData.levelScore,
            analysisData.chartData.playtimeScore,
            analysisData.chartData.serverRankScore,
            analysisData.chartData.classRankScore
        ];

        // 모든 값이 0이거나 매우 작으면 차트가 안 예쁘므로 최소값 보정 시각적 처리 (옵션)
        // 여기서는 있는 그대로 보여줍니다.

        const radarCtx = radarCanvas.getContext('2d');
        analysisRadarChartInstance = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['전투력', '레벨', '활동량', '서버 순위', '직업 내 순위'],
                datasets: [{
                    label: player['닉네임'],
                    data: [
                        analysisData.chartData.cpScore,
                        analysisData.chartData.levelScore,
                        analysisData.chartData.playtimeScore,
                        analysisData.chartData.serverRankScore,
                        analysisData.chartData.classRankScore
                    ],
                    backgroundColor: 'rgba(52, 152, 219, 0.25)',
                    borderColor: '#2980b9',
                    pointBackgroundColor: '#2980b9',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#2980b9'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false, // 레이블이 하나뿐이라 숨김
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: { family: "'Noto Sans KR', sans-serif" },
                        bodyFont: { family: "'Noto Sans KR', sans-serif" },
                        callbacks: {
                            label: function(context) {
                                // 점수 뒤에 '점' 붙이기
                                return `${context.label}: ${context.raw.toFixed(0)}점`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        pointLabels: {
                            font: { size: 12 },
                            color: '#333'
                        },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: {
                            backdropColor: 'rgba(255, 255, 255, 0.75)',
                            stepSize: 20
                        }
                    }
                }
            }
        });

        // 3. Bar 차트 렌더링 (비교 분석)
        if (analysisBarChartInstance) {
            analysisBarChartInstance.destroy();
        }

        const barCtx = barCanvas.getContext('2d');
        analysisBarChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['내 전투력', '동일 레벨 평균', '동일 레벨대 직업 평균'],
                datasets: [{
                    label: '전투력',
                    data: [
                        player['최고 전투력'],
                        analysisData.avgCpSameLevel,
                        analysisData.avgCpSameJobAndLevelRange
                    ],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)', // 내 전투력 (파랑)
                        'rgba(149, 165, 166, 0.5)', // 동일 레벨 평균 (회색)
                        'rgba(155, 89, 182, 0.5)'  // 동일 직업 평균 (보라)
                    ],
                    borderColor: [
                        '#2980b9',
                        '#7f8c8d',
                        '#8e44ad'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: { family: "'Noto Sans KR', sans-serif" },
                        bodyFont: { family: "'Noto Sans KR', sans-serif" },
                        callbacks: {
                            label: function(context) {
                                return formatNumber(context.raw);
                            }
                        }
                    }
                }
            },
            plugins: [{ // 내 전투력 막대 위에만 수치를 표시하기 위한 커스텀 플러그인
                id: 'customDatalabel',
                afterDatasetsDraw: (chart) => {
                    const { ctx, data } = chart;
                    const meta = chart.getDatasetMeta(0); // 첫 번째 데이터셋의 메타 정보
                    if (meta.data.length > 0) {
                        const firstBar = meta.data[0]; // 첫 번째 막대 요소
                        const value = data.datasets[0].data[0]; // 첫 번째 막대의 값

                        const secondsBar = meta.data[1]; // 두 번째 막대 요소
                        const value2 = data.datasets[0].data[1]; // 두 번째 막대의 값

                        const thirdBar = meta.data[2]; // 세 번째 막대 요소
                        const value3 = data.datasets[0].data[2]; // 세 번째 막대의 값

                        ctx.save();
                        ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
                        ctx.fillStyle = '#2c3e50';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        
                        // 막대 상단에 텍스트 그리기
                        ctx.fillText(formatNumber(value), firstBar.x, firstBar.y + 20);
                        ctx.fillText(formatNumber(value2), secondsBar.x, secondsBar.y + 20);
                        ctx.fillText(formatNumber(value3), thirdBar.x, thirdBar.y + 20);
                        ctx.restore();
                    }
                }
            }]
        });
    }

    let currentLevelObserver = null;

    // ======================== Toast 메시지 함수 (유틸리티) ========================
    /**
     * 화면에 토스트 메시지를 표시합니다.
     * @param {string} message 표시할 메시지
     * @param {'info'|'warning'|'error'} type 메시지 유형 (아이콘 및 색상 변경)
     * @param {number} duration 메시지 표시 시간 (밀리초)
     */
    function showToast(message, type = 'info', duration = 3000) {
        if (!toastContainer) {
            console.error('Toast container not found!');
            return;
        }

        const toast = document.createElement('div');
        toast.classList.add('toast', type);
        
        let iconClass = '';
        if (type === 'info') iconClass = 'fas fa-info-circle';
        else if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
        else if (type === 'error') iconClass = 'fas fa-times-circle';

        toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
        
        toast.style.setProperty('--toast-duration', `${duration / 1000}s`); // CSS 변수에 애니메이션 지속 시간 전달

        toastContainer.prepend(toast); // 가장 최근 토스트가 위에 표시되도록

        // 메시지 사라지는 타이머 설정
        setTimeout(() => {
            toast.remove(); // DOM에서 토스트 제거
        }, duration + 400); // 애니메이션 시간(0.4s)만큼 추가하여 자연스럽게 사라지도록
    }


    // ======================== 레벨별 통계 분석 이벤트 핸들러 ========================
    function handleLevelAnalysisControlsClick(event) {
        const target = event.target;

        if (target.classList.contains('level-change-btn')) {
            const change = parseInt(target.dataset.change, 10);
            
            if (!currentRankingData || currentRankingData.length === 0) {
                console.warn("Level change attempted, but no ranking data available for level limits.");
                return;
            }

            const allLevels = currentRankingData.map(user => user['레벨'] || 0).filter(level => level > 0);
            const minServerLevel = allLevels.length > 0 ? Math.min(...allLevels) : 1;
            const maxServerLevel = allLevels.length > 0 ? Math.max(...allLevels) : 1000;
            const totalUsers = currentRankingData.length; // 총 유저 수

            let newLevelCandidate = currentAnalyzedLevel + change; // 클램핑 전의 후보 레벨
            let newLevel = Math.max(minServerLevel, Math.min(newLevelCandidate, maxServerLevel)); // 클램핑 후 최종 레벨
            
            //  Toast 메시지 트리거 로직 
            // 레벨이 실제로 변경되지 않았지만 (newLevel === currentAnalyzedLevel),
            // 변경을 시도했던 레벨 (newLevelCandidate)은 현재 레벨과 달랐을 경우
            if (newLevel === currentAnalyzedLevel && newLevelCandidate !== currentAnalyzedLevel) {
                showToast(`현재 집계된 ${formatNumber(totalUsers)}명의 유저 데이터 중에서 최소 레벨과 최대 레벨은 ${minServerLevel}~${maxServerLevel}입니다.`, 'info', 4000);
                
                // 경계에 도달하여 레벨 변경은 없었지만, UI 갱신 (옵저버 중지/재시작 포함)
                if (currentLevelObserver) currentLevelObserver.disconnect();
                updateLevelAnalysisDisplay(); 
                if (currentLevelObserver) currentLevelObserver.observe(currentAnalyzedLevelSpan, { childList: true, characterData: true, subtree: true });
                return; // 더 이상의 로직 실행 방지
            }
            //  Toast 메시지 로직 끝 

            if (newLevel !== currentAnalyzedLevel) {
                currentAnalyzedLevel = newLevel; 

                // 옵저버 중지: 우리가 업데이트할 때는 감시하지 않도록
                if (currentLevelObserver) currentLevelObserver.disconnect();
                updateLevelAnalysisDisplay(); 
                // 옵저버 재시작: 다른 스크립트가 다시 덮어쓰는지 감시 시작
                if (currentLevelObserver) currentLevelObserver.observe(currentAnalyzedLevelSpan, { childList: true, characterData: true, subtree: true });
            } else {
                // 이 else 블록은 change가 0이거나 (이론적으로 불가능)
                // newLevelCandidate도 currentAnalyzedLevel과 동일한 경우에만 도달합니다.
                // 그러나 사용자 인터랙션이 있었으므로, UI를 갱신하는 것이 안전합니다.
                if (currentLevelObserver) currentLevelObserver.disconnect();
                updateLevelAnalysisDisplay(); 
                if (currentLevelObserver) currentLevelObserver.observe(currentAnalyzedLevelSpan, { childList: true, characterData: true, subtree: true });
            }
        } 
        else if (target.id === 'resetLevelAnalysis') {
            if (!currentRankingData || currentRankingData.length === 0) {
                console.warn("Reset level analysis attempted, but no ranking data available for average.");
                return;
            }

            const allLevels = currentRankingData.map(user => user['레벨'] || 0).filter(level => level > 0);
            const avgServerLevel = allLevels.length > 0 ? Math.round(allLevels.reduce((sum, level) => sum + level, 0) / allLevels.length) : 1;
            
            // 평균 레벨로 리셋
            currentAnalyzedLevel = avgServerLevel; 

            // 옵저버 중지 후 업데이트, 그리고 재시작
            if (currentLevelObserver) currentLevelObserver.disconnect();
            updateLevelAnalysisDisplay();
            if (currentLevelObserver) currentLevelObserver.observe(currentAnalyzedLevelSpan, { childList: true, characterData: true, subtree: true });
        }
    }


    // ======================== 레벨별 통계 분석 초기화 함수 ========================
    function initializeLevelAnalysis() {
        if (levelAnalysisInitialized) {
            console.error("CRITICAL ERROR: initializeLevelAnalysis called more than once. This will cause duplicate event listeners.");
            return;
        }

        if (levelAnalysisControls) {
            levelAnalysisControls.removeEventListener('click', handleLevelAnalysisControlsClick); 
        }
        
        if (!currentRankingData || currentRankingData.length === 0) {
            if (levelAnalysisResults) levelAnalysisResults.innerHTML = '<p class="error-message">데이터를 불러올 수 없습니다. 다시 시도해 주세요.</p>';
            return;
        }

        const allLevels = currentRankingData.map(user => user['레벨'] || 0).filter(level => level > 0);
        const avgServerLevel = allLevels.length > 0 ? Math.round(allLevels.reduce((sum, level) => sum + level, 0) / allLevels.length) : 1;

        currentAnalyzedLevel = avgServerLevel; 
       
        // MutationObserver 초기화 및 감지
        if (currentAnalyzedLevelSpan) {
            currentLevelObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (currentAnalyzedLevelSpan && (mutation.type === 'characterData' || mutation.type === 'childList')) {
                        const currentDOMValue = parseInt(currentAnalyzedLevelSpan.textContent, 10);
                        if (!isNaN(currentDOMValue) && currentDOMValue !== currentAnalyzedLevel) { 
                            console.error(`!!!! CRITICAL DOM OVERWRITE DETECTED !!!!`);
                            console.error(`DOM value was changed to "${currentDOMValue}" but our JS value is "${currentAnalyzedLevel}".`);
                            console.error(`Reverting DOM to our intended value: ${currentAnalyzedLevel}`);
                            
                            currentLevelObserver.disconnect();
                            currentAnalyzedLevelSpan.textContent = currentAnalyzedLevel;
                            currentLevelObserver.observe(currentAnalyzedLevelSpan, { childList: true, characterData: true, subtree: true });
                        }
                    }
                });
            });

            currentLevelObserver.observe(currentAnalyzedLevelSpan, { childList: true, characterData: true, subtree: true });

            currentAnalyzedLevelSpan.textContent = currentAnalyzedLevel;
        }
        
        updateLevelAnalysisDisplay(); 

        if (levelAnalysisControls) {
            levelAnalysisControls.addEventListener('click', handleLevelAnalysisControlsClick);
        }

        levelAnalysisInitialized = true; 
    }


    // ======================== 레벨별 통계 분석 디스플레이 업데이트 함수 ========================
    function updateLevelAnalysisDisplay() {
        if (!currentAnalyzedLevelSpan || !levelAnalysisResults) {
            console.error('updateLevelAnalysisDisplay: 필수 DOM 요소 (currentAnalyzedLevelSpan 또는 levelAnalysisResults)가 없습니다.');
            return;
        }

        currentAnalyzedLevelSpan.textContent = currentAnalyzedLevel; 
        if (!currentRankingData || currentRankingData.length === 0) {
            levelAnalysisResults.innerHTML = '<p class="error-message">통계 데이터를 불러올 수 없습니다. 참고로 현재까지 집계된 유저수는 ' + (currentRankingData ? formatNumber(currentRankingData.length) : '0') + '명입니다.</p>';
            console.warn('updateLevelAnalysisDisplay: currentRankingData가 없거나 비어 있습니다. 통계 업데이트 중단.');
            return;
        }
        
        analyzeLevelData(currentAnalyzedLevel);
    }


    // ======================== 레벨 데이터 분석 및 결과 표시 함수 ========================
    function analyzeLevelData(level) {
        if (!currentRankingData || currentRankingData.length === 0 || isNaN(level) || level <= 0) {
            levelAnalysisResults.innerHTML = '<p class="error-message">유효한 레벨을 선택하거나 데이터를 불러와 주세요. 참고로 현재까지 집계된 유저수는 ' + (currentRankingData ? formatNumber(currentRankingData.length) : '0') + '명입니다.</p>';
            console.error('analyzeLevelData: 유효하지 않은 입력 또는 데이터 부족.');
            return;
        }

        const usersAtLevel = currentRankingData.filter(user => user['레벨'] === level);

        if (usersAtLevel.length === 0) {
            levelAnalysisResults.innerHTML = `<p class="initial-message">레벨 ${level} 유저 데이터가 없습니다. 참고로 현재까지 집계된 유저수는 ` + (currentRankingData ? formatNumber(currentRankingData.length) : '0') + '명입니다.</p>';
            console.warn(`analyzeLevelData: 레벨 ${level}에 해당하는 유저 데이터가 없습니다.`);
            return;
        }

        const expValues = usersAtLevel.map(user => user['경험치'] || 0).filter(exp => exp >= 0);
        const minExp = expValues.length > 0 ? Math.min(...expValues) : 0;
        const maxExp = expValues.length > 0 ? Math.max(...expValues) : 0;
        
        const combatPowers = usersAtLevel.map(user => parseFloat(user['최고 전투력']) || 0).filter(cp => cp > 0);
        const minCombatPower = combatPowers.length > 0 ? Math.min(...combatPowers) : 0;
        const maxCombatPower = combatPowers.length > 0 ? Math.max(...combatPowers) : 0;

        const totalCombatPower = combatPowers.reduce((acc, cp) => acc + (parseFloat(cp) || 0), 0); // parseFloat으로 변환하여 합산
        const avgCombatPower = combatPowers.length > 0 ? totalCombatPower / combatPowers.length : 0;

        //  평균 플레이 타임 계산 로직 추가 
        const totalPlaytimeSeconds = usersAtLevel.reduce((acc, user) => acc + (user['플레이타임_초'] || 0), 0);
        const avgPlaytimeSeconds = usersAtLevel.length > 0 ? totalPlaytimeSeconds / usersAtLevel.length : 0;
        const avgPlaytimeFormatted = formatPlaytime(avgPlaytimeSeconds);

        let html = '<ul>';
        html += `<li><strong>레벨 ${level} 유저 수:</strong> <span class="highlight-clickable" id="btnShowLevelUsers" title="클릭하여 유저 목록 보기"> <i class="fas fa-search"></i>${formatNumber(usersAtLevel.length)}명</span></li>`;
        html += `<li><strong>경험치 범위:</strong> <span>${formatNumber(minExp)} ~ ${formatNumber(maxExp)}</span></li>`;
        html += `<li><strong>전투력 범위:</strong> <span>${formatNumber(minCombatPower)} ~ ${formatNumber(maxCombatPower)}</span></li>`;
        html += `<li><strong>평균 전투력:</strong> <span>${formatNumber(Number(avgCombatPower.toFixed(0)))}</span></li>`;
        html += `<li><strong>평균 플레이타임:</strong> <span>${avgPlaytimeFormatted}</span></li>`;
        html += '</ul>';
        
        levelAnalysisResults.innerHTML = html;
    }

    // ======================== 레벨별 유저 리스트 모달 관련 로직 ========================
    
    // 레벨별 유저 범위 클릭 이벤트 (이벤트 위임 사용)
    if (levelAnalysisResults) {
        levelAnalysisResults.addEventListener('click', function(e) {
            const target = e.target.closest('.highlight-clickable');
            if (target && target.id === 'btnShowLevelUsers') {
                openLevelUserListModal(currentAnalyzedLevel);
            }
        });
    }

    function openLevelUserListModal(level) {
        if (!currentRankingData) return;

        // 해당 레벨 유저 필터링하여 저장
        currentLevelUsersData = currentRankingData.filter(u => u['레벨'] === level);
        
        // UI 초기화
        if (levelUserSearchInput) levelUserSearchInput.value = '';
        currentLevelSortDirection = 'desc';
        updateSortButtonStyles();

        if (levelUserListTitle) levelUserListTitle.textContent = `Lv.${level} 유저 목록 (${currentLevelUsersData.length}명)`;
        
        renderLevelUserList();

        if (levelUserListModal) levelUserListModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }

    function renderLevelUserList() {
        if (!levelUserListContent) return;

        let users = [...currentLevelUsersData];

        // 1. 검색 필터링
        if (levelUserSearchInput) {
            const searchText = levelUserSearchInput.value.trim().toLowerCase();
            if (searchText) {
                users = users.filter(u => u['닉네임'].toLowerCase().includes(searchText));
            }
        }

        // 2. 정렬 (경험치 기준)
        users.sort((a, b) => {
            const expA = a['경험치'] || 0;
            const expB = b['경험치'] || 0;
            return currentLevelSortDirection === 'desc' ? expB - expA : expA - expB;
        });

        let html = '';
        if (users.length === 0) {
            html = '<p class="no-results-message">검색 결과가 없습니다.</p>';
        } else {
            users.forEach((user, index) => {
                const skinUrl = `https://mineskin.eu/headhelm/${user['닉네임']}/100.png`;
                html += `
                    <div class="top10-ranking-item modal-user-item" style="cursor: pointer; background-color: #f8f9fa;" data-nickname="${user['닉네임']}">
                        <span class="rank-number" style="font-size: 1rem; width: 30px;">#${index + 1}</span>
                        <img src="images/스킨/placeholder_skin.png"
                            data-actual-src="${skinUrl}"
                            alt="${user['닉네임']} 스킨" 
                            class="rank-skin" 
                            style="width: 40px; height: 40px; margin-right: 10px;"
                            onload="this.classList.add('loaded'); this.src = this.dataset.actualSrc;"
                            onerror="this.onerror=null; this.src='images/스킨/placeholder_skin.png'; this.classList.add('error');">
                        <div class="rank-info">
                            <h4 style="font-size: 1rem; margin-bottom: 2px;">${user['닉네임']} <span style="font-size: 0.8em; color: #666; font-weight: normal;">(${normalizeJobName(user['직업'])})</span></h4>
                            <p style="font-size: 0.85rem; color: #555;">전투력: <strong>${formatNumber(user['최고 전투력'])}</strong> | 경험치: ${formatNumber(user['경험치'])}</p>
                        </div>
                    </div>
                `;
            });
        }
        if (levelUserListContent) levelUserListContent.innerHTML = html;
        
        // 모달 내 유저 클릭 시 프로필 검색 기능 연결
        const listItems = levelUserListContent.querySelectorAll('.modal-user-item');
        listItems.forEach(item => {
            item.addEventListener('click', function() {
                const nickname = this.dataset.nickname;
                if (nickname) {
                    if (levelUserListModal) levelUserListModal.classList.remove('show');
                    document.body.style.overflow = '';
                    
                    if (nicknameInput && searchButton) {
                        nicknameInput.value = nickname;
                        searchButton.click();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
            });
        });

    }

    function updateSortButtonStyles() {
        if (sortLevelUsersAscBtn && sortLevelUsersDescBtn) {
            if (currentLevelSortDirection === 'asc') {
                sortLevelUsersAscBtn.classList.add('active');
                sortLevelUsersDescBtn.classList.remove('active');
            } else {
                sortLevelUsersAscBtn.classList.remove('active');
                sortLevelUsersDescBtn.classList.add('active');
            }
        }
    }

    // 모달 닫기 이벤트
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            if (levelUserListModal) levelUserListModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
    if (levelUserListModal) {
        levelUserListModal.addEventListener('click', (e) => {
            if (e.target === levelUserListModal) {
                levelUserListModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    // 모달 내부 검색 및 정렬 이벤트 리스너
    if (levelUserSearchInput) {
        levelUserSearchInput.addEventListener('input', renderLevelUserList);
    }
    if (sortLevelUsersAscBtn) {
        sortLevelUsersAscBtn.addEventListener('click', () => {
            currentLevelSortDirection = 'asc';
            updateSortButtonStyles();
            renderLevelUserList();
        });
    }
    if (sortLevelUsersDescBtn) {
        sortLevelUsersDescBtn.addEventListener('click', () => {
            currentLevelSortDirection = 'desc';
            updateSortButtonStyles();
            renderLevelUserList();
        });
    }

    // ======================== 모달 내부 맨 위로 가기 버튼 로직 ========================
    const modalScrollToTopBtn = document.getElementById('modalScrollToTopBtn');
    const modalBody = document.querySelector('.modal-body'); // 모달 바디 선택

    if (modalBody && modalScrollToTopBtn) {
        modalBody.addEventListener('scroll', () => {
            if (modalBody.scrollTop > 300) {
                modalScrollToTopBtn.classList.add('show');
            } else {
                modalScrollToTopBtn.classList.remove('show');
            }
        });

        modalScrollToTopBtn.addEventListener('click', () => {
            modalBody.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ======================== 메인 검색 기능 ========================

    function searchUser() {
        const searchText = nicknameInput.value.trim();
        if (!searchText) {
            showInitialMessage('닉네임을 입력해 주세요.', true);
            hideUserProfileAndCharts();
            return;
        }

        //  lowerSearchText를 먼저 선언하여 ReferenceError 방지 
        const lowerSearchText = searchText.toLowerCase(); 

        // 검색 닉네임을 현재(최신) 닉네임으로 치환
        let actualSearchNickname = searchText;
        const searchLowerCase = searchText.toLowerCase();
        
        let isSearchByPastNickname = false; // 과거 닉네임으로 검색했는지 여부를 나타내는 플래그

        if (nicknameToCurrentNicknameMap.has(searchLowerCase)) {
            const mappedNickname = nicknameToCurrentNicknameMap.get(searchLowerCase);
            
            //  핵심 로직 변경: 입력된 닉네임과 매핑된 최신 닉네임이 다른 경우에만 치환 및 안내 
            if (searchLowerCase !== mappedNickname.toLowerCase()) { // 입력 닉네임과 최신 닉네임이 실제로 다르면 과거 닉네임임
                actualSearchNickname = mappedNickname;
                isSearchByPastNickname = true; // 과거 닉네임으로 검색했음을 표시
                //console.log(`[Console Log]: 과거 닉네임 "${searchText}"가 현재 닉네임 "${actualSearchNickname}"으로 치환되어 검색됩니다.`);
                nicknameInput.value = actualSearchNickname; // 검색창 UI도 최신 닉네임으로 업데이트
            } else {
                // 입력 닉네임이 (소문자로) 맵에 존재하지만, 매핑된 닉네임과 동일한 경우 (즉, 현재 닉네임인 경우)
                //console.log(`[Console Log]: "${searchText}"는 매핑되었으나 현재 닉네임과 동일하므로 그대로 검색됩니다.`);
            }
        } else {
            //console.log(`[Console Log]: "${searchText}"는 과거 닉네임 매핑에 없어 그대로 검색됩니다.`);
        }

        //  Toast 메시지는 isSearchByPastNickname 플래그가 true일 때만 표시 
        if (isSearchByPastNickname) {
            showToast(`검색하신 닉네임(` + searchText + `)은 과거 닉네임입니다. 최근에 변경한 닉네임(` + actualSearchNickname + `)으로 자동 검색 합니다.`, 'info', 5000);
        }

        // 최신 랭킹 데이터(currentRankingData)에서 검색어와 일치하는 모든 캐릭터를 찾습니다.
        // currentRankingData에는 이미 characterKey가 부여되어 있습니다.
        const latestMatchingUsers = currentRankingData.filter(user => 
            user['닉네임'].toLowerCase() === actualSearchNickname.toLowerCase()
        );

        if (latestMatchingUsers.length === 0) {
            showInitialMessage(`${searchText}님을 찾을 수 없습니다.`, true);
            hideUserProfileAndCharts();
            return;
        }

        // 검색 성공 시 기록 저장 (실제 검색된 닉네임으로 저장)
        saveSearchHistory(actualSearchNickname);

        //  수정된 코드: 여러 캐릭터일 때 계정 선택 UI 로직 
        if (latestMatchingUsers.length > 1 && accountSelectorContainer && jobSelectionTabs) { 
            accountSelectorContainer.style.display = 'block';
            jobSelectionTabs.innerHTML = ''; // 기존 탭 제거

            latestMatchingUsers.forEach((userRecord, index) => {
                const button = document.createElement('button');
                button.classList.add('tab-button');
                
                //  UI 표시: 닉네임 (직업 Lv.레벨) - 각 캐릭터를 구분할 수 있도록 
                button.textContent = `${normalizeJobName(userRecord['직업'])} Lv.${userRecord['레벨']}`;
                
                button.dataset.characterKey = userRecord.characterKey; //  캐릭터의 고유 키를 data 속성에 저장 

                //  userRecord 객체 자체를 JSON 문자열로 버튼의 dataset에 저장 
                // displaySelectedUserProfile에서 바로 사용될 수 있도록 합니다.
                button.dataset.userRecord = JSON.stringify(userRecord);

                jobSelectionTabs.appendChild(button);

                button.addEventListener('click', () => {
                    Array.from(jobSelectionTabs.children).forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    //  클릭된 버튼에서 userRecord와 characterKey를 가져와 displaySelectedUserProfile에 전달 
                    const selectedCharacterKey = button.dataset.characterKey;
                    const selectedUserRecord = JSON.parse(button.dataset.userRecord); 
                    displaySelectedUserProfile(selectedUserRecord, selectedCharacterKey);
                });

                if (index === 0) { // 첫 번째 계정을 기본으로 선택
                    button.classList.add('active');
                    displaySelectedUserProfile(userRecord, userRecord.characterKey);
                }
            });

        } else if (latestMatchingUsers.length === 1) { // 캐릭터가 한 명인 경우
            accountSelectorContainer.style.display = 'none'; // 계정 선택 인터페이스 숨김
            displaySelectedUserProfile(latestMatchingUsers[0], latestMatchingUsers[0].characterKey);
        } else {
             // 이 부분은 latestMatchingUsers.length === 0 에서 이미 처리됨.
        }
    }

    
    function displaySelectedUserProfile(userRecord, characterKey) {
        currentUserData = userRecord; // 현재 선택된 유저 업데이트
        selectedCharacterKey = characterKey;
        showUserProfileAndCharts();

        if (profileNickname) {
            // 먼저 기존의 모든 자식 요소를 제거합니다. (텍스트 노드, 뱃지 컨테이너 등)
            while (profileNickname.firstChild) {
                profileNickname.removeChild(profileNickname.firstChild);
            }
            
            // 닉네임 텍스트 노드 추가
            const nicknameTextNode = document.createTextNode(userRecord['닉네임'] || '알 수 없음');
            profileNickname.appendChild(nicknameTextNode);

            //  뱃지들을 동적으로 생성하여 추가합니다. 
            const userLowerNickname = (userRecord['닉네임'] || '').toLowerCase().trim();

            allBadgeDefinitions.forEach(badgeDef => {
                let shouldDisplayBadge = false;

                // 뱃지 표시 조건 확인 (여기에 다양한 뱃지 조건 추가 가능)
                switch (badgeDef.condition) {
                    case "isGuildMember":
                        shouldDisplayBadge = yeongwonguildMembersList.includes(userLowerNickname);
                        break;
                    case "isDev":
                        shouldDisplayBadge = devMembersList.includes(userLowerNickname);
                        break;
                    case "hasUUIDNicknameHistory":
                        const userUUID = userRecord['UUID']; // 현재 유저의 UUID
                        // 해당 UUID에 연결된 닉네임이 1개 초과인 경우 (즉, 여러 닉네임을 쓴 적 있는 경우)
                        shouldDisplayBadge = userUUID && uuidNicknameHistoryMap.has(userUUID) && uuidNicknameHistoryMap.get(userUUID).size > 1;
                        break;

                    // 다른 조건들을 여기에 추가할 수 있습니다.
                    default:
                        shouldDisplayBadge = false; // 정의되지 않은 조건은 기본적으로 표시 안 함
                }

                if (shouldDisplayBadge) {
                    const badgeContainer = document.createElement('span');
                    badgeContainer.classList.add('profile-badge-container'); // 범용 컨테이너 클래스

                    // 뱃지 정렬 미세 조정 (예: vertical-align)
                    if (badgeDef.alignTop !== undefined) {
                        badgeContainer.style.verticalAlign = `${badgeDef.alignTop}px`;
                    } else {
                        badgeContainer.style.verticalAlign = `middle`; // 기본값
                    }

                    const badgeItem = document.createElement('span');
                    badgeItem.classList.add('profile-badge-item');

                    if (badgeDef.type === "image" && badgeDef.imageUrl) {
                        badgeItem.classList.add('badge-image');
                        badgeItem.style.backgroundImage = `url('${badgeDef.imageUrl}')`;
                    } else if (badgeDef.type === "text" && badgeDef.text) {
                        badgeItem.textContent = badgeDef.text;
                        // 동적 스타일 적용 (CSS in JS)
                        if (badgeDef.style) {
                            for (const prop in badgeDef.style) {
                                badgeItem.style[prop] = badgeDef.style[prop];
                            }
                        } else { // 기본 텍스트 뱃지 스타일
                        badgeItem.style.backgroundColor = '#007bff';
                        badgeItem.style.color = 'white';
                        badgeItem.style.borderRadius = '4px';
                        badgeItem.style.padding = '2px 5px';
                        badgeItem.style.fontSize = '0.7em';
                        }
                    }

                    const tooltip = document.createElement('div');
                    tooltip.classList.add('profile-tooltip');

                    if (badgeDef.id === "uuid_history") {
                        const userUUID = userRecord['UUID'];
                        if (userUUID && uuidNicknameHistoryMap.has(userUUID)) {
                            const nicknames = Array.from(uuidNicknameHistoryMap.get(userUUID));
                            const pastNicknamesList = nicknames
                                .filter(name => name.toLowerCase() !== userLowerNickname) // 현재 닉네임 제외
                                .map((name, index) => `${index + 1}. ${name}`)
                                .join('<br>');
                            
                            tooltip.innerHTML = `<b>${badgeDef.tooltipText}</b><br>${pastNicknamesList || '이력 없음'}`;
                        } else {
                            tooltip.textContent = badgeDef.tooltipText || '정보 없음';
                        }
                    } else {
                        tooltip.textContent = badgeDef.tooltipText || '정보 없음';
                    }

                    badgeContainer.appendChild(badgeItem);
                    badgeContainer.appendChild(tooltip);
                    profileNickname.appendChild(badgeContainer);
                }
            });
        }

        if (userSkin) {
            const skinUrl = `https://mineskin.eu/headhelm/${userRecord['닉네임']}/100.png`;
            userSkin.src = 'images/스킨/placeholder_skin.png'; 
            userSkin.alt = `${userRecord['닉네임']} 스킨`;
            userSkin.classList.remove('loaded');

            //  2. 실제 스킨 이미지 로드를 시도할 Image 객체 생성 
            const actualSkinImage = new Image();
            actualSkinImage.src = skinUrl;

            //  3. 실제 스킨 이미지가 성공적으로 로드되면 userSkin의 src를 업데이트 
            actualSkinImage.onload = () => {
                userSkin.src = skinUrl;
                userSkin.classList.add('loaded');
            };

            //  4. 실제 스킨 이미지 로드 실패 시 (onerror는 이미 images/placeholder_skin.png로 되어 있으므로, userSkin에 직접 등록) 
            // userSkin의 src가 이미 placeholder로 되어 있기 때문에, actualSkinImage의 onerror만 핸들링
            actualSkinImage.onerror = () => {
                // 이미 userSkin.src가 placeholder로 설정되어 있으므로, 추가 동작 필요 없음
                // 콘솔에 에러 로깅 정도만 가능
                console.warn(`Failed to load skin for ${user['닉네임']}. Displaying placeholder.`);
            };
        }

        if (profileJob) profileJob.textContent = normalizeJobName(userRecord['직업']);
        if (profileRanking) profileRanking.textContent = `${formatNumber(userRecord['랭킹'])}등`;
        if (profileLevel) profileLevel.textContent = "Lv. "+formatNumber(userRecord['레벨']);
        if (profileExp) profileExp.textContent = formatNumber(userRecord['경험치']);
        if (profileMaxCombatPower) profileMaxCombatPower.textContent = formatNumber(userRecord['최고 전투력']);
        if (profilePlaytime) profilePlaytime.textContent = formatPlaytime(userRecord['플레이타임_초']);
        if (sameLevelAvgCombatPower) sameLevelAvgCombatPower.textContent = formatNumber(calculateSameLevelAverageCombatPower(userRecord['레벨'], currentRankingData));

        renderDetailedAnalysis(userRecord); // 상세 분석 섹션 렌더링 호출
        drawUserGrowthCharts(selectedCharacterKey);

        // 비교 섹션 초기화 및 '1주 전 대비' 자동 클릭
        comparisonResults.innerHTML = '<p class="initial-comparison-message">비교 시점을 선택해주세요.</p>';
        comparisonButtons.forEach(btn => btn.classList.remove('active'));
        // 기본값으로 1주 전 대비 클릭
        const defaultComparisonButton = document.querySelector('.comparison-btn[data-offset="1"]');
        if (defaultComparisonButton) {
            defaultComparisonButton.click(); // 프로그램적으로 클릭
        }

        //  초기 활성 차트 ID를 가져와 서버 평균 체크박스 상태 업데이트 
        const initiallyActiveChartButton = chartSelectionTabs.querySelector('.chart-tab-button.active');
        if (initiallyActiveChartButton) {
            updateServerAverageCheckboxState(initiallyActiveChartButton.dataset.chart);
        } else {
            // 기본 활성 차트가 없을 경우 (예: 페이지 로드 후 첫 검색)
            // rankingChart가 첫번째 active 버튼이라고 가정하거나, 초기 HTML의 active에 따름
            updateServerAverageCheckboxState('levelChart'); //  기본값은 levelChart이므로 
        }        
    }

    function drawUserGrowthCharts(characterKey, currentActiveChartType = null) {
        if (chartsContainer) {
            chartsContainer.style.display = 'flex';
            chartsContainer.style.alignItems = 'center';
            chartsContainer.style.justifyContent = 'center';
        }
        
        if (chartMessageOverlay) chartMessageOverlay.style.display = 'none';

        const chartBoxElements = [
            document.getElementById('levelChartBox'),
            document.getElementById('combatPowerChartBox'),
            document.getElementById('playtimeChartBox'),
            document.getElementById('rankingChartBox')
        ];
        chartBoxElements.forEach(box => {
            if (box) box.style.display = 'none'; // 모든 차트 박스 숨김
        });

        // 캔버스 요소를 다시 참조 (HTML 구조가 바뀌면 새 캔버스가 생성되므로)
        levelChartCanvas = document.getElementById('levelChart');
        combatPowerChartCanvas = document.getElementById('combatPowerChart');
        playtimeChartCanvas = document.getElementById('playtimeChart');
        rankingChartCanvas = document.getElementById('rankingChart'); // 랭킹 차트 캔버스
        const top15SortControls = document.getElementById('top15SortControls');

        // 기간 필터링 적용 (기본값은 '최근 5주')
        const timePeriodValue = chartTimePeriod ? chartTimePeriod.value : '5'; 
        let filteredRankingFileDates = rankingFileDates.filter(dateInfo => allHistoricalData[dateInfo.date]); // 유효한 날짜만 추출

        if (timePeriodValue !== 'all') {
            const count = parseInt(timePeriodValue, 10);
            if (!isNaN(count)) {
                filteredRankingFileDates = filteredRankingFileDates.slice(-count); // 최근 N개만 선택
            }
        }

        // --- 데이터 필터링 로직 ---
        const userHistoricalRawData = filteredRankingFileDates
            .map(dateInfo => {
                const dailyDataSnapshot = allHistoricalData[dateInfo.date];
                if (!dailyDataSnapshot) return null;
                const characterSnapshot = dailyDataSnapshot.find(u => u.characterKey === characterKey);
                return characterSnapshot ? { dateInfo: dateInfo, ...characterSnapshot } : null;
            }).filter(Boolean);

        const serverAverageHistoricalRawData = filteredRankingFileDates
            .map(dateInfo => {
                const dailyData = allHistoricalData[dateInfo.date];
                return dailyData ? { dateInfo: dateInfo, ...calculateOverallStatsByDate(dailyData) } : null;
            }).filter(Boolean);
        // --- 데이터 필터링 로직 끝 ---


        if (userHistoricalRawData.length > 1) { // 최소 2개 이상의 데이터가 있어야 변화 추이 그래프가 의미 있음
            const labels = userHistoricalRawData.map(d => d.dateInfo.label); // '9월 1차' 등의 라벨 사용
            const levelData = userHistoricalRawData.map(d => d['레벨']);
            const combatPowerData = userHistoricalRawData.map(d => parseFloat(d['최고 전투력']));
            const playtimeData = userHistoricalRawData.map(d => Math.round(d['플레이타임_초'] / 3600));
            const rankingData = userHistoricalRawData.map(d => d['랭킹']); // 랭킹 데이터


            // 서버 평균 데이터 (userHistoricalRawData의 labels와 일치하는 데이터만 가져옴)
            // ! 중요: serverAverageHistoricalRawData를 기반으로 labels와 동일한 순서로 데이터를 구성해야 함
            const serverAvgLevelData = labels.map(label => {
                const matchingServerData = serverAverageHistoricalRawData.find(d => d.dateInfo.label === label);
                return matchingServerData ? (Math.round((matchingServerData.avgLevel) * 10) / 10) : null;
            });
            const serverAvgCombatPowerData = labels.map(label => {
                const matchingServerData = serverAverageHistoricalRawData.find(d => d.dateInfo.label === label); //  이 부분 수정 
                return matchingServerData ? (Math.round((matchingServerData.avgCombatPower) * 100) / 100) : null;
            });
            const serverAvgPlaytimeData = labels.map(label => {
                const matchingServerData = serverAverageHistoricalRawData.find(d => d.dateInfo.label === label); //  이 부분 수정 
                return matchingServerData ? (Math.round((matchingServerData.avgPlaytime / 3600) * 10) / 10) : null;
            });
            const serverAvgRankingData = labels.map(label => {
                const matchingServerData = serverAverageHistoricalRawData.find(d => d.dateInfo.label === label); //  이 부분 수정 
                return matchingServerData ? matchingServerData.avgRanking : null;
            });


            // Y축 범위 계산 (최소/최대). 데이터 편차에 따라 적절한 마진을 줌
            const calculateAxisRange = (userData, serverData, isRankingAxis = false) => {
                // 랭킹 축일 경우, userData (사용자 랭킹)만을 기준으로 범위 계산
                const dataForRange = isRankingAxis ? userData : [...userData, ...serverData];
                const combinedData = dataForRange.filter(val => typeof val === 'number' && !isNaN(val));

                if (combinedData.length === 0) return { min: 0, max: 100 };
                const minVal = Math.min(...combinedData);
                const maxVal = Math.max(...combinedData);
                const range = maxVal - minVal;
                
                if (range === 0) {
                    // 데이터가 하나이거나 모든 값이 동일할 경우: 랭킹은 Y축 반전 고려
                    // 랭킹의 경우, minVal이 "낮은 랭킹 숫자"이므로, min/max 계산을 뒤집어야 합니다.
                    // min에 더 높은 값, max에 더 낮은 값을 주어 축을 역순으로 표시
                    return { 
                        min: isRankingAxis ? maxVal + (maxVal > 0 ? maxVal * 0.05 : 5) : Math.max(0, minVal - (minVal > 0 ? minVal * 0.05 : 5)),
                        max: isRankingAxis ? minVal - (minVal > 0 ? minVal * 0.05 : 5) : maxVal + (maxVal > 0 ? maxVal * 0.05 : 5)
                    }; 
                }
                
                const margin = range * 0.15; // 여유 공간 15%
                return { 
                    // 랭킹은 Y축 반전이므로, min에 max+margin, max에 min-margin을 적용
                    min: isRankingAxis ? maxVal + margin : Math.max(0, minVal - margin), 
                    max: isRankingAxis ? minVal - margin : maxVal + margin
                };
            };
            
            const levelAxis = calculateAxisRange(levelData, serverAvgLevelData);
            const combatPowerAxis = calculateAxisRange(combatPowerData, serverAvgCombatPowerData);
            const playtimeAxis = calculateAxisRange(playtimeData, serverAvgPlaytimeData);
            const rankingAxis = calculateAxisRange(rankingData, serverAvgRankingData, true); // 랭킹은 Y축 반전


            // 데이터셋 정의 함수 (hidden 속성 추가)
            const createDataset = (label, data, borderColor, backgroundColor, hidden, fillMode = true) => ({
                label: label,
                data: data,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                tension: 0.3,
                fill: fillMode,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: borderColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                hidden: hidden // 체크박스 상태에 따라 숨김/표시
            });

            const createAvgDataset = (label, data, borderColor, hidden) => ({
                label: label,
                data: data,
                borderColor: borderColor,
                borderDash: [5, 5],
                pointRadius: 0, //  pointRadius를 6으로 설정하여 범례 아이콘 크기 통일 
                pointStyle: 'circle', //  원형 아이콘으로 변경 
                fill: false,
                tension: 0.3,
                hidden: hidden // 체크박스 상태에 따라 숨김/표시
            });


            // 레벨, 전투력, 플레이타임, 랭킹 차트 데이터셋 구성
            const baseDatasets = (type) => {
                const datasets = [];
                let userColor, serverAvgColor, userBgColor;

                switch(type) {
                    case 'level': userColor = '#3498db'; userBgColor = 'rgba(52, 152, 219, 0.2)'; serverAvgColor = '#95a5a6'; break;
                    case 'combatPower': userColor = '#e74c3c'; userBgColor = 'rgba(231, 76, 60, 0.2)'; serverAvgColor = '#95a5a6'; break;
                    case 'playtime': userColor = '#2ecc71'; userBgColor = 'rgba(46, 204, 113, 0.2)'; serverAvgColor = '#95a5a6'; break;
                    case 'ranking': userColor = '#FFD700'; userBgColor = 'rgba(255, 215, 0, 0.2)'; serverAvgColor = '#B8860B'; break;
                }

                if (toggleUserData && toggleUserData.checked) {
                    const data = (type === 'level') ? levelData : (type === 'combatPower') ? combatPowerData : (type === 'playtime') ? playtimeData : rankingData;
                    
                    let label = `${currentUserData['닉네임']} (${normalizeJobName(currentUserData['직업'])})`; 
                    datasets.push(createDataset(label, data, userColor, userBgColor, false, type === 'ranking' ? 'end' : true));
                }
                
                //  랭킹 차트일 때는 서버 평균 라인을 추가하지 않는 조건은 유지합니다.  (이전 요청으로 유지한 부분)
                if (toggleServerAvgData && toggleServerAvgData.checked) {
                    const data = (type === 'level') ? serverAvgLevelData : (type === 'combatPower') ? serverAvgCombatPowerData : (type === 'playtime') ? serverAvgPlaytimeData : serverAvgRankingData;
                    
                    let label = `서버 평균`;
                    datasets.push(createAvgDataset(label, data, serverAvgColor, false));
                }
                return datasets;
            };

            destroyAllChartInstances(); // 새로 그리기 전에 기존 차트 인스턴스 파괴

            let chartConfig;
            let chartBoxToDisplay = null;

            if (!currentActiveChartType) { 
                const activeChartButton = document.querySelector('.chart-tab-button.active');
                currentActiveChartType = activeChartButton ? activeChartButton.dataset.chart : 'rankingChart'; // 기본값은 랭킹
            }

            //랭킹 차트
            if (currentActiveChartType === 'rankingChart' && rankingChartCanvas) {
                const yAxis = calculateAxisRange(rankingData, serverAvgRankingData, 'ranking');
                chartConfig = {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: baseDatasets('ranking')
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true, // 범례 표시
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    font: { size: 12 }
                                }
                            },
                            tooltip: {
                                position: 'myData',
                                backgroundColor: 'rgba(44, 62, 80, 0.95)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 8,
                                titleFont: { size: 13, weight: 'bold', family: "'Noto Sans KR', sans-serif" },
                                bodyFont: { size: 12, family: "'Noto Sans KR', sans-serif" },
                                displayColors: true,
                                boxPadding: 6,
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += context.parsed.y + '등';
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        hover: { // 툴팁 활성화를 위한 호버 설정
                            mode: 'index',
                            intersect: false
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: yAxis.min, // calculateAxisRange에서 계산된 min 값 사용
                                max: yAxis.max, // calculateAxisRange에서 계산된 max 값 사용
                                reverse: true,
                                grid: { color: 'rgba(0,0,0,0.05)' },
                                ticks: { stepSize: 10 }, // 랭킹 차트는 10단위로 눈금 표시
                                title: {
                                    display: false, // '랭킹' 텍스트를 표시하려면 true
                                    text: '랭킹' // Y축 제목
                                }
                            },
                            x: {
                                grid: { display: false }
                            }
                        }
                    }
                };
                rankingChartInstance = new Chart(rankingChartCanvas, chartConfig);
                chartBoxToDisplay = rankingChartBox;
            }

            // 레벨 차트
            else if (currentActiveChartType === 'levelChart' && levelChartCanvas) {
                const yAxis = calculateAxisRange(levelData, serverAvgLevelData, 'level'); // calculateAxisRange는 'level' 타입으로 호출
                chartConfig = {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: baseDatasets('level') // 'level' 타입으로 baseDatasets 호출
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true, // 범례 표시
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    font: { size: 12 }
                                }
                            },
                            tooltip: {
                                position: 'myData',
                                backgroundColor: 'rgba(44, 62, 80, 0.95)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 8,
                                titleFont: { size: 13, weight: 'bold', family: "'Noto Sans KR', sans-serif" },
                                bodyFont: { size: 12, family: "'Noto Sans KR', sans-serif" },
                                displayColors: true,
                                boxPadding: 6,
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += context.parsed.y + '레벨';
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        hover: { // 툴팁 활성화를 위한 호버 설정
                            mode: 'index',
                            intersect: false
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: yAxis.min, // calculateAxisRange에서 계산된 min 값 사용
                                max: yAxis.max, // calculateAxisRange에서 계산된 max 값 사용
                                grid: { color: 'rgba(0,0,0,0.05)' },
                                title: {
                                    display: false, // '레벨' 텍스트를 표시하려면 true
                                    text: '레벨' // Y축 제목
                                }
                            },
                            x: {
                                grid: { display: false }
                            }
                        }
                    }
                };
                levelChartInstance = new Chart(levelChartCanvas, chartConfig);
                chartBoxToDisplay = levelChartBox;
            }

            // 전투력 차트
            else if (currentActiveChartType === 'combatPowerChart' && combatPowerChartCanvas) {
                const yAxis = calculateAxisRange(combatPowerData, serverAvgCombatPowerData, 'combatPower'); // calculateAxisRange는 'combatPower' 타입으로 호출
                chartConfig = {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: baseDatasets('combatPower') // 'combatPower' 타입으로 baseDatasets 호출
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: {
                                display: true, // 범례 표시
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    font: { size: 12 }
                                }
                            },
                            tooltip: {
                                position: 'myData',
                                backgroundColor: 'rgba(44, 62, 80, 0.95)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 8,
                                titleFont: { size: 13, weight: 'bold', family: "'Noto Sans KR', sans-serif" },
                                bodyFont: { size: 12, family: "'Noto Sans KR', sans-serif" },
                                displayColors: true,
                                boxPadding: 6,
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += formatNumber(context.parsed.y) + ' 전투력';
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        hover: {
                            mode: 'index',
                            intersect: false
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: yAxis.min, // calculateAxisRange에서 계산된 min 값 사용
                                max: yAxis.max, // calculateAxisRange에서 계산된 max 값 사용
                                grid: { color: 'rgba(0,0,0,0.05)' },
                                title: {
                                    display: false, // '전투력' 텍스트를 표시하려면 true
                                    text: '전투력' // Y축 제목
                                }
                            },
                            x: {
                                grid: { display: false }
                            }
                        }
                    }
                };
                combatPowerChartInstance = new Chart(combatPowerChartCanvas, chartConfig);
                chartBoxToDisplay = combatPowerChartBox;
            }

            // 플레이타임 차트
            else if (currentActiveChartType === 'playtimeChart' && playtimeChartCanvas) {
                const yAxis = calculateAxisRange(playtimeData, serverAvgPlaytimeData, 'playtime'); // calculateAxisRange는 'playtime' 타입으로 호출
                chartConfig = {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: baseDatasets('playtime') // 'playtime' 타입으로 baseDatasets 호출
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true, // 범례 표시
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    font: { size: 12 }
                                }
                            },
                            tooltip: {
                                position: 'myData',
                                backgroundColor: 'rgba(44, 62, 80, 0.95)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 8,
                                titleFont: { size: 13, weight: 'bold', family: "'Noto Sans KR', sans-serif" },
                                bodyFont: { size: 12, family: "'Noto Sans KR', sans-serif" },
                                displayColors: true,
                                boxPadding: 6,
                                mode: 'index',
                                intersect: false,
                                callbacks: { //  콜백 함수 추가 
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            // 플레이타임 차트이므로 ' (시간)'을 추가합니다.
                                            label += context.parsed.y + '시간';
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        hover: {
                            mode: 'index',
                            intersect: false
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: yAxis.min, // calculateAxisRange에서 계산된 min 값 사용
                                max: yAxis.max, // calculateAxisRange에서 계산된 max 값 사용
                                grid: { color: 'rgba(0,0,0,0.05)' },
                                title: {
                                    display: false, // '플레이 시간 (시간)' 텍스트를 표시하려면 true
                                    text: '플레이 시간 (시간)' // Y축 제목
                                }
                            },
                            x: {
                                grid: { display: false }
                            }
                        }
                    }
                };
                playtimeChartInstance = new Chart(playtimeChartCanvas, chartConfig);
                chartBoxToDisplay = playtimeChartBox;
            }
            
            //  그려진 차트 박스만 보이게 처리 
            if (chartBoxToDisplay) {
                 chartBoxToDisplay.style.display = 'block';
                 if (chartsContainer) chartsContainer.style.display = 'block'; // chartsContainer는 전체적으로 보이게
                 // 차트가 그려지면 메시지 오버레이는 숨깁니다.
                 if (chartMessageOverlay) chartMessageOverlay.style.display = 'none';
            } else {
                 console.error("오류: 차트 캔버스 요소를 찾을 수 없거나 currentActiveChartType이 유효하지 않아 차트를 그릴 수 없습니다.");
                 // 데이터는 있으나 차트 박스 할당 오류일 경우, 메시지 오버레이를 통해 메시지 표시
                 if (chartMessageOverlay && chartMessageText) {
                     chartMessageText.textContent = '차트 캔버스 요소를 찾을 수 없어 그래프를 그릴 수 없습니다.';
                     chartMessageOverlay.style.display = 'flex';
                 }
            }
        
        } else { // userHistoricalRawData.length <= 1 일 때 (데이터 부족 메시지)
            // 모든 차트 박스 숨김
            chartBoxElements.forEach(box => {
                if (box) box.style.display = 'none';
            });
            
            // 메시지 오버레이를 표시합니다.
            if(chartMessageOverlay && chartMessageText) {
                chartMessageText.textContent = '선택된 유저의 과거 데이터가 부족하여 그래프를 그릴 수 없습니다.';
                chartMessageOverlay.style.display = 'flex'; // 메시지 표시
            }
            if(chartsContainer) chartsContainer.style.display = 'flex'; // chartsContainer는 항상 보이도록 유지
            destroyAllChartInstances(); // 이전 차트 인스턴스 파괴 (메모리 관리)
        }
    }


    // ======================== 변화 추이 계산 및 표시 ========================

    function displayHistoricalComparison(offset) {
        if (!currentUserData || !selectedCharacterKey || !allHistoricalData) {
            comparisonResults.innerHTML = '<p class="no-results-message error">사용자 데이터를 불러올 수 없습니다. 다시 검색해 주세요.</p>';
            return;
        }

        if (!latestAvailableDateInfo) {
            comparisonResults.innerHTML = '<p class="no-results-message error">최신 랭킹 데이터를 찾을 수 없습니다.</p>';
            return;
        }

        const currentCharacterKey = selectedCharacterKey;
        
        // 랭킹 파일 날짜 배열에서 최신 데이터 날짜를 찾아 인덱스 사용
        const currentDataIndex = rankingFileDates.findIndex(dateInfo => dateInfo.date === latestAvailableDateInfo.date);
        
        // previousDataIndex는 현재 인덱스에서 offset만큼 뺀다
        const previousDataIndex = currentDataIndex - offset;

        if (previousDataIndex < 0 || previousDataIndex >= rankingFileDates.length) {
            comparisonResults.innerHTML = `<p class="comparison-results-header">데이터 비교 불가능</p><p class="no-results-message error">비교할 과거 데이터(${offset}번째 파일)가 부족합니다.</p>`;
            return;
        }

        const previousDateInfo = rankingFileDates[previousDataIndex];
        const previousDate = previousDateInfo.date;

        //  allHistoricalData에서 이전 날짜의 특정 characterKey 데이터를 찾음 
        const previousDailyDataSnapshot = allHistoricalData[previousDate];
        if (!previousDailyDataSnapshot) { 
            comparisonResults.innerHTML = `<p class="no-results-message error">${previousDateInfo.label} (${formatDateString(previousDateInfo.date)}) 데이터 스냅샷이 없습니다.</p>`;
            return;
        }
        // previousDailyDataSnapshot (해당 날짜의 모든 유저) 중에서 currentCharacterKey를 가진 유저를 찾음
        // ★characterKey는 loadAllHistoricalData()에서 각 user object에 부여되어야 합니다.
        // ★이것이 누락되면 여기서 find가 실패합니다.
        const previousUser = previousDailyDataSnapshot.find(u => u.characterKey === currentCharacterKey);

        if (!previousUser) {
            comparisonResults.innerHTML = `<p class="comparison-results-header">데이터 비교 불가능</p><p class="no-results-message error">
            ${previousDateInfo.label}(${formatDateString(previousDateInfo.date)})에 ${currentUserData['닉네임']}(${normalizeJobName(currentUserData['직업'])})님의 데이터가 없습니다.</p>`;
            return;
        }

        // 데이터 변화 계산 및 HTML 생성
        let html = `<p class="comparison-results-header">${previousDateInfo.label} (${formatDateString(previousDateInfo.date)}) 대비</p>`;
        html += `<div class="comparison-item"><span class="label">랭킹</span><span class="value">${formatChange(currentUserData['랭킹'], previousUser['랭킹'], true)}</span></div>`;
        html += `<div class="comparison-item"><span class="label">레벨</span><span class="value">${formatChange(currentUserData['레벨'], previousUser['레벨'])}</span></div>`;
        html += `<div class="comparison-item"><span class="label">전투력</span><span class="value">${formatChange(parseFloat(currentUserData['최고 전투력']), parseFloat(previousUser['최고 전투력']))}</span></div>`;
        const playtimeDiff = currentUserData['플레이타임_초'] - previousUser['플레이타임_초'];
        html += `<div class="comparison-item"><span class="label">플레이 타임</span><span class="value">${formatPlaytimeChange(playtimeDiff)}</span></div>`;
        
        comparisonResults.innerHTML = html;
    }


    // ======================== 이벤트 리스너 ========================

    if (nicknameInput) {
        let currentFocus = -1; // 현재 포커스된 자동 완성 항목 인덱스
        let autocompleteSelectedWithEnter = false; //  Enter로 자동 완성 항목을 선택했는지 추적하는 플래그 

        // 포커스 시 검색 기록 표시
        nicknameInput.addEventListener('focus', function() {
            if (!this.value) {
                renderSearchHistory();
            }
        });
        nicknameInput.addEventListener('click', function() {
            if (!this.value) {
                renderSearchHistory();
            }
        });

        nicknameInput.addEventListener('input', function() {
            const val = this.value;
            const oldValue = val;
            const regex = /^[a-zA-Z0-9_]*$/;
            let newValue = '';
            let hasInvalidChar = false;
            let invalidCharMessage = "닉네임은 영어, 숫자, 언더스코어(_)만 입력 가능합니다.";
            let lengthExceeded = false; // 길이 초과 여부를 판단하는 플래그
            const lengthExceededMessage = "닉네임은 최대 20자까지 입력 가능합니다."; // 길이 초과 메시지

            // --- 1. 글자 종류 유효성 검사 ---
            for (let i = 0; i < oldValue.length; i++) {
                const char = oldValue[i];
                if (regex.test(char)) {
                    newValue += char;
                } else {
                    hasInvalidChar = true;
                    if (/[가-힣]/.test(char)) {
                        invalidCharMessage = "한글은 입력할 수 없습니다.";
                    }
                }
            }

            // --- 2. 길이 유효성 검사 ---
            // 사용자가 21번째 문자를 입력하려고 할 때 (newValue가 20자를 넘으려고 할 때)
            if (newValue.length > 20) {
                newValue = newValue.substring(0, 20); // 20자로 잘라낸 후
                lengthExceeded = true; // 길이 초과 플래그 설정
            }

            // --- 3. 실제 input 값 업데이트 및 메시지 표시 ---
            // 현재 DOM의 input 값과 새로 계산된 newValue를 비교하여 변경이 필요한 경우에만 업데이트
            if (this.value !== newValue) {
                this.value = newValue;
            }

            // 메시지 표시 우선순위: 길이 초과 > 글자 종류 오류 > 메시지 없음
            if (lengthExceeded) {
                showValidationMessage(lengthExceededMessage);
            } else if (hasInvalidChar) {
                showValidationMessage(invalidCharMessage);
            } else {
                hideValidationMessage();
            }
            
            // 입력값이 변경되었으므로 autocompleteSelectedWithEnter 플래그 초기화 
            autocompleteSelectedWithEnter = false;

            // --- 자동 완성 로직 시작 ---
            closeAllLists();
            if (!newValue) {
                renderSearchHistory(); // 값이 비면 검색 기록 표시
                return false;
            }
            
            currentFocus = -1;
            autocompleteList.innerHTML = '';
            let hasResults = false;

            // 1. 검색 기록 필터링 및 표시
            const history = getSearchHistory();
            const filteredHistory = history.filter(item => item.toLowerCase().includes(newValue.toLowerCase()));

            if (filteredHistory.length > 0) {
                const header = document.createElement('div');
                header.className = 'autocomplete-header';
                
                const titleSpan = document.createElement('span');
                titleSpan.textContent = '최근 검색어';
                header.appendChild(titleSpan);

                const clearAllBtn = document.createElement('span');
                clearAllBtn.className = 'clear-all-btn';
                clearAllBtn.textContent = '전체 삭제';
                clearAllBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    localStorage.removeItem(SEARCH_HISTORY_KEY);
                    nicknameInput.dispatchEvent(new Event('input')); // 입력 이벤트 트리거로 필터링된 목록 갱신
                    nicknameInput.focus();
                });
                header.appendChild(clearAllBtn);

                autocompleteList.appendChild(header);

                filteredHistory.forEach(nickname => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-list-item history-item';
                    
                    const textSpan = document.createElement('span');
                    textSpan.textContent = nickname;
                    item.appendChild(textSpan);

                    const deleteBtn = document.createElement('span');
                    deleteBtn.className = 'history-delete-btn';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.title = '삭제';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        removeSearchHistory(nickname);
                        nicknameInput.dispatchEvent(new Event('input')); // 입력 이벤트 트리거로 필터링된 목록 갱신
                        nicknameInput.focus();
                    });
                    item.appendChild(deleteBtn);

                    item.addEventListener('click', function() {
                        nicknameInput.value = nickname;
                        closeAllLists();
                        searchButton.click();
                    });

                    autocompleteList.appendChild(item);
                });
                hasResults = true;
            }

            // 2. 자동 완성 (2글자 이상일 때)
            if (newValue.length >= 2 && allUniqueNicknames && allUniqueNicknames.length > 0) {
                let count = 0;
                let autocompleteHeaderAdded = false;

                for (let i = 0; i < allUniqueNicknames.length; i++) {
                    // 검색 기록에 이미 있는 항목은 중복 표시 방지
                    if (filteredHistory.includes(allUniqueNicknames[i])) continue;

                    if (allUniqueNicknames[i].toUpperCase().startsWith(newValue.toUpperCase())) {
                        if (count >= 7) break;

                        // 자동 완성 헤더 추가
                        if (!autocompleteHeaderAdded) {
                            const header = document.createElement('div');
                            header.className = 'autocomplete-header';
                            header.textContent = '추천 검색어';
                            if (hasResults) {
                                header.style.borderTop = '1px solid #eee';
                            }
                            autocompleteList.appendChild(header);
                            autocompleteHeaderAdded = true;
                        }

                        const item = document.createElement('div');
                        item.classList.add('autocomplete-list-item');
                        item.innerHTML = "<strong>" + allUniqueNicknames[i].substr(0, newValue.length) + "</strong>";
                        item.innerHTML += allUniqueNicknames[i].substr(newValue.length);
                        item.innerHTML += "<input type='hidden' value='" + allUniqueNicknames[i] + "'>";

                        item.addEventListener('click', function(e) {
                            e.stopPropagation();
                            nicknameInput.value = this.getElementsByTagName('input')[0].value;
                            closeAllLists();
                            autocompleteSelectedWithEnter = true; //  클릭으로 선택했음을 표시 
                            nicknameInput.focus(); // 입력 필드에 다시 포커스
                        });
                        autocompleteList.appendChild(item);
                        count++;
                        hasResults = true;
                    }
                }
            }
            
            if (hasResults) {
                autocompleteList.style.display = 'block';
            } else {
                autocompleteList.style.display = 'none';
            }
        });

        //  키보드 내비게이션 (방향키, Enter) 
        nicknameInput.addEventListener('keydown', function(e) {
            let x = autocompleteList.getElementsByClassName('autocomplete-list-item');

            if (e.keyCode === 40) { // 아래 화살표
                if (autocompleteList.style.display === 'block' && x && x.length > 0) {
                    currentFocus++;
                    addActive(x);
                    e.preventDefault(); // 스크롤 방지
                }
            } else if (e.keyCode === 38) { // 위 화살표
                if (autocompleteList.style.display === 'block' && x && x.length > 0) {
                    currentFocus--;
                    addActive(x);
                    e.preventDefault(); // 스크롤 방지
                }
            } else if (e.keyCode === 9) { // Tab 키 (keycode 9)
                if (autocompleteList.style.display === 'block' && x && x.length > 0) {
                    currentFocus++; // 다음 항목으로 이동 (아래 화살표와 동일하게)
                    addActive(x);
                    e.preventDefault(); // Tab 키의 기본 동작(다음 요소로 포커스 이동)을 방지
                }
            } else if (e.keyCode === 13) { // Enter 키
                e.preventDefault(); // 기본 폼 제출 방지

                if (autocompleteList.style.display === 'block' && x && x.length > 0 && currentFocus > -1) {
                    //  1. 자동 완성 목록이 열려있고 항목이 선택된 경우 (첫 번째 Enter) 
                    x[currentFocus].click(); // 해당 항목 클릭 (닉네임만 입력)
                    autocompleteSelectedWithEnter = true; // Enter로 선택했음을 표시
                } else if (autocompleteList.style.display === 'block' && x && x.length > 0) {
                    //  2. 목록이 열려있으나 항목이 선택 안 된 경우 (첫 번째 Enter) 
                    // 현재 입력된 값으로 바로 검색
                    searchButton.click();
                    autocompleteSelectedWithEnter = false; // 검색했으므로 초기화
                } else if (autocompleteSelectedWithEnter || autocompleteList.style.display === 'none') {
                    //  3. 자동 완성으로 닉네임 채워진 후/목록이 닫혀있을 때 Enter (두 번째 Enter) 
                    searchButton.click(); // 검색 실행
                    autocompleteSelectedWithEnter = false; // 검색했으므로 초기화
                } else {
                    //  4. 기타 경우 (예: 빈 필드에서 Enter) 
                    searchButton.click();
                    autocompleteSelectedWithEnter = false;
                }
            }
        });

        //  포커스 벗어날 때 메시지 및 목록 숨김 
        nicknameInput.addEventListener('blur', function() {
            hideValidationMessage();
            // closeAllLists()는 document.click에서 처리
        });

        // --- 자동 완성 도우미 함수 (addActive, removeActive, closeAllLists) ---
        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add('autocomplete-active');
            x[currentFocus].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function removeActive(x) {
            for (let i = 0; i < x.length; i++) {
                x[i].classList.remove('autocomplete-active');
            }
        }

        function closeAllLists(elmnt) {
            const lists = document.getElementsByClassName('autocomplete-list');
            for (let i = 0; i < lists.length; i++) {
                if (lists[i] !== elmnt) { // 클릭된 엘리먼트가 목록 자체가 아니라면 닫음
                    lists[i].style.display = 'none';
                }
            }
        }

        document.addEventListener('click', function(e) {
            //  자동 완성 목록, input, validationMessage 중 아무것도 클릭하지 않았다면 닫고 숨김 
            if (!autocompleteList.contains(e.target) && e.target !== nicknameInput && e.target !== validationMessage) {
                closeAllLists();
                hideValidationMessage();
            }
        });
    }

    if (searchButton) searchButton.addEventListener('click', searchUser);
    if (nicknameInput) nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchUser();
    });
    
    //  그래프 탭 전환 로직 
    if (chartSelectionTabs) {
        chartSelectionTabs.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.chart-tab-button');
            if (!clickedButton) return;

            // 모든 탭 버튼에서 active 클래스 제거
            chartTabButtons.forEach(btn => {
                btn.classList.remove('active');
                // 해당 차트 박스 숨김
                const targetChartBox = document.getElementById(btn.dataset.chart + 'Box');
                if(targetChartBox) targetChartBox.style.display = 'none';
            });
            // 클릭된 버튼에 active 클래스 추가
            clickedButton.classList.add('active');

            const targetChartId = clickedButton.dataset.chart; // 'levelChart', 'combatPowerChart', 'playtimeChart', 'rankingChart'

            if (selectedCharacterKey) {
                drawUserGrowthCharts(selectedCharacterKey);
            } else {
                console.warn("캐릭터가 선택되지 않아 차트를 다시 그릴 수 없습니다.");
                if(chartsContainer) chartsContainer.innerHTML = '<p class="no-results-message">캐릭터를 먼저 검색하고 선택해 주세요.</p>';
            }


            //  서버 평균 체크박스 활성화/비활성화 및 체크 상태 변경 
            updateServerAverageCheckboxState(targetChartId);

            // 차트 다시 그리기 (현재 유저 데이터가 있다면)
            if (currentUserData) {
                drawUserGrowthCharts(selectedCharacterKey);
            }
        });
    }

    //  비활성화된 서버 평균 체크박스 클릭 시 토스트 메시지 
    if (toggleServerAvgLabel) {
        toggleServerAvgLabel.addEventListener('click', (e) => {
            if (toggleServerAvgData.disabled) {
                e.preventDefault(); // 체크박스 상태 변경 방지
                showToast("랭킹 차트에서는 서버 평균이 비활성화됩니다.");
            }
            //  추가: disabled 상태가 아닐 때만 차트를 다시 그립니다. 
            // 클릭으로 인해 체크 상태가 변경되었을 경우
            else { 
                if (selectedCharacterKey) {
                    drawUserGrowthCharts(selectedCharacterKey);
                }
            }
        });
    }
    
    //  그래프 데이터 표시 토글 (체크박스) 
    // 모든 체크박스 변경 시 현재 유저 데이터로 그래프 다시 그리기
    const chartToggleCheckboxes = document.querySelectorAll('.chart-data-toggle input[type="checkbox"]');
    chartToggleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (selectedCharacterKey) { //  currentUserData 대신 selectedCharacterKey 사용 
                drawUserGrowthCharts(selectedCharacterKey);
            }
        });
    });

    //  그래프 기간 필터 드롭다운 
    if (chartTimePeriod) chartTimePeriod.addEventListener('change', () => { 
        if (selectedCharacterKey) { //  selectedCharacterKey가 있을 때만 차트를 다시 그립니다. 
            drawUserGrowthCharts(selectedCharacterKey); 
        } else {
            console.warn("캐릭터가 선택되지 않아 차트를 다시 그릴 수 없습니다.");
            if(chartsContainer) chartsContainer.innerHTML = '<p class="no-results-message">캐릭터를 먼저 검색하고 선택해 주세요.</p>';
        }
    });


    //  데이터 변화 추이 버튼 이벤트 리스너 
    comparisonButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!currentUserData) {
                comparisonResults.innerHTML = '<p class="no-results-message error">비교할 유저를 먼저 검색해주세요.</p>';
                return;
            }

            // 활성 버튼 스타일 업데이트
            comparisonButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const offset = parseInt(this.dataset.offset, 10);
            displayHistoricalComparison(offset); 
        });
    });

    if (resetLevelAnalysisButton) {
        resetLevelAnalysisButton.addEventListener('click', () => {
             if (currentRankingData.length > 0) {
                const allLevels = currentRankingData.map(user => user['레벨'] || 0).filter(level => level > 0);
                const avgServerLevel = allLevels.length > 0 ? Math.round(allLevels.reduce((sum, level) => sum + level, 0) / allLevels.length) : 1;
                currentAnalyzedLevel = avgServerLevel;
                updateLevelAnalysisDisplay();
            }
        });
    }


    // 모든 데이터 로드 (페이지 진입 시 한 번만)
    loadAllHistoricalData();

    //  서버 평균 체크박스 상태 업데이트 함수 
    function updateServerAverageCheckboxState(activeChartId) {
        if (!toggleServerAvgData || !toggleServerAvgLabel) return;

        if (activeChartId === 'rankingChart') { // playerAnalysisChart 제거 (이제 탭이 아님)
            toggleServerAvgData.checked = false; // 랭킹 차트 선택 시 서버 평균 체크 해제
            toggleServerAvgData.disabled = true; // 비활성화
            toggleServerAvgLabel.classList.add('disabled-option'); // 시각적 비활성화 클래스 추가
        } else {
            toggleServerAvgData.disabled = false; // 다른 차트 선택 시 활성화
            toggleServerAvgLabel.classList.remove('disabled-option'); // 시각적 비활성화 클래스 제거
            toggleServerAvgData.checked = true; // 다른 차트 선택 시 서버 평균 다시 체크
        }
    }

    //  새로 추가: TOP 15 정렬 버튼 클릭 이벤트 리스너 
    if (top15SortControls) {
        top15SortControls.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.sort-btn');
            if (!clickedButton) return;

            // 모든 정렬 버튼에서 active 클래스 제거
            Array.from(top15SortControls.children).forEach(btn => btn.classList.remove('active'));
            // 클릭된 버튼에 active 클래스 추가
            clickedButton.classList.add('active');

            const sortBy = clickedButton.dataset.sortBy;

            if (sortBy === 'job') {
                if (jobSortControls) {
                    jobSortControls.style.display = 'flex';
                    // 하위 메뉴 초기화
                    const jobButtons = Array.from(jobSortControls.children);
                    jobButtons.forEach(btn => btn.classList.remove('active'));

                    // '나이트' 버튼을 찾아 기본으로 활성화
                    const knightButton = jobButtons.find(btn => btn.dataset.job === '나이트');
                    if (knightButton) {
                        knightButton.classList.add('active');
                    }
                }
                // '나이트'를 기본 필터로 하여 랭킹 표시
                displayServerTop15('job', '나이트');
            } else {
                if (jobSortControls) jobSortControls.style.display = 'none';
                displayServerTop15(sortBy); 
            }
        });
    }

    // 직업 선택 버튼 이벤트 리스너 추가
    if (jobSortControls) {
        jobSortControls.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.job-sort-btn');
            if (!clickedButton) return;

            Array.from(jobSortControls.children).forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');

            const jobName = clickedButton.dataset.job;
            displayServerTop15('job', jobName);
        });
    }

    // 중앙 팝업형 소통 채널 메뉴 제어 JavaScript
    const discordCommunicationOverlay = document.getElementById('discordCommunicationOverlay');
    const mainCommunicationToggleButton = document.getElementById('mainCommunicationToggleButton');
    const discordCommunicationCloseButton = document.getElementById('discordCommunicationCloseButton');

    if (discordCommunicationOverlay && mainCommunicationToggleButton && discordCommunicationCloseButton) {
        // 팝업 열기
        mainCommunicationToggleButton.addEventListener('click', () => {
            discordCommunicationOverlay.classList.add('show');
            // 팝업이 열릴 때 AOS 애니메이션 강제 트리거 (이미 로드된 요소에도)
            AOS.refreshHard(); 
        });

        // 팝업 닫기 (클로즈 버튼 클릭 시)
        discordCommunicationCloseButton.addEventListener('click', () => {
            discordCommunicationOverlay.classList.remove('show');
        });

        // 팝업 외부 클릭 시 닫기
        discordCommunicationOverlay.addEventListener('click', (e) => {
            if (e.target === discordCommunicationOverlay) { // 오버레이 자체를 클릭한 경우
                discordCommunicationOverlay.classList.remove('show');
            }
        });

        // 팝업 내 링크 클릭 시 닫기
        discordCommunicationOverlay.querySelectorAll('.communication-popup-item').forEach(item => {
            item.addEventListener('click', () => {
                discordCommunicationOverlay.classList.remove('show');
            });
        });
    }

});