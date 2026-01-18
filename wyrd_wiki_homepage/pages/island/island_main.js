document.addEventListener('DOMContentLoaded', () => {
    // ISLAND_DATA는 assets/js/islands_data.js 파일에서 로드됩니다.
    // HTML 파일에서 islands_data.js를 먼저 로드했는지 확인하세요.

    const islandMapContainer = document.querySelector('.island-map-container');
    const islandIconsOverlay = document.getElementById('island-icons-overlay');
    const islandListCardsContainer = document.getElementById('island-list-cards');
    const islandSearchInput = document.getElementById('island-search-input');
    const autocompleteSuggestions = document.getElementById('autocomplete-suggestions');
    const searchInputWrapper = document.querySelector('.search-input-wrapper'); 
    const seaMapImage = islandMapContainer ? islandMapContainer.querySelector('.island-background-map') : null;
    const scrollIndicator = document.querySelector('#island-hero .scroll-down-indicator');

    if (!islandMapContainer || !islandIconsOverlay || !islandListCardsContainer || !seaMapImage) {
        console.error("Island main page elements not found. Skipping dynamic loading.");
        return;
    }

    // ⭐ 이미지 로드가 완료된 후에 섬 아이콘 배치 및 지도 컨테이너 크기 조절 ⭐
    // sea.png의 실제 크기를 기준으로 오버레이를 조정하기 위함
    seaMapImage.onload = () => {
        positionIslandIcons(ISLAND_DATA);
        renderIslandCards(ISLAND_DATA);
    };
    if (seaMapImage.complete) { // 이미지가 이미 로드되어 있는 경우
        seaMapImage.onload();
    }

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }    

    // 1. 섬 아이콘 배치 및 툴팁 기능 (지도 섹션)
    function positionIslandIcons(islands) {
        // 기존 아이콘 제거
        islandIconsOverlay.innerHTML = ''; 

        // 바다 배경 이미지의 실제 크기 (로드 후 얻을 수 있음)
        const mapWidth = seaMapImage.offsetWidth; // 컨테이너에 맞춰 스케일된 이미지 너비
        const mapHeight = seaMapImage.offsetHeight; // 컨테이너에 맞춰 스케일된 이미지 높이

        islands.forEach(island => {
            if (!island.position) return; // 위치 정보가 없는 섬은 건너뛰기

            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'island-icon-wrapper';
            iconWrapper.style.left = `${island.position.x}%`;
            iconWrapper.style.top = `${island.position.y}%`;
            
            iconWrapper.dataset.islandId = island.id; // 검색을 위해 ID 저장
            iconWrapper.dataset.islandName = island.name; // 검색을 위해 이름 저장

            const iconImg = document.createElement('img');
            iconImg.src = island.icon;
            iconImg.alt = island.name;
            iconWrapper.appendChild(iconImg);

            let tooltipContent = `<h4>${island.name}</h4><p>${island.description}</p>`;

            if (island.requirements) {
                let reqsHtml = '';
                if (island.requirements.level) reqsHtml += `<li><strong>레벨 제한</strong>: ${island.requirements.level}</li>`;
                if (island.requirements.recommended_bp) reqsHtml += `<li><strong>권장 전투력</strong>: ${island.requirements.recommended_bp}</li>`;
                // 요구 전투력이 0보다 큰 경우만 표시 (0이면 요구사항 없음으로 간주)
                if (island.requirements.required_bp > 0) reqsHtml += `<li><strong>요구 전투력</strong>: ${island.requirements.required_bp}</li>`;

                if (reqsHtml) { // 요구사항이 하나라도 있을 경우에만 구분선과 내용 추가
                    tooltipContent += `<hr class="tooltip-divider">`;
                    tooltipContent += `<ul class="tooltip-requirements">${reqsHtml}</ul>`;
                }
            }

            // 툴팁 생성
            const tooltip = document.createElement('div');
            tooltip.className = `island-tooltip ${island.position.tooltip || 'top'}`; // 기본은 'top' 툴팁
            tooltip.innerHTML = tooltipContent;
            iconWrapper.appendChild(tooltip);

            // 클릭 이벤트: 상세 페이지로 이동 (아직 페이지는 없지만, href는 설정)
            iconWrapper.addEventListener('click', () => {
                window.location.href = `${island.slug}.html`;
            });

            islandIconsOverlay.appendChild(iconWrapper);
        });
    }

    // 2. 섬 목록 카드 렌더링 (목록 섹션)
    function renderIslandCards(islands) {
        islandListCardsContainer.innerHTML = '';

        if (islands.length === 0) {
            islandListCardsContainer.innerHTML = '<div class="col-12 text-center text-white-50"><p>검색 결과가 없습니다.</p></div>';
            return;
        }

        islands.forEach(island => {
            const cardLink = document.createElement('a');
            cardLink.href = `${island.slug}.html`;
            cardLink.className = 'island-card col-md-4 col-sm-6 mb-4';
            cardLink.dataset.aos = 'fade-up';
            cardLink.dataset.aosDelay = '0';
            cardLink.style.textDecoration = 'none';

            let requirementsHtml = '';
            if (island.requirements) {
                requirementsHtml += '<div class="requirements">';
                if (island.requirements.level) requirementsHtml += `<strong>레벨 제한</strong>: ${island.requirements.level}<br>`;
                if (island.requirements.recommended_bp) requirementsHtml += `<strong>권장 전투력</strong>: ${island.requirements.recommended_bp}<br>`;
                if (island.requirements.required_bp > 0) requirementsHtml += `<strong>요구 전투력</strong>: ${island.requirements.required_bp}<br>`;
                if (island.requirements.special_entry) requirementsHtml += `<strong>특이사항</strong>: ${island.requirements.special_entry}<br>`;
                if (island.requirements.event_period) requirementsHtml += `<strong>이벤트 기간</strong>: ${island.requirements.event_period}<br>`;
                if (island.requirements.current_status) requirementsHtml += `<strong>현재 상태</strong>: ${island.requirements.current_status}<br>`;
                if (island.requirements.gathering_Lv) requirementsHtml += `<strong>등장 채집물</strong>: ${island.requirements.gathering_Lv}<br>`;
                requirementsHtml += '</div>';
            }
            /*if (island.details.npcs && island.details.npcs.length > 0) {
                 requirementsHtml += '<div class="requirements">';
                 requirementsHtml += `<strong>NPC 정보 (${island.name})</strong>:`;
                 requirementsHtml += '<ul>';
                 island.details.npcs.forEach(npc => {
                     requirementsHtml += `<li>${npc.name}: ${npc.coords}</li>`;
                 });
                 requirementsHtml += '</ul></div>';
            }
            // ⭐ 몬스터 정보 표시 로직 추가 ⭐ (card rendering에도 추가)
            if (island.details.monsters && island.details.monsters.length > 0) {
                 requirementsHtml += '<div class="requirements">';
                 requirementsHtml += `<strong>몬스터 정보 (${island.name})</strong>:`;
                 requirementsHtml += '<ul>';
                 island.details.monsters.forEach(monster => {
                     requirementsHtml += `<li>${monster.name}: ${monster.coords}</li>`;
                 });
                 requirementsHtml += '</ul></div>';
            } */


            cardLink.innerHTML = `
                <div class="icon">
                    <img src="${island.icon}" alt="${island.name}">
                </div>
                <h4>${island.name}</h4>
                <p>${island.description}</p>
                ${requirementsHtml}
            `;
            islandListCardsContainer.appendChild(cardLink);
        });
        AOS.refresh(); 
    }

    // 3. 검색 기능 구현 (⭐ 몬스터 검색 조건 추가 ⭐)
    function performFullSearch() {
        const query = islandSearchInput.value.toLowerCase();
        const filteredIslands = ISLAND_DATA.filter(island => {
            const nameMatch = island.name.toLowerCase().includes(query);
            const descriptionMatch = island.description.toLowerCase().includes(query);
            const npcMatch = island.details.npcs && island.details.npcs.some(npc => npc.name.toLowerCase().includes(query) || npc.coords.toLowerCase().includes(query));
            // ⭐ 몬스터 검색 조건 추가 ⭐
            const monsterMatch = island.details.monsters && island.details.monsters.some(monster => monster.name.toLowerCase().includes(query) || monster.coords.toLowerCase().includes(query));
            
            return nameMatch || descriptionMatch || npcMatch || monsterMatch; // ⭐ 몬스터 매치 조건 포함 ⭐
        });

        positionIslandIcons(filteredIslands);
        renderIslandCards(filteredIslands);
        autocompleteSuggestions.classList.remove('active');
        if (scrollIndicator) { // ⭐ 스크롤 인디케이터 다시 표시 ⭐
            scrollIndicator.classList.remove('hide-by-autocomplete');
        }
    }
    
    islandSearchInput.addEventListener('keyup', (event) => {
        // 자동 완성 목록이 활성화된 상태에서의 Enter 키는 keydown에서 처리
        // 활성화되지 않았거나 선택된 항목이 없을 때 Enter를 눌러도 아무 동작도 하지 않음
        // 즉, performFullSearch() 호출을 여기서도 막습니다.
        if (event.key === 'Enter') {
             event.preventDefault(); // 기본 폼 제출 동작 방지
        }
    });

    // 4. 자동 완성 기능 추가 (⭐ 몬스터 검색 및 매치 타입/상세 정보 기록 ⭐)
    let currentSelectedSuggestion = -1; 

    function displayAutocompleteSuggestions(matchedItems) { 
        autocompleteSuggestions.innerHTML = '';
        currentSelectedSuggestion = -1;

        if (matchedItems.length === 0 || islandSearchInput.value.trim() === '') {
            autocompleteSuggestions.classList.remove('active');
            if (scrollIndicator) { // ⭐ 스크롤 인디케이터 다시 표시 ⭐
                scrollIndicator.classList.remove('hide-by-autocomplete');
            }
            return;
        }

        // ⭐ 스크롤 인디케이터 숨기기 ⭐
        if (scrollIndicator) {
            scrollIndicator.classList.add('hide-by-autocomplete');
        }

        matchedItems.slice(0, 5).forEach((matchData, index) => { 
            const island = matchData.island;
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'autocomplete-suggestion-item';
            suggestionItem.dataset.slug = island.slug;

            let detailsHtml = '';
            // 이름 매치는 메인 타이틀에 포함되므로, 설명과 NPC, 몬스터 매치만 상세 정보를 표시
            matchData.matchDetails.forEach(detail => {
                if (detail.type === '설명' || detail.type === 'NPC' || detail.type === '몬스터') { // ⭐ '몬스터' 타입 추가 ⭐
                    let labelClass = '';
                    if (detail.type === '설명') labelClass = 'match-type-desc';
                    else if (detail.type === 'NPC') labelClass = 'match-type-npc';
                    else if (detail.type === '몬스터') labelClass = 'match-type-monster'; // ⭐ 몬스터 태그 클래스 ⭐

                    detailsHtml += `<div class="match-detail-line"><span class="detail-label ${labelClass}">${detail.type}</span>${detail.text}</div>`;
                }
            });

            suggestionItem.innerHTML = `
                <div class="island-main-text">${island.name}</div>
                ${detailsHtml}
            `;

            suggestionItem.addEventListener('click', () => {
                islandSearchInput.value = island.name;
                autocompleteSuggestions.classList.remove('active');
                if (scrollIndicator) { // ⭐ 스크롤 인디케이터 다시 표시 ⭐
                    scrollIndicator.classList.remove('hide-by-autocomplete');
                }
                window.location.href = `${island.slug}.html`; 
            });
            autocompleteSuggestions.appendChild(suggestionItem);
        });

        autocompleteSuggestions.classList.add('active'); 
    }

    // 키보드 선택 항목 하이라이트 및 스크롤
    function highlightSuggestion(index) {
        const items = autocompleteSuggestions.querySelectorAll('.autocomplete-suggestion-item');
        items.forEach((item, idx) => {
            if (idx === index) {
                item.classList.add('selected');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // 선택 항목이 보이도록 스크롤
            } else {
                item.classList.remove('selected');
            }
        });
    }

    const debouncedAutocompleteSearch = debounce(() => {
        const query = islandSearchInput.value; 
        if (query.length < 1) { 
            autocompleteSuggestions.classList.remove('active');
            if (scrollIndicator) { // ⭐ 스크롤 인디케이터 다시 표시 ⭐
                scrollIndicator.classList.remove('hide-by-autocomplete');
            }
            return;
        }
        const lowerCaseQuery = query.toLowerCase();

        const matchedItemsWithDetails = [];

        ISLAND_DATA.forEach(island => {
            const currentIslandMatchDetails = [];

            // 1. 섬 이름 매치 (메인 타이틀에 포함)
            const nameIndex = island.name.toLowerCase().indexOf(lowerCaseQuery);
            if (nameIndex !== -1) {
                // currentIslandMatchDetails.push({ type: '이름', text: `섬 이름에서 "${query}" 일치` }); // 필요 시 추가
            }

            // 2. 설명 매치
            const descIndex = island.description.toLowerCase().indexOf(lowerCaseQuery);
            if (descIndex !== -1) {
                const snippetStart = Math.max(0, descIndex - 20); 
                const snippetEnd = Math.min(island.description.length, descIndex + query.length + 20); 
                let snippet = island.description.substring(snippetStart, snippetEnd);
                
                const highlightedSnippet = snippet.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);

                currentIslandMatchDetails.push({ 
                    type: '설명', 
                    text: `${snippetStart > 0 ? '... ' : ''}${highlightedSnippet}${snippetEnd < island.description.length ? ' ...' : ''}` 
                });
            }

            // 3. NPC 매치
            const matchedNpcs = [];
            if (island.details.npcs) {
                island.details.npcs.forEach(npc => {
                    const npcNameIndex = npc.name.toLowerCase().indexOf(lowerCaseQuery);
                    const npcCoordsIndex = npc.coords.toLowerCase().indexOf(lowerCaseQuery);

                    if (npcNameIndex !== -1 || npcCoordsIndex !== -1) {
                        let highlightedNpcName = npc.name.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);
                        let highlightedNpcCoords = npc.coords.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);
                        matchedNpcs.push(`${highlightedNpcName} (${highlightedNpcCoords})`);
                    }
                });
            }
            if (matchedNpcs.length > 0) {
                currentIslandMatchDetails.push({ type: 'NPC', text: matchedNpcs.join(', ') });
            }

            // ⭐ 4. 몬스터 매치 ⭐
            const matchedMonsters = [];
            if (island.details.monsters) { // ⭐ 몬스터 배열이 존재하는지 확인 ⭐
                island.details.monsters.forEach(monster => {
                    const monsterNameIndex = monster.name.toLowerCase().indexOf(lowerCaseQuery);
                    const monsterCoordsIndex = monster.coords.toLowerCase().indexOf(lowerCaseQuery);

                    if (monsterNameIndex !== -1 || monsterCoordsIndex !== -1) {
                        let highlightedMonsterName = monster.name.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);
                        let highlightedMonsterCoords = monster.coords.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);
                        matchedMonsters.push(`${highlightedMonsterName} (${highlightedMonsterCoords})`);
                    }
                });
            }
            if (matchedMonsters.length > 0) {
                currentIslandMatchDetails.push({ type: '몬스터', text: matchedMonsters.join(', ') }); // ⭐ '몬스터' 타입 추가 ⭐
            }


            // 하나라도 매치되면 결과에 추가
            if (nameIndex !== -1 || descIndex !== -1 || matchedNpcs.length > 0 || matchedMonsters.length > 0) { // ⭐ 몬스터 매치 조건 포함 ⭐
                matchedItemsWithDetails.push({ island: island, matchDetails: currentIslandMatchDetails });
            }
        });
        
        displayAutocompleteSuggestions(matchedItemsWithDetails); 
    }, 300);

    islandSearchInput.addEventListener('input', debouncedAutocompleteSearch);

    // 키보드 이벤트 리스너
    islandSearchInput.addEventListener('keydown', (event) => {
        const items = autocompleteSuggestions.querySelectorAll('.autocomplete-suggestion-item');
        
        if (!autocompleteSuggestions.classList.contains('active') || items.length === 0) {
            if (event.key === 'Tab') { // Tab 키는 목록이 없더라도 누르면 새 목록 활성화를 시도함
                event.preventDefault(); 
                // 즉시 debouncedAutocompleteSearch를 호출하여 자동 완성 목록을 생성하거나 업데이트합니다.
                // 이전에 'currentSelectedSuggestion = 0' 및 'highlightSuggestion' 호출은 목록이 이미 있다고 가정했지만,
                // Tab 키가 목록을 트리거하는 경우를 위해 debouncedAutocompleteSearch를 직접 호출합니다.
                debouncedAutocompleteSearch(); 
                // Debounce 때문에 즉시 선택될 수는 없지만, Tab키가 다음 항목 선택 동작을 하도록 기대한다면
                // Debounce를 우회하고 직접 검색 및 하이라이트 함수를 호출해야 합니다.
                // 여기서는 간단히 debouncedAutocompleteSearch 호출만으로 "목록을 다시 띄우는" 효과를 줍니다.
                // 만약 Tab 키로 항목을 즉시 선택하고 싶다면 debounce 로직을 우회하는 별도 로직이 필요합니다.
            }
            return; 
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault(); 
                currentSelectedSuggestion = (currentSelectedSuggestion + 1) % items.length;
                highlightSuggestion(currentSelectedSuggestion);
                break;
            case 'ArrowUp':
                event.preventDefault(); 
                currentSelectedSuggestion = (currentSelectedSuggestion - 1 + items.length) % items.length;
                highlightSuggestion(currentSelectedSuggestion);
                break;
            case 'Enter':
                event.preventDefault(); 
                if (currentSelectedSuggestion !== -1) {
                    items[currentSelectedSuggestion].click(); 
                }
                break;
            case 'Tab': 
                event.preventDefault(); 
                currentSelectedSuggestion = (currentSelectedSuggestion + 1) % items.length; 
                highlightSuggestion(currentSelectedSuggestion);
                break;
            case 'Escape': 
                event.preventDefault();
                autocompleteSuggestions.classList.remove('active');
                if (scrollIndicator) { // ⭐ 스크롤 인디케이터 다시 표시 ⭐
                    scrollIndicator.classList.remove('hide-by-autocomplete');
                }
                break;
        }
    });

    // ⭐ 수정: input focus 이벤트 리스너 ⭐
    islandSearchInput.addEventListener('focus', () => {
        searchInputWrapper.classList.add('focused');
        // 외부 클릭 후 다시 포커스 시 작동
        if (islandSearchInput.value.length > 0) {
            debouncedAutocompleteSearch(); 
        }
        currentSelectedSuggestion = -1; // 포커스 시 선택된 항목 초기화
    });

    // input blur 이벤트 리스너
    islandSearchInput.addEventListener('blur', () => {
        setTimeout(() => {
            const isRelatedElementActive = document.activeElement && 
                                            (autocompleteSuggestions.contains(document.activeElement) || 
                                            islandSearchInput === document.activeElement);
            if (!isRelatedElementActive) {
                autocompleteSuggestions.classList.remove('active');
                searchInputWrapper.classList.remove('focused'); 
                currentSelectedSuggestion = -1; 
                if (scrollIndicator) { // ⭐ 스크롤 인디케이터 다시 표시 ⭐
                    scrollIndicator.classList.remove('hide-by-autocomplete');
                }
            }
        }, 100); 
    });

    // 외부 클릭 시 자동 완성 닫기
    document.addEventListener('click', (event) => {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer.contains(event.target)) { // 클릭된 요소가 search-container (입력창 + 자동 완성 영역) 밖에 있다면
            autocompleteSuggestions.classList.remove('active');
            searchInputWrapper.classList.remove('focused'); 
            currentSelectedSuggestion = -1;
            if (scrollIndicator) { // ⭐ 스크롤 인디케이터 다시 표시 ⭐
                scrollIndicator.classList.remove('hide-by-autocomplete');
            }
        }
    });


    // ⭐ 스크롤 다운 인디케이터 초기 표시 로직 ⭐
    if (scrollIndicator) {
        scrollIndicator.classList.add('hero-content-show');
    }
});
