const { getJS, setGlobal } = require('guld-env')
const { getFS } = require('guld-fs')
const { getConfig } = require('guld-git-config')
const global = require('window-or-global')
const got = require('got')
const path = require('path')
const home = require('user-home')
var fs

async function getName () {
  var cfg
  if (global.GULDNAME && typeof global.GULDNAME !== 'undefined' && global.GULDNAME.length > 0) {
    return global.GULDNAME
  } else if (getJS().startsWith('node')) {
    if (process.env.GULDNAME && typeof process.env.GULDNAME !== 'undefined' && process.env.GULDNAME.length > 0) {
      return setGlobal('GULDNAME', process.env.GULDNAME)
    } else {
      cfg = await getConfig('global')
      if (cfg && cfg.user && cfg.user.username) return setGlobal('GULDNAME', cfg.user.username)
      if (process.env.USER) return setGlobal('GULDNAME', process.env.USER)
    }
  } else {
    cfg = await getConfig('global')
    if (cfg && cfg.user && cfg.user.username) return setGlobal('GULDNAME', cfg.user.username)
  }
  return setGlobal('GULDNAME', 'guld')
}

async function getFullName () {
  var cfg
  if (global.GULDFULLNAME && typeof global.GULDFULLNAME !== 'undefined' && global.GULDFULLNAME.length > 0) {
    return global.GULDFULLNAME
  } else {
    cfg = await getConfig('global')
    if (cfg && cfg.user && cfg.user.name) return setGlobal('GULDFULLNAME', cfg.user.name)
  }
}

async function exists (gname) {
  gname = gname || await getName()
  validate(gname)
  fs = fs || await getFS()
  try {
    var stats = await fs.stat(path.join(home, '.blocktree', gname))
    if (stats && stats.isDirectory()) return true
  } catch (e) {
    if (!e.hasOwnProperty('code') || e.code !== 'ENOENT') throw e
  }
  try {
    const resp = await got(`https://raw.githubusercontent.com/guldcoin/_blocktree/guld/.gitmodules`)
    if (resp && resp.body) {
      return resp.body.indexOf(`[submodule "${gname}"]`) > -1
    }
  } catch (e) {
    return true // TODO parse for specific error and maybe re-throw
  }
  return true
}

function validate (gname) {
  var re = /^[a-z0-9-]{4,40}$/
  var result = re.exec(gname)
  if (!result || result[0].length === 0) {
    throw new RangeError(`name ${gname} is not valid. Can only be lowercase letters, numbers and dashes (-)`)
  } else return true
}

async function branches () {
  fs = fs || await getFS()
  var heads = await fs.readdir(path.join(home, '.git', 'refs', 'heads')) || []
  return heads
  // this config file method is not how `git branch --list` works
  /*
  return Object.keys(cfg).filter(l => {
    return l.startsWith('branch')
  }).map(l => {
    return l.split(' ')[1].replace(/"/g, '')
  })
  */
}

async function getAlias (user, network) {
  user = user || await getName()
  var cfg = await getConfig('public', user)
  if (cfg.aliases) {
    if (network) {
      if (cfg.aliases.hasOwnProperty(network)) return cfg.aliases[network]
    } else return cfg.aliases
  }
  return {}
}

module.exports = {
  getName: getName,
  getFullName: getFullName,
  exists: exists,
  validate: validate,
  branches: branches,
  getAlias: getAlias
}
