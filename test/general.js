/* eslint-env node, mocha */
process.env.GULDNAME = 'guld'
process.env.USER = 'guld'
const assert = require('chai').assert
const { getName, getFullName, exists, validate, getAlias } = require('../index.js')
const { getConfig, setConfig, unsetConfig, writeConfig } = require('guld-git-config')
const global = require('window-or-global')
const path = require('path')
const home = require('user-home')
const { getFS } = require('guld-fs')
var fs
var guldname
var fullname

describe('guld-user', function () {
  before(async function () {
    guldname = await getName()
  })
  it('getAlias', async function () {
    var als = await getAlias(guldname)
    assert.isTrue(Object.keys(als).length > 0)
    assert.isTrue(als.hasOwnProperty('github'))
  })
  describe('getName', function () {
    after(async function () {
      delete process.env.GULDNAME
      delete global.GULDNAME
      guldname = await getName()
    })
    it('USER env', async function () {
      guldname = await getName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.USER)
    })
    it('cached', async function () {
      process.env.GULDNAME = 'testuser'
      guldname = await getName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.USER)
    })
    it('GULDNAME env', async function () {
      delete global.GULDNAME
      guldname = await getName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.GULDNAME)
    })
  })
  describe('getFullName', function () {
    before(async function () {
      delete global.GULDFULLNAME
      this.origcfg = await getConfig('global')
      await unsetConfig('user.name', 'global')
    })
    after(async function () {
      delete global.GULDFULLNAME
      fullname = await getFullName()
      await writeConfig(this.origcfg, 'global')
    })
    it('empty', async function () {
      fullname = await getFullName()
      assert.notExists(fullname)
      assert.equal(fullname)
    })
    it('configured', async function () {
      await setConfig('user.name', 'Test User', 'global')
      fullname = await getFullName()
      assert.exists(fullname)
      assert.equal(fullname, 'Test User')
    })
    it('cached', async function () {
      await unsetConfig('user.name', 'global')
      fullname = await getFullName()
      assert.exists(fullname)
      assert.equal(fullname, 'Test User')
    })
  })
  describe('validate', function () {
    it('empty', async function () {
      assert.isTrue(validate())
    })
    it('too short', async function () {
      assert.throws(() => validate(''), RangeError)
    })
    it('bad chars', async function () {
      assert.throws(() => validate('!!!!'), RangeError)
    })
    it('too long', async function () {
      assert.throws(() => validate('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), RangeError)
    })
  })
  describe('exists', function () {
    before(async function () {
      fs = fs || await getFS()
      fs.rename(path.join(home, '.blocktree', 'guld'), path.join(home, '.blocktree', 'guld.bak'))
    })
    after(async function () {
      fs = fs || await getFS()
      fs.rename(path.join(home, '.blocktree', 'guld.bak'), path.join(home, '.blocktree', 'guld'))
    })
    it('empty', async function () {
      var es = await exists()
      assert.isTrue(es)
    }).timeout(4000)
    it('remote', async function () {
      var es = await exists('guld')
      assert.isTrue(es)
    }).timeout(4000)
    it('does not exists', async function () {
      var es = await exists('i-eat-shit-no-one-uses-me')
      assert.isNotTrue(es)
    }).timeout(4000)
  })
})
