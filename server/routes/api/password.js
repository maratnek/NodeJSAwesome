let password = {
  username: '',
  password: '',
};

if (process.env) {
  console.log('Process env:');
  password.username = process.env.GITHUB_USERNAME;
  password.password = process.env.GITHUB_SECRET;
}

module.exports  = password;
