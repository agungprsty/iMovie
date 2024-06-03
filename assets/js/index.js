const API_KEY = "04c35731a5ee918f014970082a0088b1";
const DISCOVER_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const resetBtn = document.getElementById('resetBtn');
let currentPage = 1;
let searchQuery = '';

// Sticky Navbar
document.addEventListener("DOMContentLoaded", function(){
  window.addEventListener('scroll', function() {
    (window.scrollY > 50) ?  $('.navbar').addClass('navbar-light bg-light') : $('.navbar').removeClass('navbar-light bg-light');
  });
});

// Function to fetch movies from the API
async function fetchMovies(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return []; // Return empty array in case of error
  }
}

// Function to render movie cards
function renderMovieCards(movies) {
  const rootElement = document.getElementById('root');
  // Clear previous content if not loading more
  if (currentPage === 1) {
    rootElement.innerHTML = '';
  }

  // Check if movies array is empty
  if (movies.length === 0) {
    rootElement.innerHTML = '<p>No movies found</p>';
    return;
  }
  
  const screenWidth = window.innerWidth;
  let numCols;
  
  // Determine number of columns based on screen width
  if (screenWidth >= 1200) {
    numCols = 5;
  } else if (screenWidth >= 992) {
    numCols = 4;
  } else {
    numCols = 3; // Minimum 2 columns for smaller screens
  }
  
  // Calculate column width
  const colWidth = 100 / numCols;
  
  // Render movie cards
  movies.forEach(movie => {
    // Limit title to maximum 40 characters
    let title = movie.title;
    if (title.length > 60) {
      title = title.substring(0, 60) + '...';
    }

    // Format vote_average to one decimal place
    const voteAverage = movie.vote_average.toFixed(1);

    // Card Section
    const movieCardHTML = `
    <div class="col-md-2 mt-1 mb-1" style="width: ${colWidth}%">
      <div class="card position-relative">
        <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
          <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" class="card-img-top" alt="${movie.title}" onerror="this.onerror=null; this.src='assets/img/not_found.jpg';">
        </div>
        <a href="detail.html?id=${movie.id}" class="stretched-link"></a>
        <div class="position-absolute top-0 start-0 p-1" style="background-color: rgba(0, 0, 0, 0.5);">
          <span class="start">&#9733;</span>
          <span class="rating">${voteAverage}</span>
        </div>
        <div class="card-content">
          <div class="card-content__header">
            <p class="card-content__title">${title}</p>
          </div>
        </div>
      </div>
    </div>`;
      
    rootElement.insertAdjacentHTML('beforeend', movieCardHTML);
  });
}

// Function to handle search form submission
function handleSearch(event) {
  event.preventDefault();
  const query = document.getElementById('searchInput').value.trim();
  if (query === '') return; // Do nothing if query is empty
  resetBtn.style.display = 'inline-block';
  searchQuery = query;
  const searchUrl = SEARCH_URL + encodeURIComponent(query);
  fetchMovies(searchUrl)
    .then(movies => {
      renderMovieCards(movies);
      const queryString = `?query=${encodeURIComponent(query)}`;
      history.pushState(null, '', window.location.pathname + queryString);
    })
    .catch(error => console.error("Error searching movies:", error));
}

// Function to handle "Load More" button click
function handleLoadMore() {
  currentPage++;
  let nextPageUrl;
  if (searchQuery !== '') {
    nextPageUrl = `${SEARCH_URL}${encodeURIComponent(searchQuery)}&page=${currentPage}`;
  } else {
    nextPageUrl = `${DISCOVER_URL}&page=${currentPage}`;
  }
  fetchMovies(nextPageUrl)
    .then(renderMovieCards)
    .catch(error => console.error("Error fetching more movies:", error));
}

// Function to reset search query
function handleResetQuery() {
  resetBtn.style.display = 'none';
  searchQuery = ''; // Menghapus query pencarian
  window.location.search = ''; // Menghapus query string dari URL dan memuat ulang halaman
}

// Initial render
fetchMovies(DISCOVER_URL).then(renderMovieCards);

// Update movie cards on window resize
window.addEventListener('resize', function() {
  // Re-render movie cards with the same data
  fetchMovies(DISCOVER_URL).then(renderMovieCards);
});

// Add event listener to search form
document.getElementById('searchForm').addEventListener('submit', handleSearch);

// Add event listener to "Load More" button
document.getElementById('loadMoreBtn').addEventListener('click', handleLoadMore);

// Add event listener to reset button
document.getElementById('resetBtn').addEventListener('click', handleResetQuery);
