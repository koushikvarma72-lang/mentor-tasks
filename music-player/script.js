// script.js

// Playlist
const tracks = [
  {
    title: "takthom",
    artist: "Sample Artist",
    src: "music/track1.mp3",
    cover: "https://lh3.googleusercontent.com/Y8B0rU_z6hNGUb-4jAk0K5hzVdzjshqKtXsimNTof_XMAxUGfDlvIscEeUPM8CzioDpifx_ti1UxzB4r=w544-h544-l90-rj",
    durationText: "04:14"
  },
  {
    title: "Calm Breeze",
    artist: "Sample Artist",
    src: "music/track2.mp3",
    cover: "https://lh3.googleusercontent.com/4sQ36N6fvLAP_j00nl_ezslgAjXKBQ0eF8kLzlztWlYjrIfWOwhbAz2o55UYzNsBYcI42-agpqID73O5=w544-h544-l90-rj",
    durationText: "02:53"
  },
  {
    title: "The Return of Gambheera",
    artist: "Sample Artist",
    src: "music/track3.mp3",
    cover: "https://lh3.googleusercontent.com/tF-4_kur4Td_PAY5Lu8gm3xB_8Pr3EYYi5bBbkgz-Kx4rN0ZB9m2rVFQle7zSyn3QXU2H9QlULXUpTX7=w544-h544-l90-rj",
    durationText: "05:26"
  },
  {
    title: "Late Night Drive",
    artist: "Sample Artist",
    src: "music/track4.mp3",
    cover: "covers/track4.jpg",
    durationText: "04:39"
  },
  {
    title: "Sunset Acoustic",
    artist: "Sample Artist",
    src: "music/track5.mp3",
    cover: "covers/track5.jpg",
    durationText: "05:53"
  }
];

// Elements
const audio = document.getElementById("audio");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const coverEl = document.getElementById("cover");

const playBtn = document.getElementById("play-btn");
const playLabel = document.getElementById("play-label");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

const muteBtn = document.getElementById("mute-btn");
const volumeSlider = document.getElementById("volume");

const queueList = document.getElementById("queue-list");

let currentIndex = 0;
let isPlaying = false;

// Helpers
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Load track info into player
function loadTrack(index) {
  currentIndex = index;
  const track = tracks[index];

  audio.src = track.src;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  coverEl.src = track.cover;

  // Active item in queue
  [...queueList.children].forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });

  // Reset UI
  progress.value = 0;
  currentTimeEl.textContent = "00:00";
  durationEl.textContent = track.durationText || "00:00";
}

// Render queue list
function renderQueue() {
  tracks.forEach((t, index) => {
    const item = document.createElement("div");
    item.className = "queue-item";
    item.innerHTML = `
      <img src="${t.cover}" alt="">
      <div>
        <div class="queue-item-title">${t.title}</div>
        <div class="queue-item-artist">${t.artist}</div>
      </div>
      <span class="queue-item-duration">${t.durationText}</span>
    `;
    item.addEventListener("click", () => {
      loadTrack(index);
      playTrack();
    });
    queueList.appendChild(item);
  });
}

// Playback controls
function playTrack() {
  audio.play();
  isPlaying = true;
  playLabel.textContent = "Pause";
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  playLabel.textContent = "Play";
}

function togglePlay() {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
}

function playPrev() {
  const next = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(next);
  playTrack();
}

function playNext() {
  const next = (currentIndex + 1) % tracks.length;
  loadTrack(next);
  playTrack();
}

// Progress bar updates
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.value = percent;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

// Seek when moving progress slider
progress.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progress.value / 100) * audio.duration;
});

// Auto next when track ends
audio.addEventListener("ended", playNext);

// Volume + mute
// audio.volume is 0.0–1.0
audio.volume = volumeSlider.value / 100;

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value / 100; // [0,1][web:67][web:79]
  if (audio.volume === 0) {
    audio.muted = true;
    muteBtn.textContent = "🔇";
  } else {
    audio.muted = false;
    muteBtn.textContent = "🔊";
  }
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted; // toggle mute[web:77][web:81]
  if (audio.muted) {
    muteBtn.textContent = "🔇";
  } else {
    muteBtn.textContent = "🔊";
  }
});

// Button bindings
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", playPrev);
nextBtn.addEventListener("click", playNext);

// Keyboard shortcuts: Space play/pause, ← prev, → next
document.addEventListener("keydown", (e) => {
  // Avoid when typing in inputs
  const tag = e.target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return;

  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  } else if (e.code === "ArrowLeft") {
    playPrev();
  } else if (e.code === "ArrowRight") {
    playNext();
  }
});

// Init
renderQueue();
loadTrack(0);
