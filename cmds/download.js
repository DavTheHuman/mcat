const fs = require('fs')
const _ = require('lodash')
const async = require('async')
const path = require('path')
const fspvr = require('fspvr')
const admzip = require('adm-zip')
const monstercat = require('../lib/monstercat')

const music = require('../lib/music')
const MUSIC_DIR = music.MUSIC_DIR
const fileNameForTrack = music.fileNameForTrack
const fileNameForAlbumArt = music.fileNameForAlbumArt
const fileNameForRelease = music.fileNameForRelease
const fileNameForReleaseArt = music.fileNameForReleaseArt
const readStdinJSON = music.readStdinJSON
const ensureDir = music.ensureDir

const DOWNLOAD_QUALITY = 'mp3_320'
const trackToDownloadURL = (track) => {
  return `https://connect.monstercat.com/v2/release/${track.release.id}/track-download/${track.id}?format=${DOWNLOAD_QUALITY}`
}
const coverToDownloadURL = (track) => {
  return `https://connect.monstercat.com/v2/release/${track.release.id}/cover`
}
const releaseToDownloadURL = (release) => {
  return `https://connect.monstercat.com/v2/release/${release.id}/download?format=${DOWNLOAD_QUALITY}`
}
const releaseCoverURL = (release) => {
  return `https://connect.monstercat.com/v2/release/${release.id}/cover`
}

const taskId = (task)=> task.type + task.uri + task.fs
const performTask = ({type, uri, fsPath, title}, next)=> {
  if (fs.existsSync(fsPath) || process.env.MC_DRY) {
    console.log(`-- ⚠️  Skiping download of '${title}' file already exists at destination!`)
    return next()
  }

  ensureDir(path.dirname(fsPath))
  console.log(`-- 💌  Starting download of '${title}'`)
  monstercat.download(uri, fsPath, (err)=> {
    if (err) return next(err)
    console.log(`-- ✅ 🔥 Finished download of '${title}'`)
    if(path.extname(fsPath) == '.zip'){
      console.log(`-- 📁 Starting extraction of '${title}'`)
      zip = new admzip(fsPath)
      zip.extractAllTo(path.join(fsPath, '..'))
      fs.unlinkSync(fsPath)
      console.log(`-- ✅ Finished extraction of '${title}'`)
    }
    next()
  })
}

const download = (dbg, args, done) => {
  readStdinJSON((err, tracks)=> {
    if (err) return done(err)
    var isReleases = (tracks[0].catalogId != undefined)
    console.log(`-- 💡  Got ${tracks.length} ${isReleases ? 'releases' : 'tracks'}...`)
    var tasks = {}
    addTask = (t, {artistsTitle, title})=> {
      t.title = `${artistsTitle} - ${title}`
      if (t.type == 'image') t.title += ' (Album Art)'
      tasks[t.fsPath] = t
    }
    _.each(tracks, (t)=> {
      addTask({ type: 'music', uri: isReleases ? releaseToDownloadURL(t) : trackToDownloadURL(t), fsPath: fspvr.reformatPath(isReleases ? fileNameForRelease(t) : fileNameForTrack(t)) }, t)
      addTask({ type: 'image', uri: isReleases ? releaseCoverURL(t) : coverToDownloadURL(t), fsPath: fspvr.reformatPath(isReleases ? fileNameForReleaseArt(t) : fileNameForAlbumArt(t)) }, t)
    })


    var endTasks = _.values(tasks),
      typeStats = {};
    tally = (obj, type)=> { obj[type] = (obj[type] || 0) + 1 }
    _.each(endTasks, ({type})=> { tally(typeStats, type)
    });
    console.log(`-- 🔥 🔥  Starting Download of ${typeStats.music} ${isReleases ? 'releases' : 'songs'} and ${typeStats.image} images.`)
    async.eachLimit(endTasks, 32, performTask, (err)=> {
      if (err) return done(err)
      console.log(`-- ✅ 🔥 Finished downloading all ${typeStats.music} ${isReleases ? 'releases' : 'songs'} and ${typeStats.image} images; avalible at '${MUSIC_DIR}'`)
      done()
    })
  });
}

module.exports = download;
