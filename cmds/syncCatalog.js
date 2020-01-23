const fs = require('fs')
const _ = require('lodash')
const monstercat = require('../lib/monstercat')

const PAGE_SIZE = 50
const getPage = (skip, isReleases, results, done)=> {
  if (typeof(results) == 'function') {
    done = results
    results = []
  }
  console.log(`-- 💌  Requesting Monstercat Catalog (page ${skip/PAGE_SIZE}).`)
  monstercat.request('GET', `/v2/${isReleases ? 'releases' : 'catalog/browse'}?limit=${PAGE_SIZE}&skip=${skip}`, (err, res, body)=> {
    if (err) return done(err, null, false)
    const parsedBody = JSON.parse(body)
    console.log(`-- ⬇️  Got ${parsedBody.results.length} ${isReleases ? 'releases' : 'tracks'} from Monstercat Catalog (page ${skip/PAGE_SIZE}).`)

    // Concat; less re-allocation
    _.each(parsedBody.results, (e)=> results.push(e))

    // If parsed results has less that limit safe to assume more to sync.
    if (parsedBody.results.length == 0) return done(null, results)

    // Get next pages recursively; Catalog is small enough this is safe
    return getPage(skip + parsedBody.results.length, isReleases, results, done)
  })

}
const syncCatalog = (dbg, args, done) => {
  getPage(0, _.includes(args, '--releases'), (err, results)=> {
    if (err) return done(err)
    console.log(`-- 📝  Syncing Monstercat Catalog with ${results.length} entries to FS cache.`)
    fs.writeFile(monstercat.CATALOG_PATH, JSON.stringify(results), (err) => {
      if (err) return done(err)
      console.log("-- ✅  Finshed Syncing Monstercat Catalog.")
      done()
    });
  });
}

module.exports = syncCatalog;
