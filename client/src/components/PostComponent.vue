<template>
  <div class="container">
    <h1>Awesome Modules</h1>
    <hr>
    <h2>Download Modules</h2>
    <!-- {{packages}} -->
    <!-- {{posts}} -->
    <p class="error" v-if="error">{{error}}</p>
    <ul class="package-container">
      <li class="package" v-for="(packages, index) in data">
        <h3>{{packages.name}}</h3>
        <div class="" v-for="(pack, index) in packages.list">
          <h3>Type: {{pack.type}}</h3>
          <div class="" v-if="pack.type == 'link'">
            <div class="card">
              <h5>{{pack.name}}</h5>
              <span v-if="pack.property && pack.property.star">{{pack.property.star}}</span>
              <span v-if="pack.property && pack.property.date">{{getDate(pack.property.date)}}</span>
              <span><a href="pack.link">Link</a></span>
            </div>
          </div>
          <div class="" v-else-if="pack.type == 'list'">
            <h6>{{pack.name}}</h6>
            <div class="" v-for="(pack,index) in pack.list">
              <div class="card">
                <h5>{{pack.name}}</h5>
                <span v-if="pack.property && pack.property.star">{{pack.property.star}}</span>
                <span v-if="pack.property && pack.property.date">{{getDate(pack.property.date)}}</span>
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

export default {
  name: 'PostComponent',
  data() {
    return {
      posts: '',
      error: '',
      text: 'hello',
      obj: [],
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
      this.posts = await PostService.getPosts();
      // console.log('post');
      // console.log(this.posts);
      this.data = this.posts.packages;
    } catch (err) {
      this.error = err.message;
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
  /* display: inline-block; */
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
