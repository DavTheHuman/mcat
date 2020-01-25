const path = require('path')
const _ = require('lodash')
const fs = require('fs')
const os = require('os')
const sanitize = require('sanitize-filename')

const MUSIC_DIR = path.join(os.homedir(), '/Music')
const fileNameForTrack = (track)=> path.join(MUSIC_DIR, `/${sanitize(track.artistsTitle)}/${sanitize(track.release.title)}/${sanitize(track.title)}${track.version == "" ? `` : ` ${sanitize(track.version)}`}.mp3`)
const fileNameForAlbumArt = (track)=> path.join(MUSIC_DIR, `/${sanitize(track.artistsTitle)}/${sanitize(track.release.title)}/folder.jpg`)
const fileNameForRelease = (release) => path.join(MUSIC_DIR, `/${sanitize(release.artistsTitle)}/${sanitize(release.title)}/${sanitize(release.title)}.zip`)
const fileNameForReleaseArt = (release) => path.join(MUSIC_DIR, `/${sanitize(release.artistsTitle)}/${sanitize(release.title)}/folder.jpg`)

const readStdinJSON = (done)=> {
  var input = ''
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk)=> { input += chunk;});
  process.stdin.on('end', ()=> {
    done(null, JSON.parse(input))
  })
}

const ensureDir = (dirPath, mode) => {
  if (fs.existsSync(dirPath)) return
  var current = dirPath;
  var toCreate = []
  var foundBase = false
  while (!foundBase) {
    foundBase = fs.existsSync(current)
    foundBase || toCreate.push(current)
    current = path.dirname(current)
  }
  for (var curr of _.reverse(toCreate)) fs.mkdirSync(curr, mode)
};

module.exports = {
  MUSIC_DIR,
  fileNameForTrack,
  fileNameForAlbumArt,
  fileNameForRelease,
  fileNameForReleaseArt,
  readStdinJSON,
  ensureDir,
}
