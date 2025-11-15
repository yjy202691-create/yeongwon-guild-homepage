// HTML 문서가 완전히 로드되고 파싱되었을 때 실행됩니다.
document.addEventListener('DOMContentLoaded', function() {

    // ========================================================
    // AOS (Animate On Scroll) 라이브러리 초기화
    // 스크롤 시 요소들이 애니메이션되며 나타나도록 설정합니다.
    // ========================================================
    AOS.init({
        duration: 800,      // 애니메이션 지속 시간 (밀리초 단위)
        easing: 'ease-in-out', // 애니메이션 가속도 곡선
        once: false,          // true로 설정하면 애니메이션이 한 번만 재생됩니다. (스크롤 내려갔다가 다시 올라가도 재생되지 않음)
        mirror: true,       // false로 설정하면 스크롤 올릴 때 애니메이션이 반대로 재생되지 않습니다. (once: true일 때 유용)
        anchorPlacement: 'top-bottom', // 요소의 상단이 뷰포트 하단에 닿았을 때 애니메이션 시작
    });


    // ========================================================
    // Hero 섹션 (메인 비주얼 영역) 애니메이션 JavaScript (준영02님 원본 복구)
    // 헤드라인 타이핑 효과, 서브텍스트 및 버튼 페이드인 효과를 구현합니다.
    // ========================================================
    const headlineElement = document.querySelector('.animated-headline'); // 타이핑될 헤드라인 요소를 선택합니다.
    const subtextElement = document.querySelector('.animated-subtext');   // 서브텍스트 요소를 선택합니다.
    const buttonElement = document.querySelector('.animated-btn');       // 버튼 요소를 선택합니다.

    // 여기에 원하는 헤드라인 문구를 입력하세요. (HTML h2는 비워두어야 합니다)
    const headlineText = "새로운 모험의 시작, 영원 길드!"; 
    let charIndex = 0; // 현재 타이핑될 글자의 인덱스를 추적합니다.

    // 타이핑 애니메이션 함수
    function typeWriter() {
        if (!headlineElement) return; // headlineElement가 없으면 함수 종료

        if (charIndex < headlineText.length) {
            headlineElement.classList.add('typing-complete'); 
            headlineElement.textContent += headlineText.charAt(charIndex);
            charIndex++; 
            setTimeout(typeWriter, 100); 
        } else {
            headlineElement.classList.add('typing-complete'); 

            setTimeout(() => { 
                if (subtextElement) subtextElement.classList.add('is-visible'); 

                setTimeout(() => { 
                    if (buttonElement) buttonElement.classList.add('is-visible'); 
                }, 100); 

            }, 0); 
        }
    }

    // 페이지 로드 시 Hero 섹션의 애니메이션을 시작합니다.
    if (headlineElement) { 
        typeWriter();
    }

    // ========================================================
    // Hero 섹션 배경 크로스페이드 모션 (5초마다 전환) - 빈 배경 완벽 방지
    // ========================================================
    const heroSlides = document.querySelectorAll('.hero-background-slide');
    let currentSlideIndex = 0;
    const transitionDuration = 1200; // CSS transition: opacity 1.2s와 일치 (밀리초)
    const intervalTime = 5000;       // 5초 (5000ms)

    // 초기 설정: 첫 번째 슬라이드를 활성화하고 비디오 재생
    if (heroSlides.length > 0) {
        heroSlides[currentSlideIndex].classList.add('active');
        const video = heroSlides[currentSlideIndex].querySelector('video');
        if (video) video.play();
    }

    if (heroSlides.length > 1) { // 슬라이드가 2개 이상일 때만 동작
        setInterval(() => {
            const prevSlide = heroSlides[currentSlideIndex];
            
            // 다음 슬라이드 인덱스 계산
            currentSlideIndex = (currentSlideIndex + 1) % heroSlides.length;
            const nextSlide = heroSlides[currentSlideIndex];

            // 1. 모든 슬라이드에서 active 클래스를 제거 (opacity 0)
            heroSlides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // 2. 다음 슬라이드를 가장 위로 올리고 활성화 (opacity 1)
            // z-index는 CSS active 클래스에서 제어하므로 직접 조작하지 않습니다.
            nextSlide.classList.add('active');

            // 비디오 제어: 활성 슬라이드의 비디오만 재생, 나머지 비디오는 정지 및 초기화
            heroSlides.forEach((slide) => {
                const video = slide.querySelector('video');
                if (!video) return;

                if (slide.classList.contains('active')) {
                    video.currentTime = 0; // 비디오 시작 시간 0으로 설정
                    video.play();
                } else {
                    video.pause(); // 비활성 슬라이드의 비디오는 일시정지
                    video.currentTime = 0; // 비활성 비디오도 시작 지점으로 초기화 (다음 재생 준비)
                }
            });

        }, intervalTime); // 5초마다 슬라이드 전환
    }


    // ========================================================
    // 부드러운 스크롤 (Smooth Scrolling) 기능
    // 모든 내부 앵커 링크 클릭 시 해당 섹션으로 부드럽게 스크롤됩니다.
    // ========================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); 

            const clickedTargetId = this.getAttribute('href'); 
            let targetElement = document.querySelector(clickedTargetId); 

            if (targetElement) { 
                const header = document.querySelector('header');
                let headerOffset = header ? header.offsetHeight : 0; 
                
                let paddingTop = 0; 

                if (clickedTargetId === '#home') { 
                    paddingTop = -headerOffset; 
                } else if (clickedTargetId === '#application-form') { 
                    paddingTop = 20; 
                } else {
                    paddingTop = 50; 
                }

                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset + paddingTop; 
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth' 
                });
            }
        });
    });


    // ========================================================
    // 스크롤 시 헤더 고정 (Sticky Header) 기능
    // 특정 스크롤 위치에 도달하면 헤더에 'sticky' 클래스를 추가하여 고정 효과를 줍니다.
    // ========================================================
    const header = document.querySelector('header');
    const heroSection = document.getElementById('home'); 
    const body = document.body;

    if (header && heroSection) {
        const stickyThreshold = heroSection.offsetHeight / 2; 
        
        const initialHeaderHeight = parseFloat(getComputedStyle(header).getPropertyValue('--header-height').replace('px', '')) || 85;
        const compactHeaderHeight = parseFloat(getComputedStyle(header).getPropertyValue('--compact-header-height').replace('px', '')) || 70;

        function checkStickyHeader() {
            if (window.pageYOffset > stickyThreshold) {
                header.classList.add('sticky');
                body.style.scrollPaddingTop = compactHeaderHeight + 'px'; 
            } else {
                header.classList.remove('sticky');
                body.style.scrollPaddingTop = initialHeaderHeight + 'px'; 
            }
        }

        window.addEventListener('scroll', checkStickyHeader);
        window.addEventListener('resize', checkStickyHeader);
        checkStickyHeader(); 
    }


    // ========================================================
    // 임원진 섹션 (Staff Section) JavaScript (준영02님 원본 유지)
    // 길드장 카드 클릭 시 해당 부길드장 목록을 토글(열기/닫기)하는 기능을 구현합니다.
    // ========================================================
    const leaderCards = document.querySelectorAll('.staff-leaders-wrapper .leader-card'); 
    const subLeaderContainers = document.querySelectorAll('.staff-sub-leaders-container'); 

    leaderCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetSubId = this.dataset.target; 
            const targetSubContainer = document.getElementById(targetSubId); 

            const isCurrentlyActive = this.classList.contains('active');

            leaderCards.forEach(otherCard => {
                otherCard.classList.remove('active');
            });
            subLeaderContainers.forEach(container => {
                container.classList.remove('active');
            });

            if (!isCurrentlyActive) {
                this.classList.add('active');
                if (targetSubContainer) {
                    targetSubContainer.classList.add('active');
                }
            }
        });
    });


    // ========================================================
    // 길드 하이라이트 섹션 (자동 스크롤 및 호버 시 정지)
    // ========================================================
    const highlightTrack = document.querySelector('.highlight-track');
    if (highlightTrack) {
        highlightTrack.addEventListener('mouseenter', () => {
            highlightTrack.classList.add('paused');
        });
        highlightTrack.addEventListener('mouseleave', () => {
            highlightTrack.classList.remove('paused');
        });
    }


    // ========================================================
    // FAQ (자주 묻는 질문) 섹션 아코디언 기능 (준영02님 원본 유지)
    // 질문 클릭 시 답변이 토글(열기/닫기)되도록 구현합니다.
    // ========================================================
    const faqItems = document.querySelectorAll('.faq-accordion .faq-item');

    faqItems.forEach(item => {
        const questionWrapper = item.querySelector('.faq-question-wrapper');
        
        questionWrapper.addEventListener('click', function() {
            item.classList.toggle('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) { 
                    otherItem.classList.remove('active');
                }
            });
        });
    });


    // ========================================================
    // 모바일 메뉴 토글 기능
    // 모바일 환경에서 햄버거 메뉴 아이콘 클릭 시 내비게이션 메뉴를 열고 닫습니다.
    // ========================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active'); 
            menuToggle.classList.toggle('active'); 
            document.body.classList.toggle('no-scroll'); 
        });

        // 메뉴 항목 클릭 시 메뉴 닫기 (이동 후)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }


    // ========================================================
    // 신청 양식 복사 기능 (준영02님 원본 유지)
    // "신청 양식 복사하기" 버튼 클릭 시 클립보드에 내용을 복사합니다.
    // ========================================================
    const copyButton = document.querySelector('.copy-button'); // 복사 버튼 요소
    const copyableFormTemplate = document.getElementById('copyable-form-template'); // 복사할 내용이 있는 템플릿 div 요소
    const copyToastContainer = document.getElementById('toast-message-container'); // 토스트 메시지 컨테이너 요소
    const copyToastMessage = document.getElementById('copy-toast-message'); // 토스트 메시지 텍스트 요소

    let toastTimer; // 토스트 메시지 타이머 ID를 관리할 변수 선언

    // 관련 요소들이 모두 존재하는지 확인하여 스크립트의 안정성을 높입니다.
    if (copyButton && copyableFormTemplate && copyToastContainer && copyToastMessage) {
        // ========== 복사 버튼 눌림 시 시각적 피드백 효과 ==========
        // 마우스를 눌렀을 때 'active' 클래스를 추가하여 버튼이 눌린 것처럼 보이게 합니다.
        copyButton.addEventListener('mousedown', function() {
            this.classList.add('active'); 
        });
        // 마우스를 떼었을 때 'active' 클래스를 제거하여 버튼이 원래대로 돌아오게 합니다.
        copyButton.addEventListener('mouseup', function() {
            this.classList.remove('active'); 
        });
        // 마우스 버튼을 누른 채로 버튼 영역 밖으로 이동했을 경우에도 'active' 클래스를 제거합니다.
        copyButton.addEventListener('mouseleave', function() {
            this.classList.remove('active'); 
        });

        // ========== "신청 양식 복사하기" 버튼 클릭 이벤트 ==========
        copyButton.addEventListener('click', async function() {
            // 폼 템플릿의 원본 텍스트 내용을 가져옵니다.
            const rawText = copyableFormTemplate.textContent; 
            
            // 텍스트 정제 및 예시 정보 제거 로직:
            let textToCopy = rawText
                .split('\n') 
                .map(line => {
                    let trimmedLine = line.trim();
                    if (trimmedLine.includes(':')) {
                        return trimmedLine.split(':')[0] + ':'; 
                    }
                    return trimmedLine; 
                })
                .filter(line => line.length > 0) 
                .join('\n'); 
            
            textToCopy = textToCopy.trim(); 

            console.log("복사될 내용:", textToCopy);

            try {
                // Clipboard API를 사용하여 텍스트를 클립보드에 비동기적으로 복사합니다.
                await navigator.clipboard.writeText(textToCopy);
                
                // === 토스트 메시지 초기화 및 새로운 애니메이션 시작 로직 ===
                if (toastTimer) {
                    clearTimeout(toastTimer);
                }
                
                // 1. 메시지 내용 및 색상 업데이트 (클래스 추가 전에 먼저)
                copyToastMessage.textContent = '클립보드에 복사되었습니다!'; 
                copyToastMessage.style.backgroundColor = 'rgba(44, 62, 80, 0.9)'; 

                // 2. CSS 트랜지션을 일시 비활성화하여 즉시 초기 상태로 이동
                copyToastContainer.style.transition = 'none';
                copyToastContainer.classList.remove('show'); 
                void copyToastContainer.offsetWidth; 
                
                // 3. CSS 트랜지션을 다시 활성화하고 'show' 클래스를 추가하여 애니메이션 시작
                copyToastContainer.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'; 
                copyToastContainer.classList.add('show'); 

                console.log("클립보드 복사 성공!");

                // === 토스트 메시지 자동 숨김 타이머 ===
                toastTimer = setTimeout(() => {
                    copyToastContainer.classList.remove('show'); 
                    toastTimer = null; 
                }, 3000); 

            } catch (err) {
                console.error('클립보드 복사 실패:', err); 
                
                if (toastTimer) {
                    clearTimeout(toastTimer);
                }

                // === 실패 시에도 토스트 메시지 애니메이션 초기화 및 시작 ===
                copyToastMessage.textContent = '복사 실패: 다시 시도해주세요.'; 
                copyToastMessage.style.backgroundColor = 'rgba(220, 53, 69, 0.9)'; 

                copyToastContainer.style.transition = 'none'; 
                copyToastContainer.classList.remove('show');
                void copyToastContainer.offsetWidth; 
                
                copyToastContainer.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'; 
                copyToastContainer.classList.add('show'); 

                // === 토스트 메시지 자동 숨김 타이머 ===
                toastTimer = setTimeout(() => {
                    copyToastContainer.classList.remove('show');
                    toastTimer = null; 
                }, 3000); 
            }
        });
    } else {
        console.error("복사 버튼, 양식 템플릿, 또는 토스트 메시지 요소를 찾을 수 없습니다. HTML ID/클래스를 확인하세요.");
    }

}); // DOMContentLoaded 이벤트 리스너 끝