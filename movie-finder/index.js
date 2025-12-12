const OMDB_API_KEY = "f4001646";

const searchForm  = document.getElementById("searchForm");
const queryInput  = document.getElementById("queryInput");
const searchBtn   = document.getElementById("searchBtn");
const errorBox    = document.getElementById("errorBox");
const movieBlock  = document.getElementById("movieResult");

const posterEl    = document.getElementById("moviePoster");
const titleEl     = document.getElementById("movieTitle");
const yearEl      = document.getElementById("movieYear");
const genreEl     = document.getElementById("movieGenre");
const ratingEl    = document.getElementById("movieRating");
const plotEl      = document.getElementById("moviePlot");
const actorsEl    = document.getElementById("movieActors");
const trailerBtn  = document.getElementById("trailerBtn");


async function fetchMovie(title) {
  const url =
    "https://www.omdbapi.com/?t=" +
    encodeURIComponent(title) +
    "&plot=full&apikey=" +
    OMDB_API_KEY;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Network error");
  }
  const data = await res.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Movie not found");
  }
  return data;
}

function clearError() {
  errorBox.style.display = "none";
  errorBox.textContent = "";
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = "block";
}

// Fill UI with movie data
function renderMovie(movie) {
  const posterUrl =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x450?text=No+Image";

  posterEl.src = posterUrl;
  posterEl.alt = movie.Title + " poster";

  titleEl.textContent = movie.Title;
  yearEl.textContent = `${movie.Year} · ${movie.Runtime || ""}`;
  genreEl.textContent = movie.Genre || "";
  ratingEl.textContent =
    movie.imdbRating && movie.imdbRating !== "N/A"
      ? `IMDb: ${movie.imdbRating}/10`
      : "IMDb rating: N/A";

  plotEl.textContent = movie.Plot || "No plot available.";
  actorsEl.textContent = movie.Actors || "No cast information.";

  // Trailer button -> YouTube search for "<Title> trailer"
  trailerBtn.onclick = () => {
    const q = encodeURIComponent(movie.Title + " trailer");
    const url = "https://www.youtube.com/results?search_query=" + q;
    window.open(url, "_blank");
  };

  movieBlock.style.display = "block";
}

// Handle form submit
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = queryInput.value.trim();
  if (!title) return;

  clearError();
  searchBtn.disabled = true;

  try {
    const movie = await fetchMovie(title);
    renderMovie(movie);
  } catch (err) {
    movieBlock.style.display = "none";
    showError(err.message || "Something went wrong");
  } finally {
    searchBtn.disabled = false;
  }
});
