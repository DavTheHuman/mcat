const monstercat = require('..\\lib\\monstercat')

const session = (dbg, args, done) => {
  console.log("-- Sending session request to Monstercat...")
  monstercat.request('GET', '/api/self/session', (err, res, body)=> {
    if (err) return done(err)
    parsedBody = JSON.parse(body)
    if (parsedBody.user) console.log("-- Authenticated with Monstercat Connect!")
    else console.log("-- NOT Authenticated with Monstercat Connect!")
    if (parsedBody.permissions.catalog.download) console.log('-- Track downloads are allowed.')
    else console.log('-- Track downloads are NOT allowed.')
    done();
  });
}

module.exports = session;
