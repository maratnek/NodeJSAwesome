let password = {
  username: '',
  password: '',
};

if (process.ENV) {
  console.log('Process env:');
  password.username = process.ENV.GITHUB_USERNAME;
  password.password = process.ENV.GITHUB_SECRET;
}

module.exports  = password;
