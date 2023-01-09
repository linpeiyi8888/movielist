const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const MOVIES_PER_PAGE = 12;
const paginator = document.querySelector("#paginator");
let filteredMovies = [];
const changeMode = document.querySelector("#change-mode");
let currentPage = 1;

function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
      <div class="col-sm-3">
          <div class="mt-2 mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${
                  item.id
                }">⭐</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
          <ul class="list-group mb-3">
            <li class="list-group-item d-flex justify-content-between">${item.title}
              <div>
                <button
                  class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">⭐</button>
              </div>
           </li>
         </ul>
        `;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    console.log(data);
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img
        src="${POSTER_URL + data.image}"
        alt="movie-poster"
        class="img-fuid"
      >`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經加入清單!");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function changeDisplayMode(nowMode) {
  if ((dataPanel.dataset.mode = nowMode)) return;
  dataPanel.dataset.mode = nowMode;
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie"))
    showMovieModal(Number(event.target.dataset.id));
  else if (event.target.matches(".btn-add-favorite"))
    addToFavorite(Number(event.target.dataset.id));
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字 : ${keyword} 沒有符合條件的電影`);
  }
  renderMovieList(getMovieByPage(currentPage));
  renderPaginator(filteredMovies.length);
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;

  const page = Number(event.target.dataset.page);
  currentPage = page;
  renderMovieList(getMovieByPage(currentPage));
});

changeMode.addEventListener("click", function onChangeModeClicked(event) {
  if (event.target.matches(".display-card")) {
    changeDisplayMode("card-mode");
    renderMovieList(getMovieByPage(currentPage));
  } else if (event.target.matches(".display-list")) {
    changeDisplayMode("list-mode");
    renderMovieList(getMovieByPage(currentPage));
  }
});

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results); // 用...展開陣列元素
  renderMovieList(getMovieByPage(currentPage));
  renderPaginator(movies.length);
});
