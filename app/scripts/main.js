'use strict';

var app, record, television;

$(function () {

    $('a[href*=#]:not([href=#])').on('click',function () {

        var target = this.hash.slice(1);
        var callback;

        switch(target){

            case 'audio':
                if(app.currentPage !== 'audio'){
                    record.playSoundEffect('end', true);
                }
                callback = record.prepare;
                break;

            case 'video':
                record.stopAllSounds();
                //$('.slider').val(24, true);
                console.log();
                callback = television.prepare;
                break;

            case 'contact':
                record.stopAllSounds();
                //$('.slider').val(24, true);
                callback = function(){console.log('contact prepare')};
                break;

        }

        app.load(target, callback);


    });

    //Draggable.create('.ring', {type: 'rotation', throwProps: true});

});

var App = function ($) {

    var _currentPage = 'audio';

    return{

        getCurrentPage: function () {
            return this._currentPage;
        },

        init : function(callback){
            var f = callback;
            f();
        },

        load : function(part, callback){

            console.log(part, callback);

            //this._currentPage(part);
            app._initMethod = callback;

            $.ajax({
                context: this,
                dataType : 'html',
                url : 'templates/'+part+'.html',

                success : function(results) {

                    $('#wrapper').html(results);

                    app.init(callback);
                }
            });
        }
    };
};

var Television = function ($) {

    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    var done = false;

    var onYouTubeIframeAPIReady = function() {
        player = new YT.Player('player', {
          height: '390',
          width: '640',
          videoId: '1zDvDKufc80',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
    }

    var onPlayerStateChange = function(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          setTimeout(stopVideo, 6000);
          done = true;
        }
    }

    function stopVideo() {
        //this.player.stopVideo();
    }

    var onPlayerReady = function(event) {
        event.target.playVideo();
    }

    return{
        prepare : onYouTubeIframeAPIReady
    }

}

var Record = function ($) {

    var soundEffects = {
        crackling: new Audio('../sounds/needle.ogg'),
        end: new Audio('../sounds/endloop.ogg')
    };

    var tracks = [];

    var soundObject;

    var totalTime = 0;

    var currentTrack = 0;

    var previousTracksLength = 0;

    return {

        /*getOption: function (key) {
            return options[key];
        },*/

        getCurrentTrack: function () {
            return tracks[currentTrack];
        },

        setCurrentTrack: function (index) {
            currentTrack = index;
        },


        setTracks: function (tracklist) {
            tracks = tracklist;
            totalTime = 0;

            tracks.forEach(function (track) {
                totalTime += track.duration;
            });

            this.setLabel();
        },


        setLabel: function () {

            var titles = '',
                trackNo = 1;

            tracks.forEach(function (track) {

                titles += '<br>';
                titles += (trackNo++) + '. ';
                titles += track.title.substr(0, track.title.indexOf(' -'));

            });

            $('.record').find('.title').html(titles);
        },

        onPosition: function () {

            var globalTimestamp = previousTracksLength + soundObject.position;

            this.setArmRotation(globalTimestamp / totalTime);
        },

        setArmRotation: function (percent) {
            var value = ((1 - percent) * (75 - 24));
            $('.slider').val(value + 24, true);
        },

        prepare: function () {

            console.log('preparing sliders');

            SC.whenStreamingReady(function () {
                setTimeout(function () {
                    SC.get('/playlists/2373914', function (playlist) {
                        record.setTracks(playlist.tracks);
                        //console.log(playlist);
                    }.bind(this));
                }.bind(this), 2200);

            });

            //var track = this.setCurrentTrack(0);

            $('.slider').noUiSlider({

                start: 24,
                handles: 1,
                range: {
                    'min': 24,
                    'max': 75
                }

            });

            $('.slider').change(function (e) {
                console.log('change');
                record.armMoving = false;
                record.setPosition($(e.target).val(), 24, 75);
            });

            $('.slider').on({
                slide: function () {
                    record.armMoving = true;
                    console.log('moving');
                    $('.arm').css('-webkit-animation', 'none');
                    $('.arm').css('-webkit-transform', 'rotate(-' + $('.slider').val() + 'deg)');
                    $('.slider').css('-webkit-transform', 'rotate(-' + $('.slider').val() / 3 + 'deg)');
                },
                set: function () {
                    console.log('set');
                    $('.arm').css('-webkit-transform', 'rotate(-' + $('.slider').val() + 'deg)');
                }
            });


            $('.arm').css('-webkit-animation', 'wobblearm 4.3s infinite');

            //Spin that shit, and move arm
            $('.record')
                .css('-webkit-animation', 'rotating 4.3s linear infinite');
            //$('.arm')
            //.css('display','block')
            //.css('-webkit-animation', 'initarm 2s linear 1');
            //
            record.playSoundEffect('end', true);

        },

        setPosition: function (position, min, max) {

            var globalTargetPercent = 1 - (position - min) / (max - min),
                globalTargetTime = totalTime * globalTargetPercent,
                localTargetTime;

            var timestamp = 0,
                trackNumber = 0,
                lock = false;

            tracks.forEach(function (track) {

                if (!lock) {

                    timestamp += track.duration;

                    if (globalTargetTime < timestamp) {

                        localTargetTime = globalTargetTime - (timestamp - track.duration);

                        previousTracksLength = (timestamp - track.duration);

                        lock = true;

                    } else {

                        trackNumber++;

                    }
                }

            });

            if ((soundObject && soundObject.playState > 0) && (currentTrack === trackNumber)) {
                soundObject.setPosition(localTargetTime);
            } else {
                currentTrack = trackNumber;
                this.playCurrentTrack(localTargetTime);
            }

        },

        next: function () {

            previousTracksLength += tracks[currentTrack].duration;

            //Stop current sound if any
            try {
                soundObject.stop();
            } catch (err) { /*do nothing*/ }

            //Go to next track
            if (currentTrack >= (tracks.length - 1)) {
                //currentTrack = 0;
            } else {
                currentTrack++;
                this.playCurrentTrack(0);
            }

        },

        playCurrentTrack: function (position) {

            //Stop current sound if any
            try {
                soundObject.stop();
            } catch (err) { /*do nothing*/ }

            if (this.getCurrentTrack() && this.getCurrentTrack() !== 'undefined') {

                //Load the track
                SC.stream('/tracks/' + this.getCurrentTrack().id, {
                    whileplaying: function () {
                        if (!record.armMoving && soundObject.loaded) {
                            this.onPosition();
                        }
                    }.bind(this),
                    autoLoad: true
                }, function (sound) {
                    soundObject = sound;
                    this.playSoundEffect('crackling', false);
                    soundObject.setVolume(0);
                    soundObject.play({
                        onload: function () {
                            soundObject.setVolume(90);
                            soundObject.setPosition(position);
                        },
                        onfinish: function () {
                            record.next();
                        }
                    });
                }.bind(this));
            }

        },

        playSoundEffect: function (key, loop) {
            //soundEffects[key].stop();
            soundEffects[key].loop = loop;
            soundEffects[key].play();
        },

        stopAllSounds: function () {

            for (var key in soundEffects) {
                soundEffects[key].pause();
            }

            //Stop current sound if any
            try {
                soundObject.stop();
            } catch (err) { /*do nothing*/ }

        },

        initSoundcloud: this.initSoundcloud

    };
};

app = new App(jQuery);
record = new Record(jQuery);
television = new Television(jQuery);
app.load('audio', record.prepare);
