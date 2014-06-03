'use strict';
$(function(){
    
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 500);
                return false;
            }
        }
    });
});


var App = function($){

  var soundEffects = {
    crackling :  new Audio('/sounds/needle.ogg'),
    end :  new Audio('/sounds/endloop.ogg')
  };

  var tracks = [];

  var soundObject;

  var total_time = 0;

  var currentTrack = 0;

  var previous_tracks_length = 0;

  return {

    getOption : function(key){
      return options[key];
    },

    getCurrentTrack : function(){
      return tracks[currentTrack];
    },

    setCurrentTrack : function(index){
      currentTrack = index;
    },


    setTracks : function(tracklist){
      tracks = tracklist;
      total_time = 0;

      tracks.forEach(function(track){
        total_time += track.duration;
      });

      this.setLabel();
    },


    setLabel : function(){

      var titles = '',
        trackNo = 1;

      tracks.forEach(function(track){

        titles += '<br>';
        titles += (trackNo++) + ". "
        titles += track.title.substr(0, track.title.indexOf(' -'));

      });

      $('.record').find('.title').html(titles);
    },

    onPosition : function(){

      var global_timestamp = previous_tracks_length + soundObject.position;

      this.setArmRotation(global_timestamp / total_time);
    },

    setArmRotation : function(percent){
      var value = ((1-percent) * (75-24));
      $('.slider').val(value+24,true);
    },


    prepare : function(){

      var track = this.setCurrentTrack(0);

      $('.slider').noUiSlider({

        start: 24
        ,handles: 1
        ,range: {
          'min': 24,
          'max': 75
        }

      });

      $('.slider').change(function(e){
        console.log('change');
          app.armMoving = false;
          app.setPosition($(e.target).val(), 24, 75);
      });

      $('.slider').on({
        slide: function(){
          app.armMoving = true;
          console.log('moving');
          $('.arm').css('-webkit-animation','none');
          $('.arm').css('-webkit-transform','rotate(-' + $('.slider').val() + 'deg)');
          $('.slider').css('-webkit-transform', 'rotate(-'+$('.slider').val()/3+'deg)');
        },
        set: function(){
          console.log('set');
          $('.arm').css('-webkit-transform','rotate(-' + $('.slider').val() + 'deg)');
        }
      });


      $('.arm').css('-webkit-animation','wobblearm 4.3s infinite');

      //Spin that shit, and move arm
      $('.record')
        .css('-webkit-animation', 'rotating 4.3s linear infinite');
      //$('.arm')
        //.css('display','block')
        //.css('-webkit-animation', 'initarm 2s linear 1');
        //
      this.playSoundEffect('end', true);

    },

    setPosition : function(position, min, max){

      var global_target_percent = 1 - (position-min)/(max-min),
        global_target_time = total_time * global_target_percent,
        local_target_time;

      var timestamp = 0,
        track_number = 0,
        lock = false;

      tracks.forEach(function(track){

        if(!lock){

          timestamp += track.duration;

          if(global_target_time < timestamp){

            local_target_time = global_target_time - (timestamp - track.duration);

            previous_tracks_length = (timestamp - track.duration);

            lock = true;

          }else{

            track_number++;

          }
        }

      });

      if((soundObject && soundObject.playState > 0) && (currentTrack === track_number)){
        soundObject.setPosition(local_target_time);
      }else{
        currentTrack = track_number;
        this.playCurrentTrack(local_target_time);
      }

    },

    next : function(){

      previous_tracks_length += tracks[currentTrack].duration;

      //Stop current sound if any
      try{soundObject.stop();}catch(err){/*do nothing*/}

      //Go to next track
      if(currentTrack >= (tracks.length-1)){
        //currentTrack = 0;
      }else{
        currentTrack++;
        this.playCurrentTrack(0);
      }

    },

    playCurrentTrack : function(position){

      //Stop current sound if any
      try{soundObject.stop();}catch(err){/*do nothing*/}

      if(this.getCurrentTrack() && this.getCurrentTrack() !== 'undefined'){

        //Load the track
        SC.stream("/tracks/" + this.getCurrentTrack().id, {
          whileplaying: function () {
            if(!app.armMoving && soundObject.loaded){
              this.onPosition();
            }
          }.bind(this),
          autoLoad:true
        },function(sound){
          soundObject = sound;
          this.playSoundEffect('crackling', false);
          soundObject.setVolume(0);
          soundObject.play({
            onload : function(){
              soundObject.setVolume(90);
              soundObject.setPosition(position);
            },
            onfinish : function(){
              app.next();
            }
          });
        }.bind(this));
      }

    },

    playSoundEffect : function(key, loop){
      //soundEffects[key].stop();
      soundEffects[key].loop = loop;
      soundEffects[key].play();
    },

    stopAllSounds : function(key){

      for (var key in soundEffects){
        soundEffects[key].pause();
      }

      //Stop current sound if any
      try{soundObject.stop();}catch(err){/*do nothing*/}

    },

    initSoundcloud : this.initSoundcloud

  }
}

var app = new App(jQuery);

SC.whenStreamingReady(function(){
  setTimeout(function() {
    SC.get('/playlists/2373914', function(playlist) {
      app.setTracks(playlist.tracks);
      app.prepare();
      //console.log(playlist);
    }.bind(this));
  }.bind(this), 2200);

});
