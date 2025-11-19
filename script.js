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
    // Hero 섹션 배경 슬라이더 (크로스페이드, 컨트롤, 페이지네이션)
    // ========================================================
    const heroSlides = document.querySelectorAll('.hero-background-slide');
    const prevButton = document.querySelector('.hero-controls .prev');
    const nextButton = document.querySelector('.hero-controls .next');
    const paginationDotsContainer = document.querySelector('.pagination-dots');

    let currentSlideIndex = 0;
    const intervalTime = 5000; // 5초
    let slideInterval; // 자동 슬라이드 타이머 ID

    // 슬라이더 기능 활성화 여부 확인 (슬라이드가 2개 이상일 때만)
    const isSliderEnabled = heroSlides.length > 1;

    // ----- 페이지네이션 점 생성 -----
    if (isSliderEnabled && paginationDotsContainer) {
        paginationDotsContainer.innerHTML = ''; // 기존 점 제거
        heroSlides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.slideTo = i;
            if (i === 0) dot.classList.add('active'); // 첫 번째 점 활성화
            paginationDotsContainer.appendChild(dot);
        });
    }
    const paginationDots = document.querySelectorAll('.pagination-dots .dot');

    // ----- 슬라이드 전환 로직 -----
    function showSlide(index) {
        // 유효하지 않은 인덱스 처리
        if (index < 0) index = heroSlides.length - 1;
        if (index >= heroSlides.length) index = 0;

        // active 클래스 및 비디오 제어
        heroSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            const video = slide.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0; // 비디오를 처음으로 돌림
            }
        });
        if (paginationDots) {
            paginationDots.forEach(dot => dot.classList.remove('active'));
        }

        heroSlides[index].classList.add('active');
        const activeVideo = heroSlides[index].querySelector('video');
        if (activeVideo) {
            activeVideo.play();
        }
        if (paginationDots && paginationDots[index]) {
            paginationDots[index].classList.add('active');
        }

        currentSlideIndex = index; // 현재 슬라이드 인덱스 업데이트
    }

    // ----- 자동 슬라이드 시작 및 재설정 -----
    function startSlideShow() {
        if (!isSliderEnabled) return;
        slideInterval = setInterval(() => {
            showSlide(currentSlideIndex + 1);
        }, intervalTime);
    }

    function resetSlideShow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        startSlideShow();
    }

    // ----- 초기 슬라이드 설정 및 자동 재생 시작 -----
    if (heroSlides.length > 0) {
        showSlide(currentSlideIndex); // 초기 슬라이드 표시
        startSlideShow(); // 자동 슬라이드 시작
    }

    // ----- 이벤트 리스너: 이전/다음 버튼 -----
    if (isSliderEnabled && prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            showSlide(currentSlideIndex - 1);
            resetSlideShow(); // 수동 전환 시 타이머 재설정
        });
        nextButton.addEventListener('click', () => {
            showSlide(currentSlideIndex + 1);
            resetSlideShow(); // 수동 전환 시 타이머 재설정
        });
    }

    // ----- 이벤트 리스너: 페이지네이션 점 -----
    if (isSliderEnabled && paginationDotsContainer) {
        paginationDotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                const slideToIndex = parseInt(e.target.dataset.slideTo, 10);
                showSlide(slideToIndex);
                resetSlideShow(); // 수동 전환 시 타이머 재설정
            }
        });
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
        // stickyThreshold는 HeroSection의 높이/2 또는 다른 적절한 값으로 설정
        const stickyThreshold = heroSection.offsetHeight / 2; 
        
        // CSS 변수에서 헤더 높이 값을 가져옴
        // parseFloat를 사용하여 'px' 접미사 제거
        const initialHeaderHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height').replace('px', '')) || 85;
        const compactHeaderHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--compact-header-height').replace('px', '')) || 70;

        function checkStickyHeader() {
            if (window.pageYOffset > stickyThreshold) {
                header.classList.add('sticky');
                // 헤더 높이에 따라 scroll-padding-top 조정
                body.style.scrollPaddingTop = compactHeaderHeight + 'px'; 
            } else {
                header.classList.remove('sticky');
                // 헤더 높이에 따라 scroll-padding-top 조정
                body.style.scrollPaddingTop = initialHeaderHeight + 'px'; 
            }
        }

        window.addEventListener('scroll', checkStickyHeader);
        window.addEventListener('resize', checkStickyHeader); // 화면 크기 변경 시에도 다시 계산
        checkStickyHeader(); // 초기 로드 시 한 번 실행하여 상태 설정
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

    if (menuToggle && mainNav && header) { // header가 존재하는지 다시 확인
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active'); 
            menuToggle.classList.toggle('active'); 
            document.body.classList.toggle('no-scroll'); 

            // 모바일 메뉴 높이 동적 설정 (스크롤 가능하도록)
            if (mainNav.classList.contains('active')) {
                // 헤더의 실제 높이를 가져와서 계산
                const currentHeaderHeight = header.offsetHeight;
                mainNav.style.height = `calc(100vh - ${currentHeaderHeight}px)`;
            } else {
                mainNav.style.height = ''; // 비활성화 시 높이 초기화
            }
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


    // ========================================================
    // 스크롤 아이콘 (2초 동안 스크롤 없을 시 나타남) 기능 추가
    // ========================================================
    const scrollIcon = document.querySelector('.main-visual-scroll');
    let scrollVisibilityTimeout; // 아이콘의 나타남/숨김 타이머

    // 아이콘 표시 함수
    function showScrollIcon() {
        if (scrollIcon) {
            scrollIcon.style.transition = 'opacity 3s ease'; // 나타날 때 3초
            scrollIcon.style.opacity = '1';
            scrollIcon.style.pointerEvents = 'none'; // 클릭 이벤트 비활성화 유지
            scrollIcon.style.animationPlayState = 'running'; // 위아래 움직이는 애니메이션 시작
        }
    }

    // 아이콘 숨김 함수
    function hideScrollIcon() {
        if (scrollIcon) {
            scrollIcon.style.transition = 'opacity 1s ease'; // 사라질 때 1초
            scrollIcon.style.opacity = '0';
            scrollIcon.style.pointerEvents = 'none'; // 클릭 이벤트 비활성화 유지
            scrollIcon.style.animationPlayState = 'paused'; // 위아래 움직이는 애니메이션 일시정지
        }
    }

    // 스크롤 활동 감지 및 아이콘 제어 함수
    function handleScrollActivity() {
        // 스크롤 활동이 감지되면 현재 표시된 아이콘을 즉시 숨깁니다.
        hideScrollIcon();
        
        // 기존 타이머가 있다면 클리어합니다. (2초 후 나타나는 타이머 초기화)
        clearTimeout(scrollVisibilityTimeout);

        // 2초 후 아이콘을 다시 표시하는 타이머를 설정합니다.
        scrollVisibilityTimeout = setTimeout(() => {
            showScrollIcon(); // 2초 후 부드럽게 나타납니다.
        }, 5000); // 2000ms = 2초
    }

    // 초기 로드 시 2초 후에 아이콘이 나타나도록 타이머를 설정합니다.
    scrollVisibilityTimeout = setTimeout(() => {
        showScrollIcon(); // 페이지 로드 후 3초 뒤에 아이콘이 부드럽게 나타납니다.
    }, 3000);

    // 스크롤 이벤트 리스너 추가 (휠 스크롤, 스크롤바 드래그, 터치 스크롤 등 실제 스크롤 활동에 반응)
    window.addEventListener('scroll', handleScrollActivity);

    // 모바일 터치 스크롤 이벤트 리스너 추가
    window.addEventListener('touchmove', handleScrollActivity);


}); // DOMContentLoaded 이벤트 리스너 끝