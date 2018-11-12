<template>
  <div class="t">
    <div v-if="pack">
      <div class="card">
        <h5>{{pack.name}}</h5>
        <span v-if="pack.info && pack.info.star">Star: {{pack.info.star}}</span>
        <span v-if="pack.info && pack.info.date">Date: {{getDate(pack.info.date)}}</span>
        <span class="link"><a v-bind:href="pack.link">Link</a></span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CardComponent',
  props: ['pack'],
  data() {
    return {
      getDate: (date) => {
        let d = new Date(date);
        let option = { year: 'numeric', month: 'short', day: 'numeric' };
        return d.toLocaleDateString('en-US', option);
      },
    }
  },
  async created() {
  },
  methods: {
    changePage: function (index) {
      if (index)
        this.data = this.posts[index - 1];
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  color: #42b983;
  text-decoration: none;
  border: 1px solid #42b983;
  padding: 5px 15px;
  border-radius: 4px;
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
