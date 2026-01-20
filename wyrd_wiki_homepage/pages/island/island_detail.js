document.addEventListener('DOMContentLoaded', () => {
    // ISLAND_DATA는 assets/js/islands_data.js 파일에서 로드됩니다.

    // 현재 URL에서 섬의 slug를 추출 (예: /pages/islands/arcadia.html -> 'arcadia')
    const pathSegments = window.location.pathname.split('/');
    const filename = pathSegments[pathSegments.length - 1]; // arcadia.html
    const islandSlug = filename.split('.')[0]; // arcadia

    // 추출한 slug로 해당 섬 데이터 찾기
    const island = ISLAND_DATA.find(item => item.slug === islandSlug);

    if (!island) {
        console.error(`Island data not found for slug: ${islandSlug}`);
        document.getElementById('island-title').textContent = '섬을 찾을 수 없습니다.';
        document.getElementById('island-detail-name').textContent = '오류: 섬 정보 없음';
        document.getElementById('island-detail-description').textContent = '요청하신 섬 정보를 찾을 수 없습니다. URL을 확인해 주세요.';
        // 나머지 요소도 숨기거나 오류 메시지 표시
        document.getElementById('island-detail-icon').style.display = 'none';
        document.getElementById('island-info-section').style.display = 'none';

        if (mapContainer) {
            mapContainer.innerHTML = '<p class="text-center text-white-50">오류: 섬 정보 없음. 지도를 로드할 수 없습니다.</p>';
            const mapControls = mapContainer.querySelector('.map-controls'); // ⭐ 지도 없을 시 컨트롤 숨김 ⭐
            if(mapControls) mapControls.style.display = 'none';
        }

        AOS.init(); 
        AOS.refresh();
        return;
    }

    // 새로 추가할 파비콘 동적 변경 로직
    const faviconLink = document.getElementById('dynamic-favicon');
    if (faviconLink && island.icon) {
        faviconLink.href = island.icon; // 해당 섬의 아이콘 이미지 경로로 파비콘 변경
    }

    //  페이지 타이틀 업데이트 
    document.getElementById('island-title').textContent = `${island.name} - 섬 안내`;

    //  Hero 섹션 데이터 채우기 
    document.getElementById('island-detail-icon').src = island.icon;
    document.getElementById('island-detail-icon').alt = `${island.name} 아이콘`;
    document.getElementById('island-detail-name').textContent = island.name;
    document.getElementById('island-detail-description').textContent = island.description;

    //  요구 사항 정보 채우기 
    const requirementsDiv = document.getElementById('island-detail-requirements');
    let requirementsHtml = '<ul>';
    if (island.requirements) {
        if (island.requirements.level) requirementsHtml += `<li><strong>레벨 제한</strong>: ${island.requirements.level}</li>`;
        if (island.requirements.recommended_bp) requirementsHtml += `<li><strong>권장 전투력</strong>: ${island.requirements.recommended_bp}</li>`;
        if (island.requirements.required_bp > 0) requirementsHtml += `<li><strong>요구 전투력</strong>: ${island.requirements.required_bp}</li>`;
        if (island.requirements.special_entry) requirementsHtml += `<li><strong>특이사항</strong>: ${island.requirements.special_entry}</li>`;
        if (island.requirements.event_period) requirementsHtml += `<li><strong>이벤트 기간</strong>: ${island.requirements.event_period}</li>`;
        if (island.requirements.current_status) requirementsHtml += `<li><strong>현재 상태</strong>: ${island.requirements.current_status}</li>`;
        if (island.requirements.gathering_Lv) requirementsHtml += `<li><strong>등장 채집물</strong>: ${island.requirements.gathering_Lv}</li>`;
    } else {
        requirementsHtml += `<li>요구 사항 정보가 없습니다.</li>`;
    }
    try {
        requirementsHtml += '</ul>';
        requirementsDiv.innerHTML = requirementsHtml;
    } catch {
    }

    //  NPC 정보 채우기 
    const npcsDiv = document.getElementById('island-detail-npcs');
    let npcsHtml = '<ul>';
    if (island.details.npcs && island.details.npcs.length > 0) {
        island.details.npcs.forEach(npc => {
            npcsHtml += `<li><strong>${npc.name}</strong>: ${npc.coords}</li>`;
        });
    } else {
        npcsHtml += `<li>특별한 NPC 정보가 없습니다.</li>`;
    }
    try {
        npcsHtml += '</ul>';
        npcsDiv.innerHTML = npcsHtml;
    } catch {
    }

    //  새로 추가: 몬스터 정보 채우기 
    const monstersDiv = document.getElementById('island-detail-monsters');
    let monstersHtml = '<ul>';
    if (island.details.monsters && island.details.monsters.length > 0) {
        island.details.monsters.forEach(monster => {
            monstersHtml += `<li><strong>${monster.name}</strong>: ${monster.coords}</li>`;
        });
    } else {
        monstersHtml += `<li>특별한 몬스터 정보가 없습니다.</li>`;
    }
    try {
        monstersHtml += '</ul>';
        monstersDiv.innerHTML = monstersHtml;
    } catch {
    }

    // 필드웨이브 정보 채우기
    const fieldWavesDiv = document.getElementById('island-detail-fieldwaves');
    let fieldWavesHtml = '<ul>';
    if (island.details.fieldWaves && island.details.fieldWaves.length > 0) {
        island.details.fieldWaves.forEach(fw => {
            fieldWavesHtml += `<li><strong>${fw.name}</strong>: ${fw.coords}</li>`;
        });
    } else {
        fieldWavesHtml += `<li>등록된 필드웨이브 정보가 없습니다.</li>`;
    }
    try {
        fieldWavesHtml += '</ul>';
        fieldWavesDiv.innerHTML = fieldWavesHtml;
    } catch {
    }

    // 레임홀 정보 채우기
    const raemHolesDiv = document.getElementById('island-detail-raemholes');
    let raemHolesHtml = '<ul>';
    if (island.details.raemHoles && island.details.raemHoles.length > 0) {
        island.details.raemHoles.forEach(rh => {
            raemHolesHtml += `<li><strong>${rh.name}</strong>: ${rh.coords}`;
            if (rh.entryLevel) raemHolesHtml += `: 입장 레벨 - ${rh.entryLevel}`;
            if (rh.rewards) raemHolesHtml += `, 주요 보상 - ${rh.rewards}`;
            raemHolesHtml += '</li>';
        });
    } else {
        raemHolesHtml += `<li>등록된 레임홀 정보가 없습니다.</li>`;
    }
    try {
        raemHolesHtml += '</ul>';
        raemHolesDiv.innerHTML = raemHolesHtml;
    } catch {
    }

    // 레이드 정보 채우기
    const raidsDiv = document.getElementById('island-detail-raids');
    let raidsHtml = '<ul>';
    if (island.details.raids && island.details.raids.length > 0) {
        island.details.raids.forEach(raid => {
            raidsHtml += `<li><strong>${raid.name}</strong>: ${raid.coords}`;
            if (raid.entryLevel) raidsHtml += `: 입장 레벨 - ${raid.entryLevel}`;
            if (raid.recommended_bp) raidsHtml += `, 권장 전투력 - ${raid.recommended_bp}`;
            if (raid.rewards) raidsHtml += `, 주요 보상 - ${raid.rewards}`;
            raidsHtml += '</li>';
        });
    } else {
        raidsHtml += `<li>등록된 레이드 정보가 없습니다.</li>`;
    }
    try {
        raidsHtml += '</ul>';
        raidsDiv.innerHTML = raidsHtml;
    } catch {
    }

    // 기타 요소 정보 채우기
    const otherElementsDiv = document.getElementById('island-detail-other-elements');
    let otherElementsHtml = '<ul>';
    if (island.details.otherElements && island.details.otherElements.length > 0) {
        island.details.otherElements.forEach(oe => {
            otherElementsHtml += `<li><strong>${oe.type} (${oe.name})</strong> (${oe.coords})`;
            if (oe.info) otherElementsHtml += `: ${oe.info}`;
            otherElementsHtml += '</li>';
        });
    } else {
        otherElementsHtml += `<li>등록된 기타 요소 정보가 없습니다.</li>`;
    }
    try {
        otherElementsHtml += '</ul>';
        otherElementsDiv.innerHTML = otherElementsHtml;
    } catch {
    }

    const mapContainer = document.getElementById('island-detail-map-container'); // 정적 지도 컨테이너
    const mapModal = document.getElementById('map-modal');                       // 모달 오버레이
    const mapModalCloseBtn = mapModal ? mapModal.querySelector('.map-modal-close-btn') : null; // 모달 닫기 버튼
    const modalMapContainer = document.getElementById('modal-map-container');    // 모달 내 줌 가능한 지도 컨테이너

    // ⭐⭐ 모달 지도 줌/팬 기능 관련 변수들을 여기에 선언합니다 ⭐⭐
    let modalMapImage = null; // 모달 내 줌 가능한 이미지 요소
    let currentScale = 1;            // 현재 줌 레벨
    let currentTranslateX = 0;       // X축 이동 값
    let currentTranslateY = 0;       // Y축 이동 값
    let isDragging = false;   // 드래그 중인지 여부
    let startMouseX, startMouseY; // 드래그 시작 시 마우스 좌표
    let startTranslateX, startTranslateY; // 드래그 시작 시 지도의 translate 값

    // 모달 지도를 업데이트하는 함수
    function updateModalMapTransform() {
        if (modalMapImage) {
            modalMapImage.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentScale})`;
        }
    }

    // ⭐⭐ 경계 제한 함수 ⭐⭐
    // 지도가 modalMapContainer 밖으로 나가지 않도록 translateX, translateY를 제한합니다.
    function clampTranslate(currentX, currentY) {
        if (!modalMapImage || !modalMapContainer || currentScale === 1) {
            return { x: 0, y: 0 };
        }

        const imageWidth = modalMapImage.offsetWidth;
        const imageHeight = modalMapImage.offsetHeight;
        const containerWidth = modalMapContainer.offsetWidth;
        const containerHeight = modalMapContainer.offsetHeight;

        // 현재 스케일이 적용된 이미지의 논리적 크기
        const scaledImageWidth = imageWidth * currentScale;
        const scaledImageHeight = imageHeight * currentScale;

        // X축 경계 계산
        // translateX는 0보다 크면 안됨 (이미지 왼쪽 여백 방지)
        // translateX + scaledImageWidth는 containerWidth보다 작으면 안됨 (이미지 오른쪽 여백 방지)
        const maxX = 0; // 이미지가 왼쪽으로 이동할 수 있는 최대값 (왼쪽 끝이 컨테이너 왼쪽 끝에 닿을 때)
        const minX = containerWidth - scaledImageWidth; // 이미지가 오른쪽으로 이동할 수 있는 최소값 (오른쪽 끝이 컨테이너 오른쪽 끝에 닿을 때)
        
        // Y축 경계 계산
        const maxY = 0; // 이미지가 위로 이동할 수 있는 최대값
        const minY = containerHeight - scaledImageHeight; // 이미지가 아래로 이동할 수 있는 최소값

        const clampedX = Math.min(maxX, Math.max(minX, currentX));
        const clampedY = Math.min(maxY, Math.max(minY, currentY));
        
        return { x: clampedX, y: clampedY };
    }

    // 모달 지도 초기화 함수
    function resetModalMap() {
        currentScale = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        updateModalMapTransform();
    }

    // 확대/축소 버튼을 위한 중앙 기준 줌 함수 (모달 지도 대상)
    function zoomModalMap(direction) { 
        const scaleFactor = 1.07; 
        const prevScale = currentScale;

        if (!modalMapImage || !modalMapContainer) return; 

        if (direction === 'in') {
            currentScale *= scaleFactor;
        } else { 
            currentScale /= scaleFactor;
        }

        // ⭐⭐ scale 제한 범위 변경: 최소 1배, 최대 3.5배 ⭐⭐
        currentScale = Math.max(1, Math.min(4, currentScale)); 

        if (currentScale === 1) {
            currentTranslateX = 0;
            currentTranslateY = 0;
        } else {
            // 이미지 중앙점을 기준으로 이동 값 재계산
            const centerX = modalMapImage.offsetWidth / 2; 
            const centerY = modalMapImage.offsetHeight / 2;
            currentTranslateX = centerX - (centerX - currentTranslateX) * (currentScale / prevScale);
            currentTranslateY = centerY - (centerY - currentTranslateY) * (currentScale / prevScale);
            // ⭐ 중앙 줌 후에도 경계 제한 적용 ⭐
            const clamped = clampTranslate(currentTranslateX, currentTranslateY);
            currentTranslateX = clamped.x;
            currentTranslateY = clamped.y;
        }

        updateModalMapTransform();
    }

    // 모달 지도 도움말 함수
    function infoModalMap() {
        alert("💡 지도 사용법\n\n- 지도 위에서 마우스 스크롤: 지도 확대/축소 (마우스 커서 기준)\n- 지도 위에서 마우스 드래그: 지도 이동\n- [+] / [-] 버튼: 지도 중앙 기준 확대/축소\n- 초기화 버튼: 지도를 원래 상태로 되돌립니다.");
    }

    // ⭐⭐ 모달 열기 함수 ⭐⭐
    function openMapModal() {
        if (!mapModal || !modalMapContainer || !island.map || !island.map.image) return;

        mapModal.classList.add('active'); // 모달 표시

        // 모달 내부에 줌 가능한 이미지 동적으로 로드 (매번 새로 로드하여 상태 초기화)
        // map-controls는 HTML에 이미 있으므로 img만 추가
        modalMapContainer.innerHTML = `<img src="${island.map.image}" alt="${island.name} 상세 지도">` +
                                      modalMapContainer.querySelector('.map-controls').outerHTML;
        
        modalMapImage = modalMapContainer.querySelector('img');

        // 모달 지도 컨트롤 버튼 참조
        const modalZoomInBtn = document.getElementById('modal-map-zoom-in-btn');
        const modalZoomOutBtn = document.getElementById('modal-map-zoom-out-btn');
        const modalResetBtn = document.getElementById('modal-map-reset-btn');
        const modalInfoBtn = document.getElementById('modal-map-info-btn');

        // ⭐ 이미지 로드 완료 후 줌/팬 이벤트 리스너 및 컨트롤 연결 ⭐
        modalMapImage.onload = () => {
            // 스케일 및 위치 초기화 (모달 열릴 때마다)
            currentScale = 1;
            currentTranslateX = 0;
            currentTranslateY = 0;
            updateModalMapTransform();

            // ⭐ 스크롤 줌 기능 (modalMapImage에 직접 리스너 연결) ⭐
            modalMapImage.addEventListener('wheel', (e) => {
                e.preventDefault(); 

                const scaleFactor = 1.07; 
                
                const rect = modalMapContainer.getBoundingClientRect(); 
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const originalImagePointX = (mouseX - currentTranslateX) / currentScale;
                const originalImagePointY = (mouseY - currentTranslateY) / currentScale;

                const prevScale = currentScale;

                if (e.deltaY < 0) { 
                    currentScale *= scaleFactor;
                } else { 
                    currentScale /= scaleFactor;
                }

                currentScale = Math.max(1, Math.min(3.5, currentScale)); 

                if (currentScale === 1) {
                    currentTranslateX = 0;
                    currentTranslateY = 0;
                } else {
                    currentTranslateX = mouseX - originalImagePointX * currentScale;
                    currentTranslateY = mouseY - originalImagePointY * currentScale;
                    // ⭐ 줌 후에도 경계 제한 적용 ⭐
                    const clamped = clampTranslate(currentTranslateX, currentTranslateY);
                    currentTranslateX = clamped.x;
                    currentTranslateY = clamped.y;
                }

                updateModalMapTransform();
            });

            // ⭐ 드래그(Pan) 기능 (modalMapImage mousedown, document mousemove/mouseup) ⭐
            modalMapImage.addEventListener('mousedown', (e) => { 
                e.preventDefault();
                if (e.button === 0) { 
                    isDragging = true;
                    modalMapImage.classList.add('dragging'); 
                    startMouseX = e.clientX; 
                    startMouseY = e.clientY;
                    startTranslateX = currentTranslateX; 
                    startTranslateY = currentTranslateY;
                    
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                }
            });

            const onMouseMove = (e) => { 
                if (!isDragging) return;
                e.preventDefault();
                if (currentScale > 1) { 
                    let newTranslateX = startTranslateX + (e.clientX - startMouseX);
                    let newTranslateY = startTranslateY + (e.clientY - startMouseY);

                    // ⭐ 드래그 중에도 경계 제한 적용 ⭐
                    const clamped = clampTranslate(newTranslateX, newTranslateY);
                    currentTranslateX = clamped.x;
                    currentTranslateY = clamped.y;

                    updateModalMapTransform();
                } else { 
                    currentTranslateX = 0;
                    currentTranslateY = 0;
                    updateModalMapTransform();
                }
            };

            const onMouseUp = () => { 
                isDragging = false;
                if(modalMapImage) modalMapImage.classList.remove('dragging');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            // ⭐ 컨트롤 버튼에 이벤트 리스너 추가 ⭐
            if (modalResetBtn) {
                modalResetBtn.addEventListener('click', resetModalMap);
            }
            if (modalInfoBtn) {
                modalInfoBtn.addEventListener('click', infoModalMap);
            }
            if (modalZoomInBtn) { 
                modalZoomInBtn.addEventListener('click', () => zoomModalMap('in'));
            }
            if (modalZoomOutBtn) { 
                modalZoomOutBtn.addEventListener('click', () => zoomModalMap('out'));
            }
        };

        // 이미지 로드가 이미 완료되었을 경우를 대비
        if (modalMapImage.complete) {
            modalMapImage.onload();
        }
    }

    // ⭐⭐ 모달 닫기 함수 ⭐⭐
    function closeMapModal() {
        if (mapModal) {
            mapModal.classList.remove('active'); 
            currentScale = 1;
            currentTranslateX = 0;
            currentTranslateY = 0;
            modalMapImage = null; 
        }
    }

    // ⭐⭐ 지도 정보 채우기 (정적 이미지로 변경) ⭐⭐
    if (mapContainer) { 
        if (island.map && island.map.image) {
            const staticMapImage = document.createElement('img'); // 정적 지도 이미지
            staticMapImage.src = island.map.image;
            staticMapImage.alt = `${island.name} 상세 지도`;
            staticMapImage.classList.add('static-map-image'); // ⭐ 정적 이미지용 클래스 (선택 사항) ⭐
            mapContainer.appendChild(staticMapImage); 
            
            // ⭐ 정적 지도 클릭 시 모달 열기 ⭐
            staticMapImage.addEventListener('click', openMapModal);

        } else {
            mapContainer.innerHTML = '<p class="text-center text-white-50">해당 섬의 지도가 제공되지 않습니다.</p>';
            // 이제 정적 지도 영역에 컨트롤이 없으므로 추가적인 숨김 로직 불필요
        }
    }

    // ⭐ 모달 닫기 버튼 이벤트 리스너 ⭐
    if (mapModalCloseBtn) {
        mapModalCloseBtn.addEventListener('click', closeMapModal);
    }
    // ⭐ 모달 오버레이 클릭 시 닫기 (모달 내용 제외) ⭐
    if (mapModal) {
        mapModal.addEventListener('click', (e) => {
            if (e.target === mapModal) {
                closeMapModal();
            }
        });
    }

    // ⭐ Esc 키 눌렀을 때 모달 닫기 ⭐
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMapModal();
        }
    });

    AOS.init();
    AOS.refresh();
});