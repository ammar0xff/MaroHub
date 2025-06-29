document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('gameGrid');
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const yearFilter = document.getElementById('yearFilter');
    const metacriticFilter = document.getElementById('metacriticFilter');
    const sortBy = document.getElementById('sortBy');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const gameCount = document.getElementById('gameCount');

    // NEW: Featured section containers
    const topRatedGamesContainer = document.getElementById('topRatedGamesContainer');
    const recentlyAddedGamesContainer = document.getElementById('recentlyAddedGamesContainer');

    let gamesData = [];
    let currentFilteredAndSortedGames = [];
    let currentSearchTerm = '';

    const gamesPerPage = 30;
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
        card.href = `game-detail.html?id=${game.uniqueId}`;
        card.tabIndex = 0; // Make focusable
        card.setAttribute('aria-label', `View details for ${game.name}`);

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
            gameCount.textContent = '0 games found.'; // Update game count
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

        // Update game count display
        gameCount.textContent = `${gamesToRender.length} game${gamesToRender.length !== 1 ? 's' : ''} found.`;
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

        // 3. Apply Year Filter
        const selectedYear = yearFilter.value;
        if (selectedYear !== 'all') {
            tempFilteredGames = tempFilteredGames.filter(game =>
                game.release_date && new Date(game.release_date).getFullYear().toString() === selectedYear
            );
        }

        // 4. Apply Metacritic Filter
        const minMetacritic = parseInt(metacriticFilter.value);
        if (!isNaN(minMetacritic)) {
            tempFilteredGames = tempFilteredGames.filter(game =>
                game.metacritic !== null && game.metacritic >= minMetacritic
            );
        }

        // 5. Apply Sorting
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

        // After applyFiltersAndSort()
        const activeFilters = document.getElementById('activeFilters');
        activeFilters.innerHTML = '';
        if (genreFilter.value !== 'all') {
            activeFilters.innerHTML += `<span class="filter-chip">Genre: ${genreFilter.options[genreFilter.selectedIndex].text}<span class="remove-chip" onclick="genreFilter.value='all';applyFiltersAndSort();">&times;</span></span>`;
        }
        if (yearFilter.value !== 'all') {
            activeFilters.innerHTML += `<span class="filter-chip">Year: ${yearFilter.options[yearFilter.selectedIndex].text}<span class="remove-chip" onclick="yearFilter.value='all';applyFiltersAndSort();">&times;</span></span>`;
        }
        if (metacriticFilter.value !== 'all') {
            activeFilters.innerHTML += `<span class="filter-chip">Metacritic: ${metacriticFilter.value}<span class="remove-chip" onclick="metacriticFilter.value='all';applyFiltersAndSort();">&times;</span></span>`;
        }
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

    // Show loading spinner
    loadingSpinner.style.display = 'block';

    // Fetch game data
    fetch('games.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            loadingSpinner.style.display = 'none';
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
            loadingSpinner.style.display = 'none';
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
    yearFilter.addEventListener('change', applyFiltersAndSort);
    metacriticFilter.addEventListener('change', applyFiltersAndSort);
    sortBy.addEventListener('change', applyFiltersAndSort);

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderGameCards(currentFilteredAndSortedGames, true); // Append more games
    });

    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        genreFilter.value = 'all';
        yearFilter.value = 'all';
        metacriticFilter.value = 'all';
        sortBy.value = 'name-asc';
        currentSearchTerm = '';
        applyFiltersAndSort();
    });

    const backToTopBtn = document.getElementById('backToTopBtn');
    window.addEventListener('scroll', () => {
        backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const navbarToggle = document.getElementById('navbarToggle');
    const navbarLinks = document.getElementById('navbarLinks');
    if (navbarToggle && navbarLinks) {
        navbarToggle.addEventListener('click', () => {
            navbarLinks.classList.toggle('open');
        });
    }

    // // Toggle dark/light mode
    // const themeToggleBtn = document.getElementById('themeToggleBtn');
    // themeToggleBtn.addEventListener('click', () => {
    //     document.body.classList.toggle('light-theme');
    //     themeToggleBtn.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
    //     localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    // });
    // // On load, set theme from localStorage
    // if (localStorage.getItem('theme') === 'light') {
    //     document.body.classList.add('light-theme');
    //     themeToggleBtn.textContent = '☀️';
    // }

    function setupCarouselArrows(trackId, leftBtnId, rightBtnId) {
        const track = document.getElementById(trackId);
        const leftBtn = document.getElementById(leftBtnId);
        const rightBtn = document.getElementById(rightBtnId);
        if (!track || !leftBtn || !rightBtn) return;

        // Hide arrows if not scrollable
        function updateArrowVisibility() {
            if (track.scrollWidth <= track.clientWidth + 5) {
                leftBtn.style.display = 'none';
                rightBtn.style.display = 'none';
            } else {
                leftBtn.style.display = '';
                rightBtn.style.display = '';
            }
        }
        updateArrowVisibility();
        window.addEventListener('resize', updateArrowVisibility);

        const scrollAmount = Math.max(track.clientWidth * 0.7, 240); // Scroll by most of the visible area

        leftBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        rightBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // Optional: Hide left arrow at start, right arrow at end
        function handleArrowState() {
            if (track.scrollLeft <= 5) {
                leftBtn.classList.add('disabled');
            } else {
                leftBtn.classList.remove('disabled');
            }
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
                rightBtn.classList.add('disabled');
            } else {
                rightBtn.classList.remove('disabled');
            }
        }
        track.addEventListener('scroll', handleArrowState);
        setTimeout(handleArrowState, 100);
    }

    // Improved auto-scroll: pauses on hover/focus, resumes on mouseleave/blur, and fills unused space with centering
    function autoScrollCarousel(trackId, interval = 3500) {
        const track = document.getElementById(trackId);
        if (!track) return;

        let autoScrollActive = true;
        let autoScrollTimer;

        function doAutoScroll() {
            if (!autoScrollActive) return;
            // If at end, scroll to start smoothly, else scroll right
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: Math.max(track.clientWidth * 0.7, 240), behavior: 'smooth' });
            }
        }

        function startAutoScroll() {
            autoScrollActive = true;
            if (autoScrollTimer) clearInterval(autoScrollTimer);
            autoScrollTimer = setInterval(doAutoScroll, interval);
        }
        function stopAutoScroll() {
            autoScrollActive = false;
            if (autoScrollTimer) clearInterval(autoScrollTimer);
        }

        // Pause on hover/focus, resume on leave/blur
        track.addEventListener('mouseenter', stopAutoScroll);
        track.addEventListener('mouseleave', startAutoScroll);
        track.addEventListener('focusin', stopAutoScroll);
        track.addEventListener('focusout', startAutoScroll);

        // Center cards if not enough to scroll
        function centerIfNeeded() {
            if (track.scrollWidth <= track.clientWidth + 5) {
                track.style.justifyContent = 'center';
            } else {
                track.style.justifyContent = '';
            }
        }
        window.addEventListener('resize', centerIfNeeded);
        setTimeout(centerIfNeeded, 100);

        startAutoScroll();
    }

    function autoScrollCarouselSmooth(trackId, speed = 0.6) { // speed in px per frame
        const track = document.getElementById(trackId);
        if (!track) return;

        let isPaused = false;

        function scrollStep() {
            if (!isPaused && track.scrollWidth > track.clientWidth + 5) {
                // If at (or near) end, jump to start for seamless loop
                if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
                    track.scrollLeft = 0;
                } else {
                    track.scrollLeft += speed;
                }
            }
            requestAnimationFrame(scrollStep);
        }

        // Pause on hover/focus, resume on leave/blur
        track.addEventListener('mouseenter', () => { isPaused = true; });
        track.addEventListener('mouseleave', () => { isPaused = false; });
        track.addEventListener('focusin', () => { isPaused = true; });
        track.addEventListener('focusout', () => { isPaused = false; });

        scrollStep();
    }

    setupCarouselArrows('topRatedGamesContainer', 'topRatedLeft', 'topRatedRight');
    setupCarouselArrows('recentlyAddedGamesContainer', 'recentlyAddedLeft', 'recentlyAddedRight');
    autoScrollCarouselSmooth('topRatedGamesContainer');
    autoScrollCarouselSmooth('recentlyAddedGamesContainer');

    // --- SETTINGS LOGIC ---
    let siteSettings = {
        siteMessage: "",
        cardSize: "medium",
        showRatings: true,
        featuredSection: "Top Rated",
        theme: "auto"
    };

    function applySiteSettings() {
        // 1. Show site message if set
        if (siteSettings.siteMessage) {
            let msgBar = document.getElementById('siteMessageBar');
            if (!msgBar) {
                msgBar = document.createElement('div');
                msgBar.id = 'siteMessageBar';
                msgBar.style.cssText = `
                    background: #1976d2;
                    color: #fff;
                    text-align: center;
                    padding: 14px 8px;
                    font-size: 1.15em;
                    font-weight: bold;
                    letter-spacing: 0.5px;
                    border-radius: 0 0 12px 12px;
                    margin-bottom: 10px;
                    z-index: 100;
                `;
                document.body.insertBefore(msgBar, document.body.firstChild);
            }
            msgBar.textContent = siteSettings.siteMessage;
            msgBar.style.display = 'block';
        } else {
            const msgBar = document.getElementById('siteMessageBar');
            if (msgBar) msgBar.style.display = 'none';
        }

        // 2. Card size (add class to .game-grid)
        const grid = document.getElementById('gameGrid');
        if (grid) {
            grid.classList.remove('card-size-small', 'card-size-medium', 'card-size-large');
            grid.classList.add('card-size-' + (siteSettings.cardSize || 'medium'));
        }

        // 3. Show/hide ratings
        document.body.classList.toggle('hide-ratings', !siteSettings.showRatings);

        // // 4. Featured section (scroll to or highlight)
        // if (siteSettings.featuredSection === "Top Rated") {
        //     document.querySelector('.featured-section')?.scrollIntoView({behavior: 'smooth'});
        // } else if (siteSettings.featuredSection === "Recently Added") {
        //     document.querySelectorAll('.featured-section')[1]?.scrollIntoView({behavior: 'smooth'});
        // }

        // 5. Theme
        if (siteSettings.theme === "dark") {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        } else if (siteSettings.theme === "light") {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.remove('light-theme', 'dark-theme');
        }
    }

    // --- LOAD SETTINGS.JSON ---
    fetch('settings.json')
        .then(res => res.ok ? res.json() : {})
        .then(settings => {
            siteSettings = Object.assign(siteSettings, settings);
            applySiteSettings();
        })
        .catch(() => {
            // No settings.json, use defaults
            applySiteSettings();
        });
});