'use strict';

var app, record, television, contact;

$(function () {

    $('a[href*=#]:not([href=#])').on('click',function () {

        var target = this.hash.slice(1);

        app.getAndLoad(target);

    });


});



var App = function ($) {

    var _currentPage = 'audio';

    var soundEffects = {
        crackling: new Audio('../sounds/needle.ogg'),
        end: new Audio('../sounds/endloop.ogg'),
        channel: new Audio('../sounds/btn.ogg'),
        dial: new Audio('../sounds/dial_short.ogg'),
        dialBack: new Audio('../sounds/dialback.ogg'),
        dialEnd: new Audio('../sounds/dialend.ogg'),
        tv: new Audio('../sounds/tv.ogg'),
        wrongnumber: new Audio('../sounds/wrongnumber.ogg'),
        dialtone: new Audio('../sounds/dialtone.ogg'),
        answer: new Audio('../sounds/answer.ogg')
    };

    var pages = [
        'audio',
        'video',
        'contact'
    ]

    return{

        getAndLoad : function(target){

            var callback;

            app.stopAllSounds();

            switch(target){

                case 'audio':

                    callback = record.prepare;
                    break;

                case 'video':
                    record.stop();
                    //$('.slider').val(24, true);

                    callback = television.prepare;
                    break;

                case 'contact':
                    record.stop();
                    //$('.slider').val(24, true);
                    callback = contact.prepare;
                    break;

            }

            app.load(target, callback);
        },

        playSoundEffect: function (key, loop) {
            //soundEffects[key].stop();
            soundEffects[key].loop = loop;
            soundEffects[key].play();

            return soundEffects[key];
        },

        stopAllSounds: function () {

            for (var key in soundEffects) {
                soundEffects[key].pause();
            }
        },

        sound : function(key){
            return soundEffects[key];
        },

        prepare : function(){

            $('.switch > div').noUiSlider({

                start: 0,
                orientation: 'vertical',
                handles: 1,
                step:1,
                behaviour: 'extend-tap',
                range: {
                    'min': 0,
                    'max': 2
                }

            }).on({
                slide: function (e) {
                    var index = parseInt(Math.floor($(this).val()));
                    app.getAndLoad(pages[index]);

                },
                set: function (e) {
                    if(typeof(television[$(e.target).data('control')]) === 'function'){
                        television[$(e.target).data('control')]($(this).val());
                    }
                }
            });
        },

        getCurrentPage: function () {
            return _currentPage;
        },

        init : function(callback){
            var f = callback;
            f();
        },

        setSwitch : function(index){
            $('.switch > div').val(index);
        },

        load : function(part, callback){

            app._initMethod = callback;

            _currentPage = part;

            $.ajax({
                context: this,
                dataType : 'html',
                url : 'templates/'+part+'.html',

                success : function(results) {

                    $('#wrapper').html(results);

                    app.setSwitch(pages.indexOf(part));

                    app.init(callback);
                }
            });
        }
    };
};

