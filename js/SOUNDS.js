var SOUNDS=new function(){
  var self=this;


  self.init=function(){
    self.music=new Audio();
    self.sfx=new Audio();
  };
  
  self.playMusic=function(s,l){
    l=l||0;
    self.music.loop=l;
    self.music.src='sounds/music/'+s+'.ogg';
    self.music.play();
  };

  self.stopMusic=function(){
    self.music.pause();
  };

  self.playSFX=function(s){
    self.sfx.src='sounds/sfx/'+s+'.ogg';
    self.sfx.play();
  };
};