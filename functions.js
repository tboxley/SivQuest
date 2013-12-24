//This is the file I use in everything.
Math.rand = function(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function toTitleCase(str){
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})
}

String.prototype.shuffle = function(){
  var a = this.split(""),
  n = a.length;
  for(var i = n - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a.join("")
}