var Contact = function ($) {

    var maxrot,
        instance,
        numberToCall = '',
        currentItem,
        hasAnswered = false,
        calling = false;

    var getAngle = function(deltaX,deltaY){
        
        var deg = Math.tan(deltaX/deltaY);
        deg *= 57.2957795;

        return deg;
    }

    var links = [
        ['+46(0)708-138138','tel:0708138138','_self'],
        ['hey@riverside.com','mailto:hey@riverside.com','_blank'],
        ['Youtube','http://youtube.com/user/riversidesoc','_blank'],
        ['Soundcloud','http://soundcloud.com/riverside-society','_blank'],
        ['Twitter','http://twitter.com/riversidesoc','_blank'],
        ['Facebook','','_blank'],
        ['Instagram','http://instagram.com/riversidesociety','_blank']
    ];

    var answerPhone = function(){
        calling = false;
        app.playSoundEffect('answer',false);
        numberToCall = '';
        hasAnswered = true;
        $('.ring').addClass('active');
        $('.note').html(numberToCall);
        contact.instance.enable();
        //$('.ring .links li').addClass('iconized');
    }

    var doCall = function(){

        calling = true;

        contact.instance.disable();

        app.playSoundEffect('dialtone', true);

        setTimeout(function() {
            if(app.getCurrentPage() === 'contact'){
                app.stopAllSounds();
                answerPhone();
            }
        }, Math.random()*10000);
    }

    var getContactLink = function(){

        var index = $(currentItem).index();

        var $link = $('<a/>', {
            'href' : links[index][1],
            'target' : links[index][2],
            text : links[index][0]
        });

        $('.note').html($link);
    }

    var saveNumber = function(){

        if(hasAnswered){
            return;
        }

        numberToCall += currentItem.text();

        if(numberToCall.length >= 5){
            if(numberToCall === '67285'){
                contact.instance.disable();
                doCall();
            }else{
                app.playSoundEffect('wrongnumber', false);
                numberToCall = '';
            }
        }

        $('.note').html(numberToCall);
    }

    var setCurrentItem = function(item){
        currentItem = item;
    }

    return{

        prepare : function(){

            var self = this;
            numberToCall = '';
            hasAnswered = false;
            calling = false;

            Draggable.create('.ring', {
                type: 'rotation',
                trigger:'.ring .links',
                dragResistance:0,
                bounds:{
                    minRotation:0,
                    maxRotation:0
                },
                throwProps: false,

                onPress : function(e){

                    
                    contact.instance = this;

                    if(e.target.nodeName !== 'LI'){
                        maxrot = 0;
                    }else{
                        maxrot = ($(e.target).index())*29 + 55;
                        setCurrentItem($(e.target));
                    }

                    this.applyBounds({
                        minRotation:0,
                        maxRotation:maxrot
                    });
                },
                onDrag : function(e){

                    if(this.rotation > 10){
                        app.playSoundEffect('dial',false);
                    }

                    if(this.rotation === this.maxRotation && (e.type === 'mousemove' || e.type === 'touchmove')){

                        /*
                            if(e.target.nodeName !== 'LI'){
                            contact.instance.kill();
                        }*/

                        contact.instance.disable();

                        if(hasAnswered){
                            getContactLink();
                        }else{
                            saveNumber();
                        }

                        //currentItem.addClass('current').siblings().removeClass('current');

                    }
                },

                onDragEnd:function(e) {

                    if(e.target.nodeName === 'DIV' || e.target.nodeName === 'UL' || e.target.nodeName === 'LI'){
                        contact.instance.disable();

                    }else{
                        this.kill();
                    }

                    var $target = $('.ring');

                    app.stopAllSounds();
                    app.playSoundEffect('dialBack',false);

                    TweenMax.to($target, maxrot/400, {rotation:0, onComplete:function(){
                        app.playSoundEffect('dialEnd',false);
                        if(!calling){contact.instance.enable()};
                    }});

                }
            });
        }
    };

}

