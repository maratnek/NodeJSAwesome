let password = {
  username: 'maratnek',
  password: 'fzntkrjhcb1904',
};

if (process.env) {
  console.log('Process env:');
  if (process.env.GITHUB_USERNAME && process.env.GITHUB_SECRET) {
    password.username = process.env.GITHUB_USERNAME;
    password.password = process.env.GITHUB_SECRET;
  }
}

module.exports  = password;
