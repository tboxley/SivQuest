var SOUNDS=new function(){
  var self=this;
  
  self.loadJSON=function(){
    //?!?!?!?!
  };

  self.init=function(){
    self.music=new Audio();
    self.sfx=new Audio();
  };
  self.playMusic=function(s){
    self.music.src='sounds/music/'+s+'.ogg';
    self.music.play();
  };

  self.playSFX=function(s){
    self.sfx.src='sounds/sfx/'+s+'.ogg';
    self.sfx.play();
  };
};