var Television = function ($) {

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    var playlist = [];
    var done = false;

    var init = function(){
        


    };

    var prepare = function(){



        app.playSoundEffect('tv',true);
        app.sound('tv').volume = 0;

        var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/PL4dadaf1ycyVnQTJ9INfD0jfFF_XDF2cG?v=2&alt=json&callback=?';
        var videoURL= 'http://www.youtube.com/watch?v=';

        $.getJSON(playListURL, function(data) {

            var list_data="";

            $.each(data.feed.entry, function(i, item) {

                var feedTitle = item.title.$t;
                var feedURL = item.link[1].href;
                var fragments = feedURL.split("/");
                var videoID = fragments[fragments.length - 2];
                var url = videoURL + videoID;
                var thumb = "http://img.youtube.com/vi/"+ videoID +"/default.jpg";

                playlist.push(videoID);

                if (videoID !='videos') {
                    list_data += '<li><a href="" data-id="' + videoID + '"></a></li>';
                }

            });

            player = new YT.Player('iframe', {
                height: '390',
                width: '640',
                volume:100,
                videoId: playlist[0],
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });


            $(list_data).appendTo("ul.channels");

            var $channels = $('ul.channels');
            $channels.find('li:first a').addClass('active');
            $channels.append('<li style="float:right;"><a href="#" class="onoff"></li>');

        });



        
        $('ul.channels').on('click','li', function(e){

            e.preventDefault();

            var $target = $(e.target).closest('li'),
                $link = $target.find('a'),
                $channels = $('.channels');


            if($target.find('a').data('id')){

                var videoID =$link.data('id');

                loadVideo(videoID);
                app.playSoundEffect('channel',false);
                $target.siblings().find('a').removeClass('active');
                $link.addClass('active');
            }else{
                player.stopVideo();
                $channels.find('a').removeClass('active');
                $channels.find('li:last a').addClass('active');
            }

            

        });

        $('.sliders div').each(function(index,el){

            $(el).css('height', $('.sliders').outerHeight());

            $(el).noUiSlider({

                start: 100,
                direction:'rtl',
                orientation: 'vertical',
                handles: 1,
                range: {
                    'min': 0,
                    'max': 100
                }

            }).on({
                slide: function (e) {

                    if(typeof(television[$(e.target).data('control')]) === 'function'){
                        television[$(e.target).data('control')]($(this).val());
                    }

                },
                set: function (e) {
                    if(typeof(television[$(e.target).data('control')]) === 'function'){
                        television[$(e.target).data('control')]($(this).val());
                    }
                }
            });
        });


    };


    var onPlayerStateChange = function(event) {

        if (event.data === YT.PlayerState.PLAYING && !done) {
            setTimeout(stopVideo, 6000);
            done = true;
        }

        if(event.data === YT.PlayerState.ENDED){
            player.seekTo(0);
            player.playVideo();
        }

        if(done){
            $('#player iframe').css('opacity', 1);
            app.sound('tv').volume = 0;
        }

    };

    function stopVideo() {
        //this.player.stopVideo();
    }

    var onPlayerReady = function(event) {
        event.target.playVideo();
        $('#player iframe').css('opacity', 1);
        
    };

    var loadVideo = function(id){
        $('#player iframe').css('opacity', 0.3);
        app.sound('tv').volume = 0.4;
        setTimeout(function() {player.loadVideoById(id, 5, 'large');}, 500);
    };

    var setVolume = function(vol){
        player.setVolume(vol);
    };

    var setBrightness = function(val){
        $('#player iframe').css('opacity', val/100);
        app.sound('tv').volume = 1 - (val/100);

    };

    var setSaturation = function(val){
        //$('#player iframe').css('opacity', 'saturate(val+'%'));
    }

    return{
        prepare : prepare,
        load : loadVideo,
        volume:setVolume,
        brightness : setBrightness,
        saturation : setSaturation

    };

};

var Record = function ($) {

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

        prepare : function(){
            SC.whenStreamingReady(function () {
                setTimeout(function () {
                    SC.get('/playlists/2373914', function (playlist) {
                        if(playlist.artwork_url){$('.record label').css('background-image', 'url('+playlist.artwork_url+')');}
                        record.setTracks(playlist.tracks);
                        if(app.getCurrentPage() === 'audio'){record.init();}
                    }.bind(this));
                }.bind(this), 2200);

            }.bind(this));

            //Disable switch while loading
            //$('.switch > div').attr('disabled', 'disabled');

        },

        init: function () {


            //Re-eneable switch
            //$('.switch > div').removeAttr('disabled');

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
                record.armMoving = false;
                record.setPosition($(e.target).val(), 24, 75);
            });

            $('.slider').on({
                slide: function () {
                    record.armMoving = true;

                    $('.arm').css('-webkit-animation', 'none');
                    $('.arm').css('-webkit-transform', 'rotate(-' + $('.slider').val() + 'deg)');
                    $('.slider').css('-webkit-transform', 'rotate(-' + $('.slider').val() / 3 + 'deg)');
                },
                set: function () {

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
            app.playSoundEffect('end', true);

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
                    app.playSoundEffect('crackling', false);
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

        stop: function () {

            //Stop current sound if any
            try {
                soundObject.stop();
            } catch (err) { /*do nothing*/ }

        },

        initSoundcloud: this.initSoundcloud

    };
};

$(document).ready(function(){
    app.prepare();
});

window.addEventListener("load",function() {
    setTimeout(function() {
        window.scrollTo(0, 1);
    }, 0);
});

app = new App(jQuery);
record = new Record(jQuery);
television = new Television(jQuery);
contact = new Contact(jQuery);
app.load('audio', record.prepare);
