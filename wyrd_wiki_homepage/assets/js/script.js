document.addEventListener('DOMContentLoaded', () => {
    // 1. AOS (Animate On Scroll) 초기화
    AOS.init({
        duration: 1000,     // 애니메이션 지속 시간 (밀리초)
        once: false,         // 한 번만 애니메이션 실행 여부
        easing: 'ease-in-out' // 애니메이션 이징 함수
    });

    // 2. 부드러운 스크롤 (Smooth Scroll) 및 페이지 이동
    // 모든 내부 앵커 링크에 적용
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (this.classList.contains('dropdown-toggle')) {
                e.preventDefault();
                // 데스크탑에서 클릭 시에도 드롭다운을 열거나 닫도록 처리 (모바일과 동일)
                const parentDropdown = this.closest('.dropdown');
                if (parentDropdown) {
                    parentDropdown.classList.toggle('open');
                }
                return; // 추가 스크롤 로직 실행하지 않고 종료
            }

            if (targetElement) { // 현재 페이지 내부에 ID가 있는 경우 (부드러운 스크롤)
                e.preventDefault(); // 기본 앵커 동작 방지

                // 모바일 내비게이션 열려있으면 닫기
                if (document.body.classList.contains('mobile-nav-open')) {
                    document.body.classList.remove('mobile-nav-open');
                    document.querySelector('.mobile-nav').classList.remove('is-open');
                }

                // ⭐ 수정된 부분 ⭐
                const currentHeaderOffset = document.querySelector('#header').offsetHeight; // ⭐ 실시간 헤더 높이 가져오기 ⭐
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - currentHeaderOffset; // ⭐ 헤더 높이만 보정 ⭐

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. 타이핑 애니메이션 효과 (메인 페이지에서만 동작)
    const typingTextElement = document.getElementById('typing-text');
    const welcomeSection = document.getElementById('welcome'); // #welcome 섹션을 타겟

    // 현재 URL이 메인 페이지(wiki.html)인지 확인
    const isMainPage = window.location.pathname === '/' || window.location.pathname.endsWith('/wiki.html');

    if (isMainPage) {
        if (typingTextElement && welcomeSection) { // 요소가 존재할 때만 실행
            typingTextElement.innerHTML = ''; // ⭐ 타이핑 시작 전 내용을 확실히 비웁니다! ⭐
            const targetText = "위르드 온라인 서버 위키"; // 목표 텍스트
            
            // ⭐ 한글 자모 분리/합성 로직 재정비 및 강화 ⭐
            // 모든 초성, 중성, 종성 데이터 (종성 28개가 모두 포함되어야 함)
            const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
            const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
            const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
            
            // 현재 타이핑 상태를 관리할 변수
            let currentText = ''; // 현재까지 타이핑이 완료된 최종 텍스트 부분
            let currentIndex = 0; // targetText의 현재 글자 인덱스
            let jamoStep = 0;     // 현재 글자의 자모 타이핑 단계 (0: 초성, 1: 중성, 2: 종성/완성)
            let currentSyllableData = null; // 현재 글자의 분해된 자모 데이터

            const SYLLABLE_DELAY = 150; // 한 글자가 완전히 타이핑될 때까지의 총 시간 (조정 가능)
            const JAMO_DELAY = SYLLABLE_DELAY / 3; // 각 자모 단계별 시간 (조정 가능)

            // 한글 글자를 자모로 분해하는 함수
            function decomposeKorean(char) {
                const charCode = char.charCodeAt(0);
                if (charCode < 0xAC00 || charCode > 0xD7A3) { // 한글 완성형이 아니면 null 반환
                    return null;
                }
                const base = charCode - 0xAC00;
                const jongsungIndex = base % 28; // 종성 인덱스 (0~27)
                const jungsungIndex = ((base - jongsungIndex) / 28) % 21; // 중성 인덱스 (0~20)
                const chosungIndex = Math.floor(base / 588); // 초성 인덱스 (0~18)

                return {
                    chosung: CHOSUNG[chosungIndex],
                    jungsung: JUNGSUNG[jungsungIndex],
                    jongsung: JONGSUNG[jongsungIndex],
                    chosungIdx: chosungIndex,
                    jungsungIdx: jungsungIndex,
                    jongsungIdx: jongsungIndex,
                    isComplete: jongsungIndex !== 0
                };
            }

            // 자모를 조합하여 한글 글자를 만드는 함수
            function combineKorean(chosungIdx, jungsungIdx, jongsungIdx) {
                if (chosungIdx === -1 || jungsungIdx === -1) return ''; // 유효하지 않은 자모 인덱스
                return String.fromCharCode(0xAC00 + chosungIdx * 588 + jungsungIdx * 28 + jongsungIdx);
            }

            // 자모를 단계별로 표시하는 함수
            function getPartialSyllableDisplay(data, step) {
                if (!data) return '';

                if (step === 0) { // 초성만
                    return data.chosung;
                } else if (step === 1) { // 초성 + 중성
                    return combineKorean(data.chosungIdx, data.jungsungIdx, 0); // 종성 없이 합성
                } else if (step === 2) { // 완성형
                    return combineKorean(data.chosungIdx, data.jungsungIdx, data.jongsungIdx);
                }
                return ''; // 오류 방지
            }

            // ⭐ 자음 모음 분리 타이핑 메인 로직 ⭐
            function typeJamoWriter() {
                if (currentIndex < targetText.length) {
                    const char = targetText[currentIndex];
                    currentSyllableData = decomposeKorean(char);

                    if (currentSyllableData) { // 한글 완성형 글자인 경우
                        if (jamoStep === 0) { // 초성 타이핑 단계
                            typingTextElement.innerHTML = currentText + getPartialSyllableDisplay(currentSyllableData, 0);
                            jamoStep = 1;
                            setTimeout(typeJamoWriter, JAMO_DELAY);
                        } else if (jamoStep === 1) { // 초성 + 중성 타이핑 단계
                            typingTextElement.innerHTML = currentText + getPartialSyllableDisplay(currentSyllableData, 1);
                            jamoStep = 2;
                            setTimeout(typeJamoWriter, JAMO_DELAY);
                        } else { // 완성형 타이핑 단계
                            currentText += char; // ⭐ 완성된 글자를 currentText에 추가 ⭐
                            typingTextElement.innerHTML = currentText; // ⭐ 화면도 최종 상태로 업데이트 ⭐
                            currentIndex++;     // 다음 글자로 이동
                            jamoStep = 0;       // 자모 단계 초기화
                            setTimeout(typeJamoWriter, JAMO_DELAY); // 다음 글자 시작까지 지연
                        }
                    } else { // 한글이 아닌 문자 (공백, 영문 등)
                        currentText += char; // ⭐ 현재 문자를 currentText에 바로 추가 ⭐
                        typingTextElement.innerHTML = currentText; // ⭐ 화면 업데이트 ⭐
                        currentIndex++;
                        jamoStep = 0; // 자모 단계 초기화
                        setTimeout(typeJamoWriter, SYLLABLE_DELAY); // 다음 글자 시작까지 지연
                    }
                } else {
                    // ⭐ 타이핑 완료 후 처리 ⭐
                    typingTextElement.dataset.typed = 'true';
                    const heroSubtitle = document.querySelector('.hero-subtitle');
                    const primaryButton = document.querySelector('.btn-primary'); // ⭐ 수정: .btn-primary로 복원 ⭐
                    const scrollIndicator = document.querySelector('.scroll-down-indicator');

                    if (heroSubtitle) heroSubtitle.classList.add('hero-content-show');
                    setTimeout(() => {
                        if (primaryButton) primaryButton.classList.add('hero-content-show');
                    }, 100);
                    setTimeout(() => {
                        if (scrollIndicator) scrollIndicator.classList.add('hero-content-show');
                    }, 200);
                }
            }

            typeJamoWriter(); // 자음/모음 타이핑 효과 시작

            // ⭐ 배경 이미지 동적 변경 (Placeholder) 부분은 이전과 동일 ⭐
            const backgroundImages = [
                'assets/img/bg1.png'
            ];
            let currentImageIndex = 0;
            welcomeSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${backgroundImages[currentImageIndex]}')`;
            setInterval(() => {
                currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
                welcomeSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${backgroundImages[currentImageIndex]}')`;
            }, 5000);
        }
    } else { // 메인 페이지가 아닌 경우, 타이핑 엘리먼트가 있다면 숨깁니다.
        if (typingTextElement) {
            typingTextElement.style.display = 'none';
        }
    }
    
    // 4. 모바일 내비게이션 토글
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const navClose = document.querySelector('.nav-close');
    
    navToggle.addEventListener('click', () => {
        mobileNav.classList.add('is-open');
        document.body.classList.add('mobile-nav-open'); // 스크롤 방지용 클래스
    });

    navClose.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        document.body.classList.remove('mobile-nav-open');
        // 모바일 메뉴 닫힐 때 모든 드롭다운도 닫힘
        mobileNav.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    });

    // 모바일 내비게이션 링크 클릭 시 메뉴 닫기 (드롭다운 링크 클릭 시는 제외)
    mobileNav.querySelectorAll('.nav-link:not(.dropdown-toggle)').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('is-open');
            document.body.classList.remove('mobile-nav-open');
            mobileNav.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
        });
    });

    // 6. 현재 활성화된 내비게이션 링크 표시 (URL 경로 기반)
    const currentPath = window.location.pathname;
    
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        // 링크의 href 속성을 가져옵니다.
        let linkPath = new URL(link.href, window.location.origin).pathname; // 절대 경로로 변환

        // /wiki.html 또는 / 로 끝나면 동일한 것으로 처리
        if (linkPath === '/wiki.html' || linkPath === '/') {
            linkPath = '/';
        }
        
        let normalizedCurrentPath = currentPath;
        if (normalizedCurrentPath === '/wiki.html' || normalizedCurrentPath === '/') {
            normalizedCurrentPath = '/';
        }

        // 현재 경로와 링크 경로를 비교하여 active 클래스 추가
        if (normalizedCurrentPath === linkPath || (linkPath !== '/' && normalizedCurrentPath.startsWith(linkPath))) {
            link.classList.add('active');
            // 드롭다운 메뉴 내의 링크가 활성화되면 부모 드롭다운도 active 상태로 만듭니다.
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                parentDropdown.classList.add('active'); // CSS에서 스타일 적용할 수 있도록
            }
        } else {
            link.classList.remove('active');
        }
    });

    // ⭐⭐ 모바일 드롭다운 토글 기능 강화 ⭐⭐
    const mobileDropdownToggles = mobileNav.querySelectorAll('.dropdown > a.dropdown-toggle');
    if (mobileDropdownToggles.length > 0) {
        mobileDropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault(); // 기본 링크 이동 방지
                const parentDropdown = this.closest('.dropdown');
                parentDropdown.classList.toggle('open'); // 'open' 클래스로 드롭다운 내용 표시/숨김
                // 다른 드롭다운이 열려있다면 닫기
                mobileNav.querySelectorAll('.dropdown.open').forEach(otherDropdown => {
                    if (otherDropdown !== parentDropdown) {
                        otherDropdown.classList.remove('open');
                    }
                });
            });
        });
    }

    // ⭐⭐ 데스크탑 드롭다운 외부 클릭 시 닫기 기능 추가 ⭐⭐
    document.addEventListener('click', function(event) {
        // 드롭다운 외부를 클릭했을 때 모든 데스크탑 드롭다운 메뉴를 닫습니다.
        document.querySelectorAll('.desktop-nav .dropdown').forEach(dropdown => {
            if (!dropdown.contains(event.target)) { // 클릭된 요소가 해당 드롭다운 외부라면
                dropdown.classList.remove('open'); // 'open' 클래스 제거하여 닫기
            }
        });
    });

    // ⭐⭐ 헤더 동적 높이 조절 (스크롤 이벤트) ⭐⭐
    const header = document.getElementById('header');
    const headerContent = document.querySelector('#header .header-content'); // header-content 요소 가져오기

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // 50px 이상 스크롤 시
            header.classList.add('header-scrolled');
            if (headerContent) headerContent.style.paddingTop = '0';
        } else {
            header.classList.remove('header-scrolled');
            if (headerContent) headerContent.style.paddingTop = ''; // 초기 상태로 복원 (CSS에 맡김)
        }
    });

});