import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './api-key';
import { throttle } from 'lodash';

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const btn = document.querySelector('#button');

const refs = {
  failureMessage:
    'Sorry, there are no images matching your search query. Please try again.',
  limitMessage: "We're sorry, but you've reached the end of search results.",
  emptyMessage: "The field can't be empty! Please type at least 1 character",
  errorRespMessage: 'Something went wrong!',
  page: 1,
  totalPages: 0,
  limit: 40,
  SCROLL_THROTTLE_INTERVAL: 300
};

let endOfPage = false;

const lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', handleSubmit);
btn.addEventListener('click', handleClick);

async function handleSubmit(e) {
  e.preventDefault();
    refs.page = 1;
    refs.totalPages = 0;
    endOfPage = false;
    gallery.textContent = '';

  let query = form.searchQuery.value.trim();



  if (query === '') {
       return Notiflix.Notify.failure(refs.emptyMessage);
  }
  try {
    const result = await fetchImages(query, refs.page, refs.limit);

    if (result.hits.length === 0) {
      return Notiflix.Notify.warning(refs.failureMessage);
    }

    refs.totalPages = Math.ceil(result.totalHits / refs.limit);

    renderMarkup(result.hits);

    let newLightbox = new SimpleLightbox('.gallery a');
    newLightbox.refresh();
    Notiflix.Notify.info(`Hooray! We found ${result.totalHits} images.`);
  } catch (error) {

    Notiflix.Notify.failure(refs.errorRespMessage);
  }
}

function renderMarkup(images) {
  const markup = images.reduce(
    (
      html,
      { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
    ) => {
      return (
        html +`
         <div class="photo-card">
         <a class="gallery__link" href="${largeImageURL}">
         <img src="${webformatURL}" alt="${tags}" width="300px" loading="lazy" />
         </a>
         <div class="info">
           <p class="info-item">
             <b>Likes</b>
             ${likes}
           </p>
           <p class="info-item">
             <b>Views</b>
            ${views}
           </p>
           <p class="info-item">
             <b>Comments</b>
            ${comments}
           </p>
           <p class="info-item">
             <b>Downloads</b>
            ${downloads}
           </p>
         </div>
       </div>`
      );
    },
    ''
  );

  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

const scrollHandler = throttle((e) => {
  handleButtonVisibility();
  loadMoreHandler(e);

},refs.SCROLL_THROTTLE_INTERVAL);

window.addEventListener('scroll',scrollHandler);

function limitNotify() {
  let distanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);

   if(!endOfPage && distanceToBottom < 200) {
    Notiflix.Notify.info(refs.limitMessage);
    endOfPage = true;
   }

}

function loadMoreHandler () {
    const distanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
     console.log(`document.documentElement.scrollHeight: ${document.documentElement.scrollHeight}`);
     console.log(`window.innerHeight: ${window.innerHeight}`);
     console.log(`window.scrollY: ${window.scrollY}`);
    if (distanceToBottom < 200) {

      if (refs.page < refs.totalPages) {
        refs.page += 1;

        fetchAndRenderImages();
      } else {
        if (!endOfPage) {
          limitNotify();
        }
      }
    }
  }


async function fetchAndRenderImages() {
  try {
    const result = await fetchImages(
      form.searchQuery.value,
      refs.page,
      refs.limit
    );
    renderMarkup(result.hits);
  } catch (error) {
    Notiflix.Notify.failure(refs.errorRespMessage);
  }
}


function handleButtonVisibility() {
  btn.classList.toggle('show', window.scrollY > 300);
}

function handleClick(e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
