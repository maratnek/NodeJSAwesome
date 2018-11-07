<template>
  <div class="container">
    <h1>Awesome Modules</h1>
    <hr>
    <h2>Download Modules</h2>
    <!-- {{packages}} -->
    <!-- {{posts}} -->
    <p class="error" v-if="error">{{error}}</p>
    <div class="pages">
      <!-- <span v-for="ind in pages"> {{ind}}</span> -->
      <button v-for="ind in pages" v-on:click="changePage(ind)"> {{ind}}</button>
    </div>
    <ul class="package-container">
      <li class="package" v-for="(packages, index) in data">
        <h3>{{packages.name}}</h3>
        <div class="" v-for="(pack, index) in packages.list">
          <!-- <h3>Type: {{pack.type}}</h3> -->
          <div class="" v-if="pack.type == 'link'">
            <div class="card">
              <h5>{{pack.name}}</h5>
              <span v-if="pack.property && pack.property.star">Star: {{pack.property.star}}</span>
              <span v-if="pack.property && pack.property.date">Date: {{getDate(pack.property.date)}}</span>
              <span><a href="pack.link">Link</a></span>
            </div>
          </div>
          <div class="" v-else-if="pack.type == 'list'">
            <h4>{{pack.name}}</h4>
            <div class="" v-for="(pack,index) in pack.list">
              <div class="card">
                <h5>{{pack.name}}</h5>
                <span v-if="pack.property && pack.property.star">Star: {{pack.property.star}}</span>
                <span v-if="pack.property && pack.property.date">Date: {{getDate(pack.property.date)}}</span>
                <span><a href="pack.link">Link</a></span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import PostService from '../PostService';
import VueRouter from 'vue-router'
const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    // { path: '/', component: App },
  ]
})

export default {
  name: 'PostComponent',
  data() {
    return {
      posts: '',
      error: '',
      text: 'hello',
      pages: [],
      data: [],
      getDate: (date) => {
        let d = new Date(date);
        let option = { year: 'numeric', month: 'short', day: 'numeric' };
        return d.toLocaleDateString('en-US', option);
      },
    }
  },
  async created() {
    //console.log('created');
    try {
      console.log(router);
      this.posts = await PostService.getPosts();
      // console.log('post');
      console.log(this.posts);
      this.pages = this.posts.length;
      this.data = this.posts[0];
    } catch (err) {
      this.error = err.message;
    }
  },
  methods: {
    changePage: function (index) {
      if (index)
        this.data = this.posts[index - 1];
      // this.message = this.message.split('').reverse().join('')
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
  text-decoration: none;
  border: 1px solid #42b983;
  padding: 5px 15px;
  border-radius: 4px;
}

.card {
  border-left: 13px solid #555;
  padding: 10px;
  margin-bottom: 20px;
  display: grid;
}

.card h5 {
  text-transform: uppercase;
  grid-template-columns: 1fr;
}

.card span {
  margin: 20px;
}
</style>
