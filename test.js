var readline = require('readline')
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

if (typeof String.prototype.replaceAll === 'undefined') {
  String.prototype.replaceAll = function(match, replace) {
    return this.replace(new RegExp(match, 'g'), () => replace)
  }
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substring(0, index) + replacement + this.substring(index + replacement.length)
}

var countLine = 0
var n = 0
var m = 0

function stringToArr(str) {
  var arr = []
  arr = str.split(' ')
  for (var i = 0; i < n; i++) {
    arr.push(parseInt(arr[i]))
  }
  console.log(arr)
  return arr
}

rl.on('line', function(line) {
  if (countLine == 0) {
    n = line.split(' ')[0]
    m = line.split(' ')[1]
  } else {
    var total = 0
    var curr = 0
    var arr = stringToArr(line)
    while (curr < m) {
      arr = arr.sort(function(a, b) {
        return b - a
      })
      if (arr[0] >= 0) {
        total += arr[0]
        arr[0] = Math.floor(arr[0] / 2)
      }
      curr++
    }
    console.log(total)
  }

  countLine++
})
