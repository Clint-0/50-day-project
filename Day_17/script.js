// TMDB

const API_KEY = 'api_key=1cf50e6248dc270629e802686245c2c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;

const genres = [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    { "id": 16, "name": "Animation" },
    { "id": 35, "name": "Comedy" },
    { "id": 80, "name": "Crime" },
    { "id": 99, "name": "Documentary" },
    { "id": 18, "name": "Drama" },
    { "id": 10751, "name": "Family" },
    { "id": 14, "name": "Fantasy" },
    { "id": 36, "name": "History" },
    { "id": 27, "name": "Horror" },
    { "id": 10402, "name": "Music" },
    { "id": 9648, "name": "Mystery" },
    { "id": 10749, "name": "Romance" },
    { "id": 878, "name": "Science Fiction" },
    { "id": 10770, "name": "TV Movie" },
    { "id": 53, "name": "Thriller" },
    { "id": 10752, "name": "War" },
    { "id": 37, "name": "Western" }
];

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev');
const next = document.getElementById('next');
const current = document.getElementById('current');

let currentPage = 1;
let nextPage = 2;
let prevPage = 0;
let lastUrl = '';
let totalPages = 100;

let selectedGenre = [];

setGenre();
getMovies(API_URL);

// ---------- GENRE ----------
function setGenre() {
    tagsEl.innerHTML = '';

    genres.forEach(genre => {
        const t = document.createElement('div');
        t.classList.add('tag');
        t.id = genre.id;
        t.innerText = genre.name;

        t.addEventListener('click', () => {
            if (selectedGenre.includes(genre.id)) {
                selectedGenre = selectedGenre.filter(id => id !== genre.id);
            } else {
                selectedGenre.push(genre.id);
            }

            getMovies(API_URL + '&with_genres=' + selectedGenre.join(','));
            highlightSelection();
        });

        tagsEl.appendChild(t);
    });
}

function highlightSelection() {
    document.querySelectorAll('.tag').forEach(tag => {
        tag.classList.remove('highlight');
    });

    selectedGenre.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('highlight');
    });
}

// ---------- FETCH MOVIES ----------
function getMovies(url) {
    lastUrl = url;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.results.length !== 0) {
                showMovies(data.results);

                currentPage = data.page;
                nextPage = currentPage + 1;
                prevPage = currentPage - 1;
                totalPages = data.total_pages;

                current.innerText = currentPage;
            } else {
                main.innerHTML = `<h1>No Results Found</h1>`;
            }
        });
}

// ---------- SHOW MOVIES ----------
function showMovies(data) {
    main.innerHTML = '';

    data.forEach(movie => {
        const { title, poster_path, vote_average, overview, id } = movie;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');

        movieEl.innerHTML = `
            <img src="${IMG_URL + poster_path}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>
            <div class="overview">
                <h3>Overview</h3>
                ${overview}
                <br/>
                <button class="know-more" id="${id}">Know More</button>
            </div>
        `;

        main.appendChild(movieEl);

        document.getElementById(id).addEventListener('click', () => {
            openNav(movie);
        });
    });
}

// ---------- OVERLAY ----------
const overlayContent = document.getElementById('overlay-content');

function openNav(movie) {
    fetch(BASE_URL + '/movie/' + movie.id + '/videos?' + API_KEY)
        .then(res => res.json())
        .then(videoData => {
            document.getElementById("myNav").style.width = "100%";

            if (videoData.results.length > 0) {
                let embed = [];

                videoData.results.forEach(video => {
                    if (video.site === 'YouTube') {
                        embed.push(`
                            <iframe 
                                src="https://www.youtube.com/embed/${video.key}" 
                                class="embed show"
                                allowfullscreen>
                            </iframe>
                        `);
                    }
                });

                overlayContent.innerHTML = `
                    <h1>${movie.original_title}</h1>
                    ${embed.join('')}
                `;
            } else {
                overlayContent.innerHTML = `<h1>No Results Found</h1>`;
            }
        });
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

// ---------- COLOR ----------
function getColor(vote) {
    if (vote >= 8) return 'green';
    if (vote >= 5) return 'orange';
    return 'red';
}

// ---------- SEARCH ----------
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;

    if (searchTerm) {
        getMovies(searchURL + '&query=' + searchTerm);
    } else {
        getMovies(API_URL);
    }
});