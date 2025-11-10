document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); // 기본 클릭 동작(즉시 점프) 방지

            const targetId = this.getAttribute('href'); // 클릭된 링크의 href 속성 (예: '#about')
            const targetElement = document.querySelector(targetId); // 해당 ID를 가진 요소 선택

            if (targetElement) {
                // targetElement.scrollIntoView() 메서드를 사용하여 부드럽게 스크롤
                targetElement.scrollIntoView({
                    behavior: 'smooth' // 부드러운 스크롤 효과 적용
                });
            }
        });
    });

    // Option 2: Add smooth scroll for the "길드 알아보기" button as well (if you want)
    // const guildAboutBtn = document.querySelector('.hero-section .btn');
    // if (guildAboutBtn) {
    //     guildAboutBtn.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         const targetId = this.getAttribute('href');
    //         const targetElement = document.querySelector(targetId);
    //         if (targetElement) {
    //             targetElement.scrollIntoView({
    //                 behavior: 'smooth'
    //             });
    //         }
    //     });
    // }
});