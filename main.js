document.addEventListener('DOMContentLoaded', () => {
    // ====== Existing Player Functionality ======
    console.log("Player functionality loaded.");

    // ====== Hamburger Menu Toggle ======
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // ====== Smooth Scrolling for Navigation Links ======
    const navAnchorLinks = document.querySelectorAll('.nav-links a');
    navAnchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                if (window.innerWidth < 768) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // ====== Intersection Observer for Section Animations ======
    const sections = document.querySelectorAll('.section');
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    sections.forEach(section => {
        observer.observe(section);
    });

    // ====== Additional Animations ======
    const playerCard = document.querySelector('.player-card');
    setTimeout(() => {
        playerCard.classList.add('visible');
    }, 300);
});

// ====== Player Functionality ======

document.addEventListener('DOMContentLoaded', () => {
    const reciterSelect = document.getElementById('reciterSelect');
    const chapterSelect = document.getElementById('chapterSelect');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const reciterImage = document.getElementById('reciterImage');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const volumeControl = document.getElementById('volumeControl');
    const speedControl = document.getElementById('speedControl');
    const surahTitle = document.getElementById('surahTitle');
    const reciterNameElem = document.getElementById('reciterName');

    let isPlaying = false;
    let currentSurah = null;
    let selectedReciter = '';
    let ayahsList = [];
    let currentAyahIndex = 0;

    // Fetch reciters from the API and populate the reciter select.
    async function fetchReciters() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/edition');
            const data = await response.json();
            const reciters = data.data.filter(edition => edition.format === 'audio');
            reciters.forEach(reciter => {
                const option = document.createElement('option');
                option.value = reciter.identifier;
                option.textContent = reciter.englishName;
                reciterSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching reciters:", error);
        }
    }

    // Fetch surahs from the API and populate the chapter select.
    async function fetchSurahs() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await response.json();
            data.data.forEach(surah => {
                const option = document.createElement('option');
                option.value = surah.number;
                option.textContent = `${surah.number} - ${surah.englishName}`;
                chapterSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching surahs:", error);
        }
    }

    // Load surah audio and play
    async function loadSurah(reciter, surah) {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/${reciter}`);
            const data = await response.json();
            if (data.code !== 200) {
                console.error("Error fetching surah data", data);
                alert("Recitation data not available for this reciter and surah.");
                return;
            }
            ayahsList = data.data.ayahs;
            currentAyahIndex = 0;
            audioPlayer.src = ayahsList[currentAyahIndex].audio;
            audioPlayer.play();
            isPlaying = true;
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        } catch (error) {
            console.error("Error loading surah:", error);
            alert("Error loading surah. Please try again later.");
        }
    }

    // Toggle Play/Pause.
    playPauseButton.addEventListener('click', () => {
        if (!selectedReciter) {
            alert("Please select a reciter first.");
            reciterSelect.focus();
            return;
        }
        if (currentSurah === null) {
            alert("Please select a surah first.");
            chapterSelect.focus();
            return;
        }
        if (isPlaying) {
            audioPlayer.pause();
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        } else {
            audioPlayer.play();
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        }
    });

    // Previous surah button.
    prevButton.addEventListener('click', () => {
        if (currentSurah && currentSurah > 1) {
            currentSurah--;
            chapterSelect.value = currentSurah;
            if (selectedReciter) loadSurah(selectedReciter, currentSurah);
        }
    });

    // Next surah button.
    nextButton.addEventListener('click', () => {
        if (currentSurah && currentSurah < 114) {
            currentSurah++;
            chapterSelect.value = currentSurah;
            if (selectedReciter) loadSurah(selectedReciter, currentSurah);
        }
    });

    // Auto-play next ayah or move to next surah.
    audioPlayer.addEventListener('ended', () => {
        if (currentAyahIndex < ayahsList.length - 1) {
            currentAyahIndex++;
            audioPlayer.src = ayahsList[currentAyahIndex].audio;
            audioPlayer.play();
        } else {
            if (currentSurah && currentSurah < 114) {
                currentSurah++;
                chapterSelect.value = currentSurah;
                loadSurah(selectedReciter, currentSurah);
            }
        }
    });

    // Update progress bar and time displays.
    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
            durationDisplay.textContent = formatTime(audioPlayer.duration);
        }
    });

    // Allow clicking on progress bar to seek.
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * audioPlayer.duration;
        audioPlayer.currentTime = newTime;
    });

    // Volume control.
    volumeControl.addEventListener('input', () => {
        audioPlayer.volume = volumeControl.value;
    });

    // Speed control.
    speedControl.addEventListener('change', () => {
        audioPlayer.playbackRate = speedControl.value;
    });

    // Update reciter when selected.
    reciterSelect.addEventListener('change', () => {
        selectedReciter = reciterSelect.value;
        if (currentSurah !== null) {
            loadSurah(selectedReciter, currentSurah);
        }
    });

    // Update surah when selected.
    chapterSelect.addEventListener('change', () => {
        currentSurah = parseInt(chapterSelect.value);
        if (currentSurah && selectedReciter) {
            loadSurah(selectedReciter, currentSurah);
        }
    });

    // Initialize the reciters and surahs lists.
    fetchReciters();
    fetchSurahs();

    // Utility: Format time in minutes:seconds.
    function formatTime(time) {
        const minutes = Math.floor(time / 60) || 0;
        const seconds = Math.floor(time % 60) || 0;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
});
