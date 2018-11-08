<template> <!-- <router-view></router-view> -->
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
        <div class="pack" v-for="(pack, index) in packages.list">
          <!-- <h3>Type: {{pack.type}}</h3> -->
          <div class="" v-if="pack.type == 'link'">
            <div class="card">
              <h5>{{pack.name}}</h5>
              <span v-if="pack.property && pack.property.star">Star: {{pack.property.star}}</span>
              <span v-if="pack.property && pack.property.date">Date: {{getDate(pack.property.date)}}</span>
              <span class="link"><a href="pack.link">Link</a></span>
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
      this.posts = await PostService.getPosts(this.$route.query);
      // console.log('post');
      // console.log(this.posts);
      this.pages = this.posts.length;
      this.data = this.posts[0];
      console.log(this.data);
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
h3 {
  margin: 40px 0 0;
  font-size: 2.5em;
  margin-bottom: 10px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  /* display: inline-block; */
  margin: 0 10px;
  border-right: 10px solid #555;
  /* padding: 10px; */
  /* margin-bottom: 40px; */
  max-width: 300px;
  margin: 10px auto;
}
a {
  color: #42b983;
  text-decoration: none;
  border: 1px solid #42b983;
  padding: 5px 15px;
  border-radius: 4px;
}

.pack {
  border-left: 3px solid #555;
  border-top: 3px solid #555;
  border-bottom: 3px solid #555;
  /* padding: 10px; */
  margin: auto;
  margin-bottom: 30px;
  max-width: 300px;
}

.card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-gap: 0;
}

.card h5 {
  text-transform: uppercase;
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}

.card span {
  align-self: center;
}

.card .link {
  grid-column: 1 / 3;
  grid-row: 3 / 4;
  padding: 0;
}
</style>
