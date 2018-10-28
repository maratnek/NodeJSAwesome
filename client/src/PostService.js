import axios from 'axios';

const url = 'http://localhost:3000';

class PostService {
  // Get Posts
  static getPosts() {
    //console.log('get posts')
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.get(url);
        const data = res.data;
        console.log(data);
        resolve(data);
        // resolve(
        //   data.map(post => ({
        //     ...post
        //     //createdAt: new Date(post.createdAt)
        //   }))
        //)
      } catch(err) {
        reject(err);
      }
    });
  }
  // Next Posts
  static insertPost(text) {
    return axios.post(url, {
      text
    })
  }
}

export default PostService;
