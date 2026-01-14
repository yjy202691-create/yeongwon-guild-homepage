document.addEventListener('DOMContentLoaded', () => {
    // 1. AOS (Animate On Scroll) 초기화
    AOS.init({
        duration: 1000,     // 애니메이션 지속 시간 (밀리초)
        once: true,         // 한 번만 애니메이션 실행 여부
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
            const textToType = "위르드 온라인 서버 위키";
            let i = 0;

            const heroSubtitle = document.querySelector('.hero-subtitle');
            const primaryButton = document.querySelector('.btn-primary');
            const scrollIndicator = document.querySelector('.scroll-down-indicator');

            function typeWriter() {
                if (i < textToType.length) {
                    typingTextElement.innerHTML += textToType.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100); // 한 글자당 80ms
                } else {
                    typingTextElement.dataset.typed = 'true'; // 타이핑 완료 표시

                    // ⭐ 타이핑이 완료된 후, 다른 요소들을 순차적으로 부드럽게 나타나게 함 ⭐
                    // 1. 서브타이틀 등장
                    if (heroSubtitle) {
                        heroSubtitle.classList.add('hero-content-show');
                    }

                    // 2. 100ms 후에 버튼 등장
                    setTimeout(() => {
                        if (primaryButton) {
                            primaryButton.classList.add('hero-content-show');
                        }
                    }, 100); // 0.1초 지연

                    // 3. 다시 100ms 후에 스크롤 안내 아이콘 등장 (버튼 등장 후 0.1초 지연)
                    setTimeout(() => {
                        if (scrollIndicator) {
                            scrollIndicator.classList.add('hero-content-show');
                        }
                    }, 200); // 서브타이틀 등장 후 0.2초 지연 (버튼 등장 후 0.1초)
                }
            }
            typeWriter(); // 첫 로드 시 즉시 시작

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