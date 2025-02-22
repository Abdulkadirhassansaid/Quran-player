document.addEventListener('DOMContentLoaded', () => {
    // ====== Existing Player Functionality ======
    // (Insert your existing player code: fetchReciters, fetchSurahs, loadSurah, etc.)
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
          // Close hamburger menu on mobile
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
    // Example: Fade in player card on load
    const playerCard = document.querySelector('.player-card');
    setTimeout(() => {
      playerCard.classList.add('visible');
    }, 300);
  
    // Note: Integrate your existing player functionality below.
  });
  

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
    let currentSurah = null; // Set when a surah is selected.
    let selectedReciter = '';
    let ayahsList = [];      // Holds the list of ayahs for the current surah.
    let currentAyahIndex = 0; // Index of the current ayah in the surah.
  
    // Mapping by reciter identifier (exactly as returned by the API)
    const reciterImagesById = {
      "ar.abdulbasitmurattal": "https://static.qurancdn.com/images/reciters/1/abdelbasset-profile.jpeg?v=1",
      "ar.basfar": "https://www.assabile.com/media/person/200x256/abdullah-ibn-ali-basfar.png",
      "ar.sudais": "https://www.islamicity.org/wp-content/plugins/blueprint-timthumb/timthumb.php?src=http://media.islamicity.org/wp-content/uploads/2019/06/abdul-rahman-al-sudais-81.jpg&w=350&h=350",
      "ar.abdulsamad": "https://tvquran.com/uploads/authors/images/%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D8%B5%D9%85%D8%AF.jpg",
      "ar.abu_bakr": "https://tvquran.com/uploads/authors/images/%D8%B4%D9%8A%D8%AE%20%D8%A3%D8%A8%D9%88%20%D8%A8%D9%83%D8%B1%20%D8%A7%D9%84%D8%B4%D8%A7%D8%B7%D8%B1%D9%8A.jpg",
      "ar.ahmed_ibn_ajamy": "https://www.assabile.com/media/photo/full_size/ahmed-al-ajmi-979.jpg",
      "ar.alafasy": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxSGk8deGrsn8hgFws8CbsPTajVlxy2WRBow&s",
      "ar.hani_rifai": "https://www.assabile.com/media/person/280x219/hani-ar-rifai.png",
      "ar.husary": "https://i1.sndcdn.com/artworks-000534797073-h1ykj2-t500x500.jpg",
      "ar.husary_mujawad": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvBtulT4xmSCMZvIzKlw5SB7zswEoCr7U7eA&s",
      "ar.hudhaify": "https://i1.sndcdn.com/artworks-000534229386-xs1xvf-t500x500.jpg",
      "ar.ibrahim_akhdar": "https://play-lh.googleusercontent.com/xfnPk2KOpZ-aSUBIHA8hXvUdnHmpIEMOmXhgF_Es4wGQMmhwDvdD2OOwce54vNciRcI",
      // Note: API returns Maher Al Mueqly as "ar.maheralmueaqly"
      "ar.maheralmueaqly": "https://www.assabile.com/media/person/280x219/maher-al-mueaqly.png",
      "ar.minshawi": "https://static.qurancdn.com/images/reciters/7/mohamed-siddiq-el-minshawi-profile.jpeg?v=1",
      "ar.minshawi_mujawwad": "https://upload.wikimedia.org/wikipedia/commons/e/ee/Elminshwey.jpg",
      "ar.muhammadayub": "https://upload.wikimedia.org/wikipedia/en/4/40/Muhammad_Ayyub.jpeg",
      "ar.muhammedjibreel": "https://www.assabile.com/media/person/280x219/muhammad-jebril.png",
      "ar.shuraim": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5wlLMnUjBqPOEB1cX5YJOV5tllpy8pODdeA&s",
      "ar.ibrahim_walk": "https://cachedimages.podchaser.com/512x512/aHR0cHM6Ly9hcnR3b3JrLm11c2xpbWNlbnRyYWwuY29tL3dpc2FtLXNoYXJpZWZmLmpwZw%3D%3D/aHR0cHM6Ly93d3cucG9kY2hhc2VyLmNvbS9pbWFnZXMvbWlzc2luZy1pbWFnZS5wbmc%3D",
      "ar.fooladvand": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGH1ijeYWSxsNC8rUPTlfjh_Y2kaUv--7Vkg&s",
      "ar.parhigzar": "https://i1.sndcdn.com/artworks-000044325674-oqhift-t500x500.jpg",
      "ar.shamshadali_khan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYAMDKt2TEabY64_vUNrLg_IF06MiSr89IKA&s"
    };
  
    // Fallback mapping keyed by reciter English name.
    const reciterImagesByName = {
      "Abdul Basit": "https://static.qurancdn.com/images/reciters/1/abdelbasset-profile.jpeg?v=1",
      "Abdulahi Basfar": "https://www.assabile.com/media/person/200x256/abdullah-ibn-ali-basfar.png",
      "Abdurrahmaan As-Sudais": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKIp14DblfE36nO5arR3rWf_mXJbODNCi1lu2MwIXLipY01KPhMroBERWRBI2x_RVmDB8&usqp=CAU",
      "Abdul Samad": "https://tvquran.com/uploads/authors/images/%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D8%B5%D9%85%D8%AF.jpg",
      "Abu Bakr Ash-Shaatree": "https://tvquran.com/uploads/authors/images/%D8%B4%D9%8A%D8%AE%20%D8%A3%D8%A8%D9%88%20%D8%A8%D9%83%D8%B1%20%D8%A7%D9%84%D8%B4%D8%A7%D8%B7%D8%B1%D9%8A.jpg",
      "Ahmed ibn Ali al-Ajamy": "https://www.assabile.com/media/photo/full_size/ahmed-al-ajmi-979.jpg",
      "Alafasy": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxSGk8deGrsn8hgFws8CbsPTajVlxy2WRBow&s",
      "Hani Rifai": "https://www.assabile.com/media/person/280x219/hani-ar-rifai.png",
      "Husary": "https://i1.sndcdn.com/artworks-000534797073-h1ykj2-t500x500.jpg",
      "Husary (Mujawwad)": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvBtulT4xmSCMZvIzKlw5SB7zswEoCr7U7eA&s",
      "Hudhaify": "https://i1.sndcdn.com/artworks-000534229386-xs1xvf-t500x500.jpg",
      "Ibrahim Akhdar": "https://play-lh.googleusercontent.com/xfnPk2KOpZ-aSUBIHA8hXvUdnHmpIEMOmXhgF_Es4wGQMmhwDvdD2OOwce54vNciRcI",
      "Maher Al Muaiqly": "https://www.assabile.com/media/person/280x219/maher-al-mueaqly.png",
      "Minshawi": "https://static.qurancdn.com/images/reciters/7/mohamed-siddiq-el-minshawi-profile.jpeg?v=1",
      "Minshawy Mujawwad": "https://upload.wikimedia.org/wikipedia/commons/e/ee/Elminshwey.jpg",
      "Muhammad Ayyoub": "https://upload.wikimedia.org/wikipedia/en/4/40/Muhammad_Ayyub.jpeg",
      "Muhammad Jibreel": "https://www.assabile.com/media/person/280x219/muhammad-jebril.png",
      "Saood bin Ibraaheem Ash-Shuraym": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5wlLMnUjBqPOEB1cX5YJOV5tllpy8pODdeA&s",
      "Ibrahim Walk": "https://cachedimages.podchaser.com/512x512/aHR0cHM6Ly9hcnR3b3JrLm11c2xpbWNlbnRyYWwuY29tL3dpc2FtLXNoYXJpZWZmLmpwZw%3D%3D/aHR0cHM6Ly93d3cucG9kY2hhc2VyLmNvbS9pbWFnZXMvbWlzc2luZy1pbWFnZS5wbmc%3D",
      "Fooladvand - Hedayatfar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGH1ijeYWSxsNC8rUPTlfjh_Y2kaUv--7Vkg&s",
      "Parhizgar": "https://i1.sndcdn.com/artworks-000044325674-oqhift-t500x500.jpg",
      "Shamshad Ali Khan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYAMDKt2TEabY64_vUNrLg_IF06MiSr89IKA&s",
      "Ayman Sowaid": "https://placehold.co/600x400/orange/white"
    };
  
    // Helper: Get reciter cover image URL using identifier first, then reciter name.
    function getReciterCover(reciterId, reciterText) {
      return reciterImagesById[reciterId] || reciterImagesByName[reciterText.trim()] || "https://source.unsplash.com/featured/?quran";
    }
  
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
        // Optionally auto-select the first reciter.
        if (reciterSelect.options.length > 1) {
          reciterSelect.selectedIndex = 1;
          selectedReciter = reciterSelect.value;
          const cover = getReciterCover(selectedReciter, reciterSelect.options[reciterSelect.selectedIndex].textContent);
          reciterImage.src = cover;
          reciterNameElem.textContent = reciterSelect.options[reciterSelect.selectedIndex].textContent;
        }
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
  
    // Utility: Format time in minutes:seconds.
    function formatTime(time) {
      const minutes = Math.floor(time / 60) || 0;
      const seconds = Math.floor(time % 60) || 0;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  
    // Load surah audio, store all ayahs, update UI, then play.
    async function loadSurah(reciter, surah) {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/${reciter}`);
        const data = await response.json();
        if (data.code !== 200) {
          console.error("Error fetching surah data", data);
          alert("Error: Recitation data is not available for this reciter and surah.");
          return;
        }
        ayahsList = data.data.ayahs;
        currentAyahIndex = 0;
        audioPlayer.src = ayahsList[currentAyahIndex].audio;
        audioPlayer.play();
        isPlaying = true;
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        reciterImage.classList.add('playing');
  
        // Update UI: cover image (using helper), surah title, and reciter name.
        reciterImage.src = getReciterCover(reciter, reciterSelect.options[reciterSelect.selectedIndex].textContent);
        surahTitle.textContent = chapterSelect.options[chapterSelect.selectedIndex]?.textContent || `Surah ${surah}`;
        reciterNameElem.textContent = reciterSelect.options[reciterSelect.selectedIndex]?.textContent || 'Reciter';
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
        reciterImage.classList.remove('playing');
      } else {
        audioPlayer.play();
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
        reciterImage.classList.add('playing');
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
      const cover = getReciterCover(selectedReciter, reciterSelect.options[reciterSelect.selectedIndex].textContent);
      reciterImage.src = cover;
      reciterNameElem.textContent = reciterSelect.options[reciterSelect.selectedIndex]?.textContent || 'Reciter';
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
  });
