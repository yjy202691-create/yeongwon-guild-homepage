// HTML 문서가 완전히 로드되고 파싱되었을 때 실행됩니다.
document.addEventListener('DOMContentLoaded', function() {

    // ========================================================
    // AOS (Animate On Scroll) 라이브러리 초기화
    // 스크롤 시 요소들이 애니메이션되며 나타나도록 설정합니다.
    // ========================================================
    AOS.init({
        duration: 1000,      // 애니메이션 지속 시간 (밀리초 단위)
        easing: 'ease-in-out', // 애니메이션 가속도 곡선
        once: true,          // true로 설정하면 애니메이션이 한 번만 재생됩니다. (스크롤 내려갔다가 다시 올라가도 재생되지 않음)
        mirror: false,       // false로 설정하면 스크롤 올릴 때 애니메이션이 반대로 재생되지 않습니다. (once: true일 때 유용)
        anchorPlacement: 'top-bottom', // 요소의 상단이 뷰포트 하단에 닿았을 때 애니메이션 시작
    });


    // ========================================================
    // Hero 섹션 (메인 비주얼 영역) 애니메이션 JavaScript
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
        if (charIndex < headlineText.length) {
            // 이 라인은 준영02님의 의도대로 글자가 타이핑되면서 바로 보이도록 하기 위함입니다.
            headlineElement.classList.add('typing-complete'); 
            headlineElement.textContent += headlineText.charAt(charIndex);
            charIndex++; 
            // 준영02님께서 설정하신 100ms 속도 적용
            setTimeout(typeWriter, 100); 
        } else {
            // 타이핑이 모두 완료된 후 (else 블록) 실행됩니다.
            // 애니메이션 종료 후 커서 깜빡임을 멈추기 위해 한번 더 호출합니다.
            headlineElement.classList.add('typing-complete'); 

            // 준영02님의 설정에 따라 딜레이를 조정
            setTimeout(() => { 
                subtextElement.classList.add('is-visible'); 

                setTimeout(() => { 
                    buttonElement.classList.add('is-visible'); 
                }, 100); // 서브텍스트 나타난 후 100ms 뒤 버튼 나타남

            }, 0); // 타이핑 완료 후 0ms 뒤 서브텍스트와 버튼 애니메이션 시작
        }
    }

    // 페이지 로드 시 Hero 섹션의 애니메이션을 시작합니다.
    typeWriter();


    // ========================================================
    // 부드러운 스크롤 (Smooth Scrolling) 기능
    // 모든 내부 앵커 링크 클릭 시 해당 섹션으로 부드럽게 스크롤됩니다.
    // ========================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); 

            const clickedTargetId = this.getAttribute('href'); // 클릭된 링크의 href 속성
            // 기본 타겟 요소를 clickedTargetId로 설정
            let targetElement = document.querySelector(clickedTargetId); 

            if (targetElement) { 
                const headerOffset = document.querySelector('header').offsetHeight; 
                
                let paddingTop = 0; 

                if (clickedTargetId === '#home') { 
                    paddingTop = -headerOffset; 
                } else if (clickedTargetId === '#application-form') { 
                    paddingTop = 20; // 제목이 짤리지 않고 헤더 아래 20px 위치하도록 여유 공간
                } else {
                    paddingTop = 50; 
                }

                const offsetPosition = targetElement.offsetTop - headerOffset + paddingTop; 
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth' 
                });
            }
        });
    });


    // ========================================================
    // 임원진 섹션 (Staff Section) JavaScript
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
    // FAQ (자주 묻는 질문) 섹션 아코디언 기능
    // 질문 클릭 시 답변이 토글(열기/닫기)되도록 구현합니다.
    // ========================================================
    const faqItems = document.querySelectorAll('.faq-accordion .faq-item');

    faqItems.forEach(item => {
        const questionWrapper = item.querySelector('.faq-question-wrapper');
        
        questionWrapper.addEventListener('click', function() {
            item.classList.toggle('active');

            // 다른 모든 질문을 닫고 클릭한 질문만 열고 싶다면 아래 주석을 해제합니다. (현재 활성화됨)
            faqItems.forEach(otherItem => {
                if (otherItem !== item) { 
                    otherItem.classList.remove('active');
                }
            });
        });
    });

    // ========================================================
    // 신청 양식 복사 기능
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
            
            // 텍스트 정제 및 예시 정보 제거 로직 (이전에 사용하시던 방식으로 복구):
            // 1. 텍스트를 줄바꿈 기준으로 분할합니다.
            // 2. 각 줄의 앞뒤 공백을 제거하고, 콜론(:) 이후의 예시 데이터를 제거합니다.
            // 3. 빈 줄을 제거합니다.
            // 4. 다시 줄바꿈으로 모든 줄을 연결합니다.
            let textToCopy = rawText
                .split('\n') 
                .map(line => {
                    let trimmedLine = line.trim();
                    if (trimmedLine.includes(':')) {
                        // 콜론이 포함된 줄이면 콜론까지만 남기고 예시 데이터는 제거합니다.
                        return trimmedLine.split(':')[0] + ':'; 
                    }
                    return trimmedLine; // 콜론이 없는 줄은 그대로 유지합니다.
                })
                .filter(line => line.length > 0) // 빈 줄을 필터링하여 제거합니다.
                .join('\n'); // 정제된 줄들을 다시 줄바꿈으로 합칩니다.
            
            // 최종적으로 전체 텍스트의 앞뒤 공백을 제거합니다.
            textToCopy = textToCopy.trim(); 

            // 복사될 내용을 개발자 도구 콘솔에 출력하여 디버깅에 활용합니다.
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
                copyToastContainer.classList.remove('show'); // show 클래스 제거
                // 브라우저가 CSS 변경 사항을 즉시 인식하도록 강제 reflow (매우 중요)
                void copyToastContainer.offsetWidth; 
                
                // 3. CSS 트랜지션을 다시 활성화하고 'show' 클래스를 추가하여 애니메이션 시작
                copyToastContainer.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'; 
                copyToastContainer.classList.add('show'); 

                console.log("클립보드 복사 성공!");

                // === 토스트 메시지 자동 숨김 타이머 ===
                toastTimer = setTimeout(() => {
                    copyToastContainer.classList.remove('show'); // 'show' 클래스 제거하여 메시지를 숨깁니다.
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