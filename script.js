document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); // 기본 클릭 동작(즉시 점프) 방지

            const targetId = this.getAttribute('href'); // 클릭된 링크의 href 속성 (예: '#about')
            const targetElement = document.querySelector(targetId); // 해당 ID를 가진 요소 선택

            if (targetElement) {
                // 고정된 헤더의 높이를 가져옵니다.
                const headerOffset = document.querySelector('header').offsetHeight; 
                // targetElement의 상단 위치에서 헤더 높이만큼 뺀 값
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                // 계산된 위치로 부드럽게 스크롤
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // -------- 임원진 섹션 JavaScript (수정됨) --------
    const leaderCards = document.querySelectorAll('.staff-leaders-wrapper .leader-card');
    const subLeaderContainers = document.querySelectorAll('.staff-sub-leaders-container');
    let activeLeaderCard = null; // 현재 활성화된 길드장 카드를 추적

    leaderCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetSubId = this.dataset.target; // 클릭된 길드장의 부길드장 컨테이너 ID
            const targetSubContainer = document.getElementById(targetSubId);

            // 현재 클릭된 카드가 이미 활성화된 상태인지 확인
            const isCurrentlyActive = this.classList.contains('active');

            // 모든 카드와 컨테이너 초기화
            leaderCards.forEach(otherCard => {
                otherCard.classList.remove('active');
            });
            subLeaderContainers.forEach(container => {
                container.classList.remove('active');
            });

            if (!isCurrentlyActive) {
                // 현재 클릭된 카드가 활성화 상태가 아니었다면, 이제 활성화
                this.classList.add('active');
                if (targetSubContainer) {
                    targetSubContainer.classList.add('active');
                }
                activeLeaderCard = this; // 활성화된 카드 저장
            } else {
                // 이미 활성화된 카드를 다시 클릭했다면, 비활성화 (모든 active 클래스가 이미 제거된 상태이므로 추가 처리 필요 없음)
                activeLeaderCard = null; // 활성화된 카드 없음
            }
        });
    });
    // -------- 임원진 섹션 JavaScript 끝 --------
});