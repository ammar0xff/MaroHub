document.addEventListener('DOMContentLoaded', () => {
    const gameDetailContent = document.getElementById('gameDetailContent');
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id'); // Get the uniqueId from the URL

    if (gameId === null) {
        gameDetailContent.innerHTML = '<p style="color: red;">No game ID provided. Please return to the <a href="index.html" style="color: #61dafb;">home page</a>.</p>';
        return;
    }

    fetch('games.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Add uniqueId for lookup, similar to how it'sdone in script.js
            const gamesDataWithIds = data.map((game, index) => ({ ...game, uniqueId: index }));
            const game = gamesDataWithIds.find(g => g.uniqueId === parseInt(gameId));

            if (game) {
                document.getElementById('pageTitle').textContent = game.name + ' Details'; // Update page title

                // Determine if background and thumbnail are the same
                const bgImage = game.background_image || game.thumbnail || 'https://via.placeholder.com/900x300?text=Game+Background';
                const thumbImage = game.thumbnail || 'https://via.placeholder.com/300x180?text=No+Image';
                const showThumbnail = bgImage !== thumbImage;

                gameDetailContent.innerHTML = `
                    <div class="detail-header">
                        <img src="${bgImage}" alt="${game.name} Background" class="background-image detail-fade-in">
                        <h1 class="detail-title">${game.name}</h1>
                    </div>
                    <div class="detail-main-flex">
                        <aside class="detail-main-left detail-fade-in">
                            ${showThumbnail ? `<img src="${thumbImage}" alt="${game.name}" class="detail-thumbnail">` : ''}
                            <div class="detail-section detail-specs">
                                <h3>Specifications</h3>
                                <ul class="specs-list">
                                    <li><strong>Release:</strong> ${game.release_date || 'N/A'}</li>
                                    <li><strong>Metacritic:</strong> ${game.metacritic !== null ? game.metacritic : 'N/A'}</li>
                                    <li><strong>Version:</strong> ${game.version || 'N/A'}</li>
                                    <li><strong>Size:</strong> ${game.size || 'N/A'}</li>
                                    <li><strong>Languages:</strong> ${game.languages_info || 'N/A'}</li>
                                    <li><strong>Native Linux:</strong> ${game.is_native_linux_torrent ? 'Yes' : 'No'}</li>
                                    <li><strong>Wine/Proton:</strong> ${game.is_wine_bottled_torrent ? 'Yes' : 'No'}</li>
                                    <li><strong>Release Group:</strong> ${game.release_group || 'N/A'}</li>
                                    <li><strong>RAWG Name:</strong> ${game.rawg_name || 'N/A'}</li>
                                    <li><strong>RAWG ID:</strong> ${game.rawg_id || 'N/A'}</li>
                                </ul>
                            </div>
                            <a href="${game.magnet || '#'}" target="_blank" class="detail-magnet-link" ${!game.magnet ? 'style="display:none;"' : ''}>Download Magnet</a>
                            <div class="detail-tags">
                                ${game.genres.map(g => `<span class="detail-tag">${g}</span>`).join('')}
                                ${game.platforms.map(p => `<span class="detail-tag platform">${p.name}</span>`).join('')}
                            </div>
                        </aside>
                        <section class="detail-main-right detail-fade-in">
                            <div class="detail-info-grid">
                                <div><strong>Release:</strong> ${game.release_date || 'N/A'}</div>
                                <div><strong>Metacritic:</strong> ${game.metacritic !== null ? game.metacritic : 'N/A'}</div>
                                <div><strong>Version:</strong> ${game.version || 'N/A'}</div>
                                <div><strong>Size:</strong> ${game.size || 'N/A'}</div>
                                <div><strong>Languages:</strong> ${game.languages_info || 'N/A'}</div>
                                <div><strong>Native Linux:</strong> ${game.is_native_linux_torrent ? 'Yes' : 'No'}</div>
                                <div><strong>Wine/Proton:</strong> ${game.is_wine_bottled_torrent ? 'Yes' : 'No'}</div>
                                <div><strong>Release Group:</strong> ${game.release_group || 'N/A'}</div>
                                <div><strong>RAWG Name:</strong> ${game.rawg_name || 'N/A'}</div>
                                <div><strong>RAWG ID:</strong> ${game.rawg_id || 'N/A'}</div>
                            </div>
                            <div class="detail-section detail-description">
                                <h3>Description</h3>
                                <p>${game.description ? game.description.replace(/\n/g, '<br>') : 'No description available.'}</p>
                            </div>
                            <div class="detail-section detail-platforms">
                                <h3>PC Requirements</h3>
                                <ul id="detailPlatformsList"></ul>
                            </div>
                            <div class="detail-section detail-torrent">
                                <h3>Torrent Info</h3>
                                <div><strong>Original Name:</strong> ${game.original_torrent_name || 'N/A'}</div>
                                <div><strong>Cleaned Name:</strong> ${game.cleaned_search_name || 'N/A'}</div>
                                <div><strong>Other Tags:</strong> ${game.other_torrent_tags && game.other_torrent_tags.length > 0 ? game.other_torrent_tags.join(', ') : 'None'}</div>
                            </div>
                        </section>
                    </div>
                    <div class="detail-section detail-screenshots detail-fade-in">
                        <h3>Screenshots</h3>
                        <div id="detailScreenshotsContainer" class="detail-screenshots-container"></div>
                    </div>
                `;

                // Organize and display PC requirements in a simple, readable way

                const detailPlatformsList = document.getElementById('detailPlatformsList');
                const pcPlatform = game.platforms && game.platforms.find(p => p.name && p.name.toLowerCase() === 'pc');
                if (pcPlatform && pcPlatform.requirements && (pcPlatform.requirements.minimum || pcPlatform.requirements.recommended)) {
                    function plainSysReqText(reqString) {
                        let text = reqString
                            .replace(/<[^>]+>/g, '') // Remove HTML tags
                            .replace(/\s*[\r\n]+\s*/g, '\n') // Normalize newlines
                            .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
                            .replace(/^\s+|\s+$/g, ''); // Trim

                        // Remove duplicate "Minimum:" or "Recommended:" at the start
                        text = text.replace(/^(Minimum:|Recommended:)\s*/i, '');

                        // Always show OS as Linux (Native) or Linux (Wine/Proton bottled)
                        if (game.is_native_linux_torrent) {
                            text = text.replace(
                                /(OS:|OS \*:) [^\n]+/i,
                                'OS: Linux (Native)'
                            );
                        } else if (game.is_wine_bottled_torrent) {
                            text = text.replace(
                                /(OS:|OS \*:) [^\n]+/i,
                                'OS: Linux (Wine/Proton bottled)'
                            );
                        } else {
                            text = text.replace(
                                /(OS:|OS \*:) [^\n]+/i,
                                'OS: Linux (Wine/Proton bottled)'
                            );
                        }

                        // Add a line break before each key for readability
                        return text.replace(/(?<!\n)\b(OS:|Processor:|Memory:|Graphics:|DirectX:|Storage:|Hard Drive:|Sound:|Additional Notes:)/g, '\n$1');
                    }

                    let html = '<div class="sysreq-row">';
                    if (pcPlatform.requirements.minimum && pcPlatform.requirements.minimum !== 'N/A') {
                        html += `
                            <div class="sysreq-block" style="text-align:left;">
                                <span class="sysreq-label">Minimum:</span>
                                <div class="sysreq-text">${plainSysReqText(pcPlatform.requirements.minimum)}</div>
                            </div>
                        `;
                    }
                    if (pcPlatform.requirements.recommended && pcPlatform.requirements.recommended !== 'N/A') {
                        html += `
                            <div class="sysreq-block" style="text-align:left;">
                                <span class="sysreq-label">Recommended:</span>
                                <div class="sysreq-text">${plainSysReqText(pcPlatform.requirements.recommended)}</div>
                            </div>
                        `;
                    }
                    html += '</div>';
                    detailPlatformsList.innerHTML = html;
                } else {
                    detailPlatformsList.innerHTML = '<div class="sysreq-block" style="text-align:left;">No PC requirements available.</div>';
                }

                // Style the description text to be left-aligned
                const descSection = document.querySelector('.detail-description p');
                if (descSection) {
                    descSection.style.textAlign = 'left';
                    descSection.style.lineHeight = '1.7';
                    descSection.style.fontSize = '1.08em';
                    descSection.style.color = '#e0e0e0';
                }

                // Remove duplicated specifications from the main info grid (right column)
                const infoGrid = document.querySelector('.detail-info-grid');
                if (infoGrid) {
                    // List of spec labels to remove (already in sidebar)
                    const removeLabels = [
                        'Release:', 'Metacritic:', 'Version:', 'Size:', 'Languages:',
                        'Native Linux:', 'Wine/Proton:', 'Release Group:', 'RAWG Name:', 'RAWG ID:'
                    ];
                    // Remove any grid item that matches a label in removeLabels
                    Array.from(infoGrid.children).forEach(child => {
                        if (removeLabels.some(label => child.textContent.trim().startsWith(label))) {
                            child.remove();
                        }
                    });
                }

                // Modal logic (define these functions first)
                let currentScreenshotIndex = 0;
                const screenshots = game.screenshots || [];
                // const modal = document.getElementById('screenshotModal');
                // const modalImg = document.getElementById('screenshotModalImg');
                // const modalClose = document.getElementById('screenshotModalClose');
                // const modalPrev = document.getElementById('screenshotModalPrev');
                // const modalNext = document.getElementById('screenshotModalNext');

                function openModal(index) {
                    if (!screenshots.length) return;
                    currentScreenshotIndex = index;
                    modalImg.src = screenshots[currentScreenshotIndex];
                    modal.style.display = 'flex';
                }
                function closeModal() {
                    modal.style.display = 'none';
                }
                function showPrev() {
                    if (!screenshots.length) return;
                    currentScreenshotIndex = (currentScreenshotIndex - 1 + screenshots.length) % screenshots.length;
                    modalImg.src = screenshots[currentScreenshotIndex];
                }
                function showNext() {
                    if (!screenshots.length) return;
                    currentScreenshotIndex = (currentScreenshotIndex + 1) % screenshots.length;
                    modalImg.src = screenshots[currentScreenshotIndex];
                }

                // Populate Screenshots
                const detailScreenshotsContainer = document.getElementById('detailScreenshotsContainer');
                if (game.screenshots && game.screenshots.length > 0) {
                    game.screenshots.forEach(screenshot => {
                        const img = document.createElement('img');
                        img.src = screenshot;
                        img.alt = `Screenshot of ${game.name}`;
                        img.style.cursor = 'pointer';
                        detailScreenshotsContainer.appendChild(img);
                    });

                    // Attach click events to screenshots (now openModal is in scope)
                    const imgs = detailScreenshotsContainer.querySelectorAll('img');
                    imgs.forEach((img, idx) => {
                        img.addEventListener('click', () => openModal(idx));
                    });
                } else {
                    detailScreenshotsContainer.innerHTML = '<p style="color: #a0a0a0;">No screenshots available.</p>';
                }

                // Add the modal HTML to the DOM
                gameDetailContent.innerHTML += `
                    <div id="screenshotModal" class="screenshot-modal" style="display:none;">
                        <span class="screenshot-modal-close" id="screenshotModalClose">&times;</span>
                        <img class="screenshot-modal-img" id="screenshotModalImg" src="" alt="Screenshot">
                        <button class="screenshot-modal-arrow left" id="screenshotModalPrev">&#8592;</button>
                        <button class="screenshot-modal-arrow right" id="screenshotModalNext">&#8594;</button>
                    </div>
                `;

                // Now select the modal elements (after they exist in the DOM)
                const modal = document.getElementById('screenshotModal');
                const modalImg = document.getElementById('screenshotModalImg');
                const modalClose = document.getElementById('screenshotModalClose');
                const modalPrev = document.getElementById('screenshotModalPrev');
                const modalNext = document.getElementById('screenshotModalNext');

                // Modal controls
                modalClose && modalClose.addEventListener('click', closeModal);
                modalPrev && modalPrev.addEventListener('click', showPrev);
                modalNext && modalNext.addEventListener('click', showNext);
                modal && modal.addEventListener('click', e => {
                    if (e.target === modal) closeModal();
                });
                document.addEventListener('keydown', e => {
                    if (modal && modal.style.display === 'flex') {
                        if (e.key === 'ArrowLeft') showPrev();
                        if (e.key === 'ArrowRight') showNext();
                        if (e.key === 'Escape') closeModal();
                    }
                });
            } else {
                gameDetailContent.innerHTML = '<p style="color: red;">Game not found. Please check the ID or return to the <a href="index.html" style="color: #61dafb;">home page</a>.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading game data for detail page:', error);
            gameDetailContent.innerHTML = '<p style="color: red;">Failed to load game details. Please try again later.</p>';
        });
});