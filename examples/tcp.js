

var createHash = require('crypto').createHash 
function hash (obj) {
  return createHash('sha').update(JSON.stringify(obj)).digest('hex')
}

var Docuset = require('../docuset')
var net = require('net')
var es = require('event-stream')
var _s

var data = {
  list: []
}

// alternative Repo with a shorter hash.

var Repo = require('../').inject({
  hash: function (commit) {
    return '#'+hash(commit).substring(0,10)
  }
})

var opts = {
  createRepo: function (key) {
    return new Repo()
  }
}

var a = new Docuset(opts)
var b = new Docuset(opts)

var server = a.createServer().listen(8282, function () {

  var con = b.connect(8282)
  repo = con.sub('test')
  repo.commit({list: [1,2,3]}, {parent: 'master'})

})

function checkSynced(_, source) {
  console.log( 
    a.repo.branch('master') == b.repo.branch('master')
    ? 'SYNCED'
    : 'UN-SYNCED', source
  ) 
}

/*setInterval(function () { 
  data.list.push(data.list.length)
  repo.commit(data, {parent: 'master'})
  console.log('data', data)
}, 1e3)
*/

setInterval(function () {
  var repo = b.repos.test
  var data = repo.checkout('master')
  data.list.push(data.list.length)
  console.log(data)
  repo.commit(data, {parent: 'master'})
}, 1e3)


//TODO injectable merge rules!
//and allow appends in adiff

setInterval(function () {
  var repo = a.repos.test
  var data = repo.checkout('master')
  data.list.unshift('!')
  repo.commit(data, {parent: 'master'})
}, 2e3)
