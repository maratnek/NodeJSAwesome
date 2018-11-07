import axios from 'axios';

const url = 'http://localhost:3000';

// import VueRouter from 'vue-router'
// const router = new VueRouter({
//   mode: 'history',
// //   base: __dirname,
//   routes: [
//     { path: '/:id' },
//   ]
// })

class PostService {
  // Get Posts
  static getPosts(params) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(params);
        const res = await axios.get(url, {
          params: {
            min_stars: params.min_stars,
          }
        });
        const data = res.data;
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
  // static insertPost(text) {
  //   return axios.post(url, {
  //     text
  //   })
  // }
}

export default PostService;
