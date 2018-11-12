<template> <!-- <router-view></router-view> -->
  <div class="container">
    <h1>Awesome Modules</h1>
    <hr>
    <p class="error" v-if="error">{{error}}</p>
    <div v-else-if="!error" class="pages">
      <h4>Pages</h4>
      <button v-for="ind in pages" v-bind:class="{ active: activeInd == ind}" v-on:click="changePage(ind)"> {{ind}}</button>
    </div>
    <ul class="package-container">
      <li class="package" v-for="(packages, index) in data">
        <h3>{{packages.name}}</h3>
        <div class="pack" v-for="(pack, index) in packages.list">
          <div class="" v-if="pack.type == 'link'">
            <CardComponent v-bind:pack="pack"></CardComponent>
          </div>
          <div class="" v-else-if="pack.type == 'list'">
            <h4>{{pack.name}}</h4>
            <div class="" v-for="(pack,index) in pack.list">
              <CardComponent v-bind:pack="pack"></CardComponent>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import PostService from '../PostService';
import CardComponent from './CardComponent.vue'

export default {
  name: 'PostComponent',
  data() {
    return {
      activeInd: 1,
      pages: [],
      data: [],
      error: '',
      getDate: (date) => {
        let d = new Date(date);
        let option = { year: 'numeric', month: 'short', day: 'numeric' };
        return d.toLocaleDateString('en-US', option);
      },
    }
  },
  async created() {
    try {
      this.posts = await PostService.getPosts(this.$route.query);
      if (typeof this.posts === 'string') {
        this.error = 'Parse Error ' + this.posts;
      } else {
        this.pages = this.posts.length;
        this.data = this.posts[0];
        console.log(this.posts);
      }
    } catch (err) {
      this.error = err.message;
    }
  },
  methods: {
    changePage: function (index) {
      if (index) {
        this.activeInd = index;
        this.data = this.posts[index - 1];
      }
    }
  },
  components: {
    CardComponent,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
  background: white;
  border: 1px solid #888;
  margin: 2px;
}

.active {
  background: #888;
  color: white;
}
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
  margin: 0 10px;
  border-right: 10px solid #555;
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

</style>
