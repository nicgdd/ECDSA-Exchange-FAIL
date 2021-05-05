const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

//TEST COMMIT 2

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// original version of app.get
app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0; // 'address' comes from the value inserted in the front-end
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
});

let users = [];

// creates a new user from the elliptic library
function addUser() {
  const EC = require('elliptic').ec;
  const ec = new EC('secp256k1');
  const key = ec.genKeyPair();
  let newUser = {
    key: key,
    privateKey: key.getPrivate().toString(16),
    publicX: key.getPublic().x.toString(16),
    publicY: key.getPublic().y.toString(16),
    publicKey: key.getPublic().encode("hex"),
    address: '0x'+key.getPublic().encode("hex").slice(-40),
    balance: 0,
  };
  users.push(newUser);
}

// creates 3 test users
// in prod, this would be replaced with real users sign ups
addUser();
addUser();
addUser();

// creates the balances object, to be used by client/index.js
const balances = {};

// arbitrary sets balances for our 3 test users
users[0].balance = 100;
users[1].balance = 50;
users[2].balance = 75;

// feeds 'balances'
users.map((user, i) => {
  balances[user.address] = user.balance;
// here I used [user.address] so that the user accesses his balance with his account address
// we can change that to the private key, or another constant...
});

console.log('================');
console.log('AVAILABLE ACCOUNTS :');
users.map((user, i) => {
  console.log(`(${i}) ${user.address} (${user.balance} ETH)`);
});
console.log('================');
console.log('PRIVATE KEYS :');
users.map((user, i) => {
  console.log(`(${i}) ${user.privateKey}`);
});

// test OK ! tests the usage of the elliptic library
// this uses the elliptic library to verify a signature
// but i don't understand why signing, verifying... if we have the private key available in the code ?? users[i].privateKey
const EC = require('elliptic').ec;
const msgHash = '3b9504ae5e24741b5bdb12d23ef5e5a1c8819a535283e16b0b77745889b9592b';
var signature = users[0].key.sign(msgHash);
const test4 = users[0].key.verify(msgHash, signature);
console.log('================');
console.log('Testing sign & verify on user 0 :');
console.log(test4);

/* modified version of app.get
app.get('/balance/:address', (req, res) => {
  const {address} = req.params;

  const EC = require('elliptic').ec;
  const msgHash = '3b9504ae5e24741b5bdb12d23ef5e5a1c8819a535283e16b0b77745889b9592b';
  var signature = users[address].key.sign(msgHash);
  ... work in progress

  if (true) {
    const balance = balances[address] || 0; //address value comes from the front end
  }
  res.send({ balance });
});
*/

app.listen(port, () => {
  console.log('================');
  console.log(`Listening on port ${port}!`);
});
