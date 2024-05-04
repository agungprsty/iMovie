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

function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-EN', options);
}

if (params.has("id")) {
  const id = params.get("id")
  const URL = `${getByID}${id}?api_key=${API_KEY}`

  // Fetch json data from URL
  async function fetchData(URL) {
    try {
      const data = await fetch(URL).then((res) => res.json())
      return data
    } catch (error) {
      console.log(error.message)
      return null
    }
  }

  fetchData(URL).then(data => {
    if (!data.status_code) {
      const movie = data
      const content = `
            <div class="col-md-4 detail__poster">
              <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" class="img-fluid" alt="${movie.title}">
            </div>
            <div class="col-md-8 content">
              <h1 class="text-center mb-3">${movie.title}</h1>
              <dl class="row">
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
              <div class="d-flex justify-content-end">
                <a class="btn btn-light" href="index.html">
                  <i class="bi bi-arrow-left-circle-fill"></i>
                  Back
                </a>
              </div>
            </div>
      `
      root.innerHTML = content
    } else {
      root.innerHTML = `<h1 class="text-center" style="
        display:flex;
        justify-content: center;
        align-items: center;
        height:20vh">Movie not found</h1>`
    }
  })
}
