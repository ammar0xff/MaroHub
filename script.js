document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('gameGrid');
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const platformFilter = document.getElementById('platformFilter');
    const yearFilter = document.getElementById('yearFilter');
    const metacriticFilter = document.getElementById('metacriticFilter');
    const sortBy = document.getElementById('sortBy');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    // NEW: Featured section containers
    const topRatedGamesContainer = document.getElementById('topRatedGamesContainer');
    const recentlyAddedGamesContainer = document.getElementById('recentlyAddedGamesContainer');

    let gamesData = [];
    let currentFilteredAndSortedGames = [];
    let currentSearchTerm = '';

    const gamesPerPage = 50;
    let currentPage = 1;

    // Debounce function
    let searchTimeout;
    const debounce = (func, delay) => {
        return function(...args) {
            const context = this;
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // Reusable function to create a game card element
    const createGameCardElement = (game) => {
        const card = document.createElement('a');
        card.classList.add('game-card');
        card.href = `game-detail.html?id=${game.uniqueId}`; // Link to detail page

        const imageUrl = game.thumbnail || game.background_image || 'https://via.placeholder.com/300x180?text=No+Image';

        card.innerHTML = `
            <img src="${imageUrl}" alt="${game.name}" loading="lazy">
            <div class="game-card-info">
                <h2>${game.name}</h2>
                <p><strong>Genre:</strong> ${game.genres.join(', ') || 'N/A'}</p>
                <p><strong>Platform:</strong> ${game.platform_type || 'N/A'}</p>
                <p><strong>Metacritic:</strong> ${game.metacritic !== null ? game.metacritic : 'N/A'}</p>
            </div>
        `;
        return card;
    };

    // Function to render game cards (main grid)
    const renderGameCards = (gamesToRender, append = false) => {
        if (!append) {
            gameGrid.innerHTML = ''; // Clear only if not appending
        }

        const startIndex = append ? gameGrid.children.length : 0;
        const endIndex = Math.min(startIndex + gamesPerPage, gamesToRender.length);

        if (gamesToRender.length === 0 && !append) { // Only show message if no results and not just appending more
            gameGrid.innerHTML = '<p style="color: #a0b0c0; text-align: center; width: 100%; padding: 40px;">No games found matching your criteria. Try adjusting your filters or search term.</p>';
            loadMoreBtn.style.display = 'none'; // Hide button if no games
            return;
        }

        for (let i = startIndex; i < endIndex; i++) {
            const game = gamesToRender[i];
            gameGrid.appendChild(createGameCardElement(game));
        }

        // Update load more button visibility
        if (gameGrid.children.length < gamesToRender.length) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `Load More Games (${gameGrid.children.length} / ${gamesToRender.length})`;
            loadMoreBtn.disabled = false;
        } else {
            loadMoreBtn.style.display = 'none'; // Hide button if all games are loaded
        }
    };

    // NEW: Function to render featured sections (horizontal)
    const renderFeaturedSection = (containerElement, games, limit = 10) => {
        containerElement.innerHTML = ''; // Clear previous content
        const gamesToShow = games.slice(0, limit); // Take top N games

        if (gamesToShow.length === 0) {
            containerElement.innerHTML = '<p style="color: #b0b0b0; padding-left: 10px;">No games available in this section.</p>';
            return;
        }

        gamesToShow.forEach(game => {
            const card = createGameCardElement(game);
            // Add a class specific to horizontal cards if needed for different styling
            card.classList.add('game-card-horizontal');
            containerElement.appendChild(card);
        });
    };

    // Function to populate filter dropdowns dynamically
    const populateFilters = (data) => {
        const genres = new Set();
        const platforms = new Set();
        const years = new Set();

        data.forEach(game => {
            game.genres.forEach(genre => genres.add(genre));
            game.platforms.forEach(platform => platforms.add(platform.name));
            if (game.release_date) {
                const year = new Date(game.release_date).getFullYear();
                if (!isNaN(year)) {
                    years.add(year.toString());
                }
            }
        });

        genreFilter.innerHTML = '<option value="all">All Genres</option>';
        Array.from(genres).sort().forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.toLowerCase();
            option.textContent = genre;
            genreFilter.appendChild(option);
        });

        platformFilter.innerHTML = '<option value="all">All Platforms</option>';
        Array.from(platforms).sort().forEach(platform => {
            const option = document.createElement('option');
            option.value = platform.toLowerCase();
            option.textContent = platform;
            platformFilter.appendChild(option);
        });

        yearFilter.innerHTML = '<option value="all">All Years</option>';
        Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)).forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    };

    // Main function to apply all filters and sorting, then render
    const applyFiltersAndSort = () => {
        currentPage = 1; // Reset to first page when filters/sort/search changes
        let tempFilteredGames = gamesData;

        // 1. Apply Search Filter
        if (currentSearchTerm) {
            const searchTermLower = currentSearchTerm.toLowerCase();
            tempFilteredGames = tempFilteredGames.filter(game => {
                const nameMatch = game.name.toLowerCase().includes(searchTermLower);
                const genreMatch = game.genres.some(genre => genre.toLowerCase().includes(searchTermLower));
                const platformTypeMatch = game.platform_type.toLowerCase().includes(searchTermLower);
                const originalNameMatch = (game.original_torrent_name || '').toLowerCase().includes(searchTermLower);
                const cleanedSearchNameMatch = (game.cleaned_search_name || '').toLowerCase().includes(searchTermLower);
                return nameMatch || genreMatch || platformTypeMatch || originalNameMatch || cleanedSearchNameMatch;
            });
        }

        // 2. Apply Genre Filter
        const selectedGenre = genreFilter.value;
        if (selectedGenre !== 'all') {
            tempFilteredGames = tempFilteredGames.filter(game =>
                game.genres.some(genre => genre.toLowerCase() === selectedGenre)
            );
        }

        // 3. Apply Platform Filter
        const selectedPlatform = platformFilter.value;
        if (selectedPlatform !== 'all') {
            tempFilteredGames = tempFilteredGames.filter(game =>
                game.platforms.some(platform => platform.name.toLowerCase() === selectedPlatform)
            );
        }

        // 4. Apply Year Filter
        const selectedYear = yearFilter.value;
        if (selectedYear !== 'all') {
            tempFilteredGames = tempFilteredGames.filter(game =>
                game.release_date && new Date(game.release_date).getFullYear().toString() === selectedYear
            );
        }

        // 5. Apply Metacritic Filter
        const minMetacritic = parseInt(metacriticFilter.value);
        if (!isNaN(minMetacritic)) {
            tempFilteredGames = tempFilteredGames.filter(game =>
                game.metacritic !== null && game.metacritic >= minMetacritic
            );
        }

        // 6. Apply Sorting
        const sortValue = sortBy.value;
        tempFilteredGames.sort((a, b) => {
            if (sortValue === 'name-asc') {
                return a.name.localeCompare(b.name);
            } else if (sortValue === 'name-desc') {
                return b.name.localeCompare(a.name);
            } else if (sortValue === 'release_date-desc') {
                const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
                const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
                return dateB - dateA;
            } else if (sortValue === 'release_date-asc') {
                const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
                const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
                return dateA - dateB;
            } else if (sortValue === 'metacritic-desc') {
                // Sort higher metacritic first, N/A (null) at the end
                const metaA = a.metacritic !== null ? a.metacritic : -Infinity;
                const metaB = b.metacritic !== null ? b.metacritic : -Infinity;
                return metaB - metaA;
            } else if (sortValue === 'metacritic-asc') {
                // Sort lower metacritic first, N/A (null) at the end
                const metaA = a.metacritic !== null ? a.metacritic : Infinity;
                const metaB = b.metacritic !== null ? b.metacritic : Infinity;
                return metaA - metaB;
            }
            return 0;
        });

        currentFilteredAndSortedGames = tempFilteredGames; // Store the result
        renderGameCards(currentFilteredAndSortedGames); // Render the first page
    };


    // Function to initialize featured sections
    const initializeFeaturedSections = () => {
        // Top Rated Games: Sort by metacritic (highest first), filter out nulls, take top 15
        const topRatedGames = gamesData
            .filter(game => game.metacritic !== null)
            .sort((a, b) => b.metacritic - a.metacritic)
            .slice(0, 15); // Show top 15
        renderFeaturedSection(topRatedGamesContainer, topRatedGames);

        // Recently Added Games: Sort by uniqueId (which should represent order of addition if from original JSON), take top 15
        // Or, if release_date is a good indicator of "recently added" from your data, use that:
        const recentlyAddedGames = gamesData
            .filter(game => game.release_date) // Ensure a release date exists
            .sort((a, b) => {
                const dateA = new Date(a.release_date).getTime();
                const dateB = new Date(b.release_date).getTime();
                return dateB - dateA; // Newest first
            })
            .slice(0, 15); // Show newest 15
        renderFeaturedSection(recentlyAddedGamesContainer, recentlyAddedGames);
    };

    // Fetch game data
    fetch('games.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            gamesData = data.map((game, index) => ({
                ...game,
                uniqueId: index, // Assign a unique ID for simple identification
                genres: game.genres || [],
                platforms: (game.platforms || []).map(p => ({ name: p.name || 'Unknown' }))
            }));

            // Populate filters and render main grid
            populateFilters(gamesData);
            applyFiltersAndSort(); // Initial render of main grid

            // Initialize featured sections after data is loaded and processed
            initializeFeaturedSections();
        })
        .catch(error => {
            console.error('Error loading game data:', error);
            gameGrid.innerHTML = '<p style="color: red; text-align: center; width: 100%;">Failed to load games data. Please check your games.json file and ensure your server is running.</p>';
            loadMoreBtn.style.display = 'none';
        });

    // Event listeners
    searchInput.addEventListener('input', debounce((event) => {
        currentSearchTerm = event.target.value;
        applyFiltersAndSort();
    }, 300));

    genreFilter.addEventListener('change', applyFiltersAndSort);
    platformFilter.addEventListener('change', applyFiltersAndSort);
    yearFilter.addEventListener('change', applyFiltersAndSort);
    metacriticFilter.addEventListener('change', applyFiltersAndSort);
    sortBy.addEventListener('change', applyFiltersAndSort);

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderGameCards(currentFilteredAndSortedGames, true); // Append more games
    });
});