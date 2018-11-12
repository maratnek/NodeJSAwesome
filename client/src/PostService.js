import axios from 'axios';

const url = 'api';

class PostService {
  // Get Posts
  static getPosts(params) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(params);

        console.log(url);
        const res = await axios.get(url, {
          params: {
            min_stars: params.min_stars,
          }

        });
        const data = res.data;
        resolve(data);
      } catch(err) {
        reject(err);
      }
    });
  }
}

export default PostService;
