document.addEventListener('DOMContentLoaded', () => {
    const gameDetailContent = document.getElementById('gameDetailContent');
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id'); // Get the uniqueId from the URL

    if (gameId === null) {
        gameDetailContent.innerHTML = '<p style="color: red;">No game ID provided. Please return to the <a href="index.html" style="color: #61dafb;">home page</a>.</p>';
        return;
    }

    fetch('data/games.json')
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
                document.getElementById('pageTitle').textContent = game.name + ' Details';

                // Determine if background and thumbnail are the same
                const bgImage = game.background_image || game.thumbnail || 'https://via.placeholder.com/900x300?text=Game+Background';
                const thumbImage = game.thumbnail || 'https://via.placeholder.com/300x180?text=No+Image';
                const showThumbnail = bgImage !== thumbImage;

                // --- UPGRADE: Hide N/A/false, better order, screenshots in rows ---
                function showField(label, value) {
                    if (value === false || value === 'N/A' || value === 'n/a' || value === null || value === undefined || value === '' || value === 'None') return '';
                    return `<li><strong>${label}:</strong> ${value}</li>`;
                }

                // --- IMPROVED LAYOUT & GALLERY ---
                gameDetailContent.innerHTML = `
                    <div class="detail-header">
                        <img src="${bgImage}" alt="${game.name} Background" class="background-image detail-fade-in">
                        <h1 class="detail-title">${game.name}</h1>
                    </div>
                    <div class="detail-main-flex">
                        <aside class="detail-main-left detail-fade-in">
                            ${showThumbnail ? `<img src="${thumbImage}" alt="${game.name}" class="detail-thumbnail">` : ''}
                            <div class="detail-section detail-specs">
                                <h3>Game Info</h3>
                                <ul class="specs-list">
                                    ${showField('Release', game.release_date)}
                                    ${showField('Version', game.version)}
                                    ${showField('Size', game.size)}
                                    ${showField('Languages', game.languages_info)}
                                    ${game.is_native_linux_torrent ? '<li><strong>Native Linux:</strong> Yes</li>' : ''}
                                    ${game.is_wine_bottled_torrent ? '<li><strong>Wine/Proton:</strong> Yes</li>' : ''}
                                    ${showField('Metacritic', game.metacritic !== null ? game.metacritic : null)}
                                    ${showField('Release Group', game.release_group)}
                                </ul>
                            </div>
                            <div class="detail-section detail-sysreq">
                                <h3>PC Requirements</h3>
                                <ul id="detailPlatformsList" class="sysreq-list"></ul>
                            </div>
                            <div class="detail-tags">
                                ${(game.genres||[]).map(g => `<span class="detail-tag">${g}</span>`).join('')}
                                ${(game.platforms||[]).map(p => `<span class="detail-tag platform">${p.name}</span>`).join('')}
                            </div>
                        </aside>
                        <section class="detail-main-right detail-fade-in">
                            <div class="detail-section detail-gallery">
                                <h3>Screenshots</h3>
                                <div id="detailScreenshotsContainer" class="detail-screenshots-gallery"></div>
                            </div>
                            <div class="detail-section detail-description">
                                <h3>Description</h3>
                                <p>${game.description ? game.description.replace(/\n/g, '<br>') : 'No description available.'}</p>
                            </div>
                            <div class="detail-section detail-torrent">
                                <h3>Torrent Info</h3>
                                ${showField('Original Name', game.original_torrent_name)}
                                ${showField('Cleaned Name', game.cleaned_search_name)}
                                ${(game.other_torrent_tags && game.other_torrent_tags.length > 0) ? `<div><strong>Other Tags:</strong> ${game.other_torrent_tags.join(', ')}</div>` : ''}
                                ${showField('RAWG Name', game.rawg_name)}
                                ${showField('RAWG ID', game.rawg_id)}
                            </div>
                            <a href="${game.magnet || '#'}" target="_blank" class="detail-magnet-link prominent-download fullwidth-download" ${!game.magnet ? 'style=\"display:none;\"' : ''}>⬇️ Download Magnet</a>
                        </section>
                    </div>
                `;

                // Organize and display PC requirements in a simple, readable way

                const detailPlatformsList = document.getElementById('detailPlatformsList');
                const pcPlatform = game.platforms && game.platforms.find(p => p.name && p.name.toLowerCase() === 'pc');
                if (pcPlatform && pcPlatform.requirements && pcPlatform.requirements.minimum) {
                    function styledSysReqText(reqString) {
                        let text = reqString
                            .replace(/<[^>]+>/g, '') // Remove HTML tags
                            .replace(/\s*[\r\n]+\s*/g, '\n') // Normalize newlines
                            .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
                            .replace(/^\s+|\s+$/g, ''); // Trim

                        // Remove duplicate "Minimum:" at the start
                        text = text.replace(/^(Minimum:)\s*/i, '');

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
                        text = text.replace(/(?<!\n)\b(OS:|Processor:|Memory:|Graphics:|DirectX:|Storage:|Hard Drive:|Sound:|Additional Notes:)/g, '\n$1');

                        // Only show allowed keys
                        const allowedKeys = ['OS', 'Processor', 'Memory', 'Graphics', 'DirectX', 'Storage', 'Hard Drive', 'Sound', 'Additional Notes'];
                        return text.split('\n').filter(line => {
                            const key = line.split(':')[0].trim();
                            return allowedKeys.includes(key);
                        }).map(line => {
                            const key = line.split(':')[0].trim();
                            const value = line.split(':').slice(1).join(':').trim();
                            let icon = '';
                            switch(key) {
                                case 'OS': icon = '💻'; break;
                                case 'Processor': icon = '🧠'; break;
                                case 'Memory': icon = '🧮'; break;
                                case 'Graphics': icon = '🎮'; break;
                                case 'DirectX': icon = '🅧'; break;
                                case 'Storage': case 'Hard Drive': icon = '💾'; break;
                                case 'Sound': icon = '🔊'; break;
                                case 'Additional Notes': icon = '📝'; break;
                                default: icon = '•';
                            }
                            return `<span class=\"sysreq-line\"><span class=\"sysreq-icon\">${icon}</span> <span class=\"sysreq-key\">${key}:</span><br><span class=\"sysreq-value\">${value}</span></span>`;
                        }).join('');
                    }

                    let html = '<div class="sysreq-row">';
                    html += `
                        <div class="sysreq-block" style="text-align:left;">
                            <span class="sysreq-label">Minimum:</span>
                            <div class="sysreq-text">${styledSysReqText(pcPlatform.requirements.minimum)}</div>
                        </div>
                    `;
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

                // Populate Screenshots (gallery)
                const detailScreenshotsContainer = document.getElementById('detailScreenshotsContainer');
                if (game.screenshots && game.screenshots.length > 0) {
                    detailScreenshotsContainer.style.display = 'flex';
                    detailScreenshotsContainer.style.flexWrap = 'wrap';
                    detailScreenshotsContainer.style.gap = '1.2em';
                    detailScreenshotsContainer.style.justifyContent = 'flex-start';
                    game.screenshots.forEach((screenshot, idx) => {
                        const imgWrap = document.createElement('div');
                        imgWrap.style.flex = '1 1 220px';
                        imgWrap.style.maxWidth = '320px';
                        imgWrap.style.minWidth = '180px';
                        imgWrap.style.display = 'flex';
                        imgWrap.style.justifyContent = 'center';
                        imgWrap.style.alignItems = 'center';
                        imgWrap.style.background = 'rgba(34,37,43,0.85)';
                        imgWrap.style.borderRadius = '10px';
                        imgWrap.style.boxShadow = '0 2px 12px rgba(97,218,251,0.08)';
                        imgWrap.style.overflow = 'hidden';
                        imgWrap.style.cursor = 'pointer';
                        imgWrap.style.transition = 'transform 0.18s';
                        imgWrap.onmouseover = () => imgWrap.style.transform = 'scale(1.04)';
                        imgWrap.onmouseout = () => imgWrap.style.transform = '';
                        const img = document.createElement('img');
                        img.src = screenshot;
                        img.alt = `Screenshot of ${game.name}`;
                        img.style.width = '100%';
                        img.style.height = 'auto';
                        img.style.maxHeight = '180px';
                        img.style.borderRadius = '8px';
                        img.style.objectFit = 'cover';
                        img.style.display = 'block';
                        imgWrap.appendChild(img);
                        imgWrap.addEventListener('click', () => openModal(idx));
                        detailScreenshotsContainer.appendChild(imgWrap);
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