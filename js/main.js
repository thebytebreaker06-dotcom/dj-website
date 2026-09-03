/* ==========================================================================
   MOBILE NAV TOGGLE
   Selects the hamburger button and the nav links list, and toggles
   a CSS class on click to show/hide the menu on small screens.
   ========================================================================== */

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('nav-links--open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
}

/* ==========================================================================
   MUSIC PAGE — LIVE SEARCH
   Filters mixtape cards as the user types, matching against the
   title and genre tag. Only runs if these elements exist on the page.
   ========================================================================== */

const searchInput = document.querySelector('.search-input');
const mixCards = document.querySelectorAll('.mix-card');
const noResults = document.querySelector('.no-results');

if (searchInput && mixCards.length) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    mixCards.forEach((card) => {
      const title = card.querySelector('.mix-title').textContent.toLowerCase();
      const tag = card.querySelector('.mix-tag').textContent.toLowerCase();
      const matches = title.includes(query) || tag.includes(query);

      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    if (noResults) {
      noResults.hidden = visibleCount > 0;
    }
  });
}

/* ==========================================================================
   GALLERY LIGHTBOX
   Clicking a photo opens an enlarged overlay. Closes via the X button,
   clicking the dark backdrop, or pressing Escape.
   ========================================================================== */

const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.querySelector('.lightbox');
const lightboxMedia = document.querySelector('.lightbox-media');
const lightboxClose = document.querySelector('.lightbox-close');

if (galleryItems.length && lightbox) {

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const colorClass = [...item.classList].find((cls) =>
        cls.startsWith('gallery-item--')
      );

      lightboxMedia.className = 'lightbox-media ' + colorClass;
      lightboxMedia.textContent = item.querySelector('.gallery-label').textContent;
      lightbox.hidden = false;
    });
  });

  lightboxClose.addEventListener('click', () => {
    lightbox.hidden = true;
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.hidden = true;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightbox.hidden = true;
    }
  });

}

/* ==========================================================================
   AUDIO PREVIEW PLAYER + NOW PLAYING BAR
   Lets visitors play/pause a mixtape preview on the page, with a
   persistent bottom bar showing title, current time, duration,
   a seek bar to jump to any point in the track, and mute control.
   ========================================================================== */

const playButtons = document.querySelectorAll('.play-btn, .play-btn-small');
const audioPlayer = new Audio();
let currentPlayButton = null;

const nowPlaying = document.querySelector('.now-playing');
const nowPlayingTitle = document.querySelector('.now-playing-title');
const nowPlayingToggle = document.querySelector('.now-playing-toggle');
const nowPlayingSeek = document.querySelector('.now-playing-seek');
const nowPlayingCurrent = document.querySelector('.now-playing-current');
const nowPlayingDuration = document.querySelector('.now-playing-duration');
const nowPlayingMute = document.querySelector('.now-playing-mute');

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function resetPlayButton(btn) {
  btn.textContent = '▶ Play';
  btn.classList.remove('is-playing');
}

function startTrack(btn) {
  if (currentPlayButton && currentPlayButton !== btn) {
    resetPlayButton(currentPlayButton);
  }

  audioPlayer.src = btn.dataset.audio;
  audioPlayer.play();
  btn.textContent = '⏸ Pause';
  btn.classList.add('is-playing');
  currentPlayButton = btn;

  if (nowPlaying) {
    nowPlayingTitle.textContent = btn.dataset.title || 'Now playing';
    nowPlaying.hidden = false;
    nowPlayingToggle.textContent = '⏸';
    document.body.classList.add('player-active');
  }
}

function pauseTrack() {
  audioPlayer.pause();
  if (currentPlayButton) {
    resetPlayButton(currentPlayButton);
  }
  if (nowPlayingToggle) {
    nowPlayingToggle.textContent = '▶';
  }
}

if (playButtons.length) {
  playButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isThisTrackPlaying = currentPlayButton === btn && !audioPlayer.paused;

      if (isThisTrackPlaying) {
        pauseTrack();
        currentPlayButton = null;
      } else {
        startTrack(btn);
      }
    });
  });
}

if (nowPlayingToggle) {
  nowPlayingToggle.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      nowPlayingToggle.textContent = '⏸';
      if (currentPlayButton) {
        currentPlayButton.textContent = '⏸ Pause';
        currentPlayButton.classList.add('is-playing');
      }
    } else {
      pauseTrack();
    }
  });
}

audioPlayer.addEventListener('loadedmetadata', () => {
  if (nowPlayingSeek) {
    nowPlayingSeek.max = audioPlayer.duration;
  }
  if (nowPlayingDuration) {
    nowPlayingDuration.textContent = formatTime(audioPlayer.duration);
  }
});

audioPlayer.addEventListener('timeupdate', () => {
  if (nowPlayingSeek) {
    nowPlayingSeek.value = audioPlayer.currentTime;
  }
  if (nowPlayingCurrent) {
    nowPlayingCurrent.textContent = formatTime(audioPlayer.currentTime);
  }
});

if (nowPlayingSeek) {
  nowPlayingSeek.addEventListener('input', () => {
    audioPlayer.currentTime = nowPlayingSeek.value;
  });
}

// Mute toggle: flips audioPlayer.muted and swaps the speaker icon to match
if (nowPlayingMute) {
  nowPlayingMute.addEventListener('click', () => {
    audioPlayer.muted = !audioPlayer.muted;
    nowPlayingMute.textContent = audioPlayer.muted ? '🔇' : '🔊';
  });
}

audioPlayer.addEventListener('ended', () => {
  if (currentPlayButton) {
    resetPlayButton(currentPlayButton);
    currentPlayButton = null;
  }
  if (nowPlayingToggle) {
    nowPlayingToggle.textContent = '▶';
  }
});