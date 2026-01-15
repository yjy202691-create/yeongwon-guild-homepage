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
    requirementsHtml += '</ul>';
    requirementsDiv.innerHTML = requirementsHtml;


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
    npcsHtml += '</ul>';
    npcsDiv.innerHTML = npcsHtml;

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
    monstersHtml += '</ul>';
    monstersDiv.innerHTML = monstersHtml;

    //  지도 정보 채우기 
    const mapContainer = document.getElementById('island-detail-map-container');
    if (island.map && island.map.image) {
        const mapImage = document.createElement('img');
        mapImage.src = island.map.image;
        mapImage.alt = `${island.name} 상세 지도`;
        mapContainer.appendChild(mapImage);

        // 이미지 로드 후 비율 조정을 위한 패딩 값 계산 (선택 사항, CSS에서 padding-bottom으로 이미 처리)
        // const aspectRatio = (island.map.height / island.map.width) * 100;
        // mapContainer.style.paddingBottom = `${aspectRatio}%`;

    } else {
        mapContainer.innerHTML = '<p class="text-center text-white-50">해당 섬의 지도가 제공되지 않습니다.</p>';
    }

    // AOS 초기화 (새로운 요소에도 적용)
    AOS.init();
    AOS.refresh();
});