const API_KEY = "04c35731a5ee918f014970082a0088b1"
const getByID = "https://api.themoviedb.org/3/movie/"
const params = new URLSearchParams(window.location.search)
const root = document.getElementById("root")

// Sticky Navbar
document.addEventListener("DOMContentLoaded", function(){
  window.addEventListener('scroll', function() {
    (window.scrollY > 50) ?  $('.navbar').addClass('navbar-light bg-light') : $('.navbar').removeClass('navbar-light bg-light');
  });
});

// Function to get query parameter by name
const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Function to load JSON file
const loadJSON = async (file) => {
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(`Failed to load ${file}: ${response.statusText}`);
  }
  return await response.json();
};

// Function to format date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-EN', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Function to open modal and set iframe source
const openModal = (videoUrl) => {
  $('#trailerIframe').attr('src', videoUrl);
  $('#trailerModal').modal('show');
};

// Fetch movie data and render the content
const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.statusText}`);
  }
  return await response.json();
};

// Main function to get the movie details and display trailer
const getMovieDetails = async () => {
  const movieId = getQueryParam('id');
  const root = document.getElementById('root');
  let trailerUrl = null;
  
  const data = await loadJSON('trailer_data.json');
  // Iterate over the array to find the trailer link
  for (const movie of data) {
    if (movie[movieId]) {
      trailerUrl = movie[movieId];
      break;
    }
  }

  if (!movieId) {
    root.innerText = 'Movie ID not found in query string.';
    return;
  }

  try {
    const movie = await fetchData(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
    if (!movie.status_code) {
      const content = `
        <div class="col-md-4 detail__poster">
          <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
        </div>
        <div class="col-md-8 content">
          <dl class="row" style="margin-bottom: 0;">
            <dt class="col-md-3">Genre</dt>
            <dd class="col-md-9">${movie.genres.map(genre => genre.name).join(", ")}</dd>

            <dt class="col-md-3">IMDb</dt>
            <dd class="col-md-9">${movie.vote_average.toFixed(1)} / 10 from ${movie.vote_count} users</dd>

            <dt class="col-md-3">Published</dt>
            <dd class="col-md-9">${formatDate(movie.release_date)}</dd>

            <dt class="col-md-3">Durasi</dt>
            <dd class="col-md-9">${movie.runtime} Minutes</dd>
          </dl>

          <h3>Synopsis</h3>
          <p>${movie.overview}</p>
          
          <div class="d-flex justify-content-between">
            <div>
              <button id="watchBtn" class="btn btn-dark">Watching free</button>
              <button id="trailerBtn" class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#trailerModal">Trailer</button>
            </div>
            <a class="btn btn-light" href="index.html">
              <i class="bi bi-arrow-left-circle-fill"></i>
              Back
            </a>
          </div>
        </div>
      `;
      root.innerHTML = content;
      
      // Add event listener to the trailer button
      document.getElementById('trailerBtn').addEventListener('click', () => openModal(trailerUrl));

      // Add event listener to the watch button
      document.getElementById('watchBtn').addEventListener('click', () => {
        $('#confirmModal').modal('show');
      });

      // Add event listener to the confirm button in the modal
      document.getElementById('confirmBtn').addEventListener('click', () => {
        $('#confirmModal').modal('hide');
        const query = `lk21 ${movie.title}`;
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      });
    }
  } catch (error) {
    root.innerText = `Error: ${error.message}`;
  }
};

// Run the main function on page load
window.addEventListener('load', getMovieDetails);

// Close the modal and stop the video when the modal is hidden
$('#trailerModal').on('hidden.bs.modal', function () {
  $('#trailerIframe').attr('src', '');
});
