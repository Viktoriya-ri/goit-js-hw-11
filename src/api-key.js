import axios from "axios";
axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '38855360-cf284d31c2faf9da0308ab4d1';

axios.defaults.baseURL = 'https://pixabay.com/api/';

async function fetchImages (searchQuery,page,limit) {

    const response =  await axios(`?key=${KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${limit}`);
    return response.data;

  }
export {fetchImages};