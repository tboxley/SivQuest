var SOUNDS=new function(){
  var self=this;
  
  self.loadJSON=function(){
    //?!?!?!?!
  };

  self.setupVars=function(){
    self.music=document.getElementById('music');
    self.sfx=document.getElementById('sfx');
  };
  self.playMusic=function(s){
    self.music.src='sounds/music/'+s+'.mp3';
    self.music.play();
  };

  self.playSFX=function(s){
    self.sfx.src='sounds/sfx/'+s+'.mp3';
    self.sfx.play();
  };
};