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
            // Add uniqueId for lookup, similar to how it's done in script.js
            const gamesDataWithIds = data.map((game, index) => ({ ...game, uniqueId: index }));
            const game = gamesDataWithIds.find(g => g.uniqueId === parseInt(gameId));

            if (game) {
                document.getElementById('pageTitle').textContent = game.name + ' Details'; // Update page title

                gameDetailContent.innerHTML = `
                    <div class="detail-header">
                        <img src="${game.background_image || game.thumbnail || 'https://via.placeholder.com/900x300?text=Game+Background'}" alt="${game.name} Background" class="background-image">
                        <h1>${game.name}</h1>
                    </div>

                    <img src="${game.thumbnail || 'https://via.placeholder.com/300x180?text=No+Image'}" alt="${game.name}" class="detail-thumbnail">

                    <div class="detail-info-section">
                        <h2>Game Information</h2>
                        <p><strong>Release Date:</strong> ${game.release_date || 'N/A'}</p>
                        <p><strong>Metacritic:</strong> ${game.metacritic !== null ? game.metacritic : 'N/A'}</p>
                        <p><strong>Genres:</strong> ${game.genres.join(', ') || 'N/A'}</p>
                        <p><strong>Platform Type:</strong> ${game.platform_type || 'N/A'}</p>
                        ${game.developers && game.developers.length > 0 ? `<p><strong>Developers:</strong> ${game.developers.join(', ')}</p>` : ''}
                        ${game.publishers && game.publishers.length > 0 ? `<p><strong>Publishers:</strong> ${game.publishers.join(', ')}</p>` : ''}
                        <p><strong>Size:</strong> ${game.size || 'N/A'}</p>
                        <p><strong>Version:</strong> ${game.version || 'N/A'}</p>
                        <p><strong>Release Group:</strong> ${game.release_group || 'N/A'}</p>
                        <p><strong>Languages:</strong> ${game.languages_info || 'N/A'}</p>
                        <p><strong>Native Linux Torrent:</strong> ${game.is_native_linux_torrent ? 'Yes' : 'No'}</p>
                        <p><strong>Wine/Proton Bottled:</strong> ${game.is_wine_bottled_torrent ? 'Yes' : 'No'}</p>
                        <p><strong>Original Torrent Name:</strong> ${game.original_torrent_name || 'N/A'}</p>
                        <p><strong>Cleaned Search Name:</strong> ${game.cleaned_search_name || 'N/A'}</p>
                        <p><strong>Other Tags:</strong> ${game.other_torrent_tags && game.other_torrent_tags.length > 0 ? game.other_torrent_tags.join(', ') : 'None'}</p>
                    </div>

                    <div class="detail-section detail-platforms">
                        <h3>Available Platforms & Requirements:</h3>
                        <ul id="detailPlatformsList"></ul>
                    </div>

                    <div class="detail-section detail-description">
                        <h3>Description:</h3>
                        <p>${game.description ? game.description.replace(/\n/g, '<br>') : 'No description available.'}</p>
                    </div>

                    <div class="detail-section detail-screenshots">
                        <h3>Screenshots:</h3>
                        <div id="detailScreenshotsContainer" class="detail-screenshots-container"></div>
                    </div>

                    <div class="detail-section detail-magnet">
                        <a href="${game.magnet || '#'}" target="_blank" class="detail-magnet-link" ${!game.magnet ? 'style="display:none;"' : ''}>Download via Magnet Link</a>
                    </div>
                `;

                // Populate Platforms & Requirements
                const detailPlatformsList = document.getElementById('detailPlatformsList');
                if (game.platforms && game.platforms.length > 0) {
                    game.platforms.forEach(platform => {
                        const li = document.createElement('li');
                        let reqHtml = `<strong>Platform:</strong> ${platform.name || 'Unknown'}<br>`;
                        if (platform.requirements) {
                            if (platform.requirements.minimum && platform.requirements.minimum !== 'N/A') {
                                reqHtml += `<strong>Minimum:</strong> ${platform.requirements.minimum.replace(/\n/g, ' | ')}<br>`;
                            }
                            if (platform.requirements.recommended && platform.requirements.recommended !== 'N/A') {
                                reqHtml += `<strong>Recommended:</strong> ${platform.requirements.recommended.replace(/\n/g, ' | ')}`;
                            }
                        }
                        li.innerHTML = reqHtml;
                        detailPlatformsList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'No platform requirements available.';
                    detailPlatformsList.appendChild(li);
                }

                // Populate Screenshots
                const detailScreenshotsContainer = document.getElementById('detailScreenshotsContainer');
                if (game.screenshots && game.screenshots.length > 0) {
                    game.screenshots.forEach(screenshot => {
                        const img = document.createElement('img');
                        img.src = screenshot;
                        img.alt = `Screenshot of ${game.name}`;
                        detailScreenshotsContainer.appendChild(img);
                    });
                } else {
                    detailScreenshotsContainer.innerHTML = '<p style="color: #a0a0a0;">No screenshots available.</p>';
                }

            } else {
                gameDetailContent.innerHTML = '<p style="color: red;">Game not found. Please check the ID or return to the <a href="index.html" style="color: #61dafb;">home page</a>.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading game data for detail page:', error);
            gameDetailContent.innerHTML = '<p style="color: red;">Failed to load game details. Please try again later.</p>';
        });
});