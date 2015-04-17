'use strict';

var app;

var App = function ($) {

    var _currentPage = 'menu';

    var soundEffects = {
        crackling: new Audio('sounds/needle.mp3'),
        end: new Audio('sounds/endloop.mp3'),
        channel: new Audio('sounds/btn.mp3'),
        dial: new Audio('sounds/dial_short.mp3'),
        dialBack: new Audio('sounds/dialback.mp3'),
        dialEnd: new Audio('sounds/dialend.mp3'),
        tv: new Audio('sounds/tv.mp3'),
        wrongnumber: new Audio('sounds/wrongnumber.mp3'),
        dialtone: new Audio('sounds/dialtone.mp3'),
        answer: new Audio('sounds/answer.mp3')
    };

    var pages = [];

    var pageIndexes = [];

    return{

        pages : pages,

        /**
         * Play a sound effect
         * @param {String} key
         * @param {Boolean} loop
         * @return {Audio} sound
        */
        playSoundEffect: function (key, loop) {
            //soundEffects[key].stop();
            soundEffects[key].loop = loop;
            soundEffects[key].play();

            return soundEffects[key];
        },

        addPage : function(name, instance){
            pages[name] = instance;
            pageIndexes.push(name);
        },

        showLoading : function(){

        },

        hideLoading: function(){

        },

        /**
         * Stop all sounds
        */
        stopAllSounds: function () {

            for (var key in soundEffects) {
                soundEffects[key].pause();
            }
        },

        /**
         * Retrieve a soundeffect from the sfx-library
         * @param {String} key
         * @return {Audio} sound
        */
        sound : function(key){
            return soundEffects[key];
        },

        /**
         * Setup app event handlers
        */
        prepare : function(){

            this.load('menu');

            if(Modernizr.touch) {
            
                $('#init').remove();
                this.load('menu');
            
            }else{
                
                $('#init').on('touchstart, click', function(e){
                    
                    e.preventDefault();

                    var myContext = new AudioContext();

                    // create new buffer source for playback with an already
                    // loaded and decoded empty sound file
                    var source = myContext.createBufferSource();
                    source.buffer = myDecodedBuffer;

                    // connect to output (your speakers)
                    source.connect(myContext.destination);

                    // play the file
                    source.noteOn(0);

                    //this.stopAllSounds();
                    $('#init').remove();
                    this.load('record');

                }.bind(this));
            }

            //Setup page shifting switch-slider and handle it´s events
            /*$('.switch > div').noUiSlider({

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
                //While the slider is dragged
                slide: function (e) {
                    var index = parseInt(Math.floor($(this).val()));
                    app.load(pageIndexes[index]);

                },
                //When the slider has moved by a click
                set: function (e) {
                    if(typeof(app.pages['television'][$(e.target).data('control')]) === 'function'){
                        app.pages['television'][$(e.target).data('control')]($(this).val());
                    }
                }
            });*/

            //Click event handler for changeing app module/page with switch's links.
            $('body').on('click', 'a[href*=#]:not([href=#])',function (e) {

                app.playSoundEffect('channel', false);

                var target = this.hash.slice(1);

                app.load(target);

                $('.switch > div').val($(this).data('index'));

                e.preventDefault();

            });
        },

        /**
         * Retrieve the current page as a string
         * @return {String} page
        */
        getCurrentPage: function () {
            return _currentPage;
        },

        /**
         * Load a page and init it's module
         * @param {String} part
        */
        load : function(part){

            ga('send', 'event', 'app', 'loadPage', part);

            this.showLoading();

            $.ajax({

                context: this,
                dataType : 'html',
                url : 'pages/'+part+'.html',

                success : function(page) {

                    this.hideLoading();

                    //Try to unload the current module
                    if(typeof(this.pages[_currentPage].unload) === 'function'){
                        this.pages[_currentPage].unload();
                    }

                    //Add the loaded content to the page container
                    $('#wrapper').html(page);

                    //Update the app-modules current page reference
                    _currentPage = part;

                    //Stop all sounds that might be active
                    this.stopAllSounds();

                    //Init the module's prepare method
                    this.pages[part].prepare();

                }.bind(this)
            });
        }
    };
};

var Menu = function ($) {

    return{
        prepare:function(){

        }
    }

}

var Contact = function ($) {

    var maxrot,
        instance,
        numberToCall = '',
        currentItem,
        hasAnswered = false,
        calling = false;

    var links = [
        ['+46(0)708-138138','tel:0708138138','_self'],
        ['hey@riverside.com','mailto:hey@riverside.com','_blank'],
        ['Youtube','http://youtube.com/user/riversidesoc','_blank'],
        ['Soundcloud','http://soundcloud.com/riverside-society','_blank'],
        ['Twitter','http://twitter.com/riversidesoc','_blank'],
        ['Facebook','','_blank'],
        ['Instagram','http://instagram.com/riversidesociety','_blank']
    ];

    /**
     * Reveals all contact information
    */
    var answerPhone = function(){

        calling = false;

        app.playSoundEffect('answer',false);

        numberToCall = '';

        //Used to tell if dialing should add number or show contact info
        hasAnswered = true;

        //Makes sure icons are shown instead of numbers
        $('.ring').addClass('active');

        try{app.pages['contact'].instance.enable();}catch(err){}

    };

    /**
     * Go into calling mode when correct number has been dialed
    */
    var doCall = function(){

        calling = true;

        app.pages['contact'].instance.disable();

        app.playSoundEffect('dialtone', true);

        var wait = Math.random()*5000 + 3000;

        ga('send', 'event', 'contact', 'calling', 'wait', wait);

        //Call for a random amount of seconds before answer
        setTimeout(function() {
            if(app.getCurrentPage() === 'contact'){
                app.stopAllSounds();
                answerPhone();
            }
        }, wait);
    };

    /**
     * Show contact link when a dial has been made
    */
    var getContactLink = function(){

        //Get the index of the dialed item
        var index = $(currentItem).index();

        ga('send', 'event', 'contact', 'link', links[index][0]);

        //Generate a link with the indexed link information
        var $link = $('<a/>', {
            'href' : links[index][1],
            'target' : links[index][2],
            text : links[index][0]
        });

        //Show contact link
        //$('.note').html($link);

        window.location = links[index][1];
    };

    /**
     * Add the dialed number to number to call, and perform a number check
    */
    var saveNumber = function(){

        if(hasAnswered){
            return;
        }

        numberToCall += currentItem.text();

        checkNumber(numberToCall);

        $('.note').text(numberToCall);
    };

    /**
     * Check total number and call if correct, otherwise reset
    */
    var checkNumber = function(number){

        ga('send', 'event', 'contact', 'number', number);

        if(number.length >= 5){
            if(number === window.contactCode){
                app.pages['contact'].instance.disable();
                doCall();
            }else{
                app.playSoundEffect('wrongnumber', false);
                numberToCall = '';
                ga('send', 'event', 'contact', 'wrongnumber', number);
            }
        }
    };

    /**
     * Store a reference to curren dial-item
    */
    var setCurrentItem = function(item){
        currentItem = item;
    };

    return{

        /**
         * Init the phone
        */
        prepare : function(){

            var self = this;
            numberToCall = '';
            hasAnswered = false;
            calling = false;

            answerPhone();

            //Creates the Draggable (GSAP) instance
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

                    app.pages['contact'].instance = this;

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

                    //Play dragsound on measurable movement (prevent from fire if only pressed)
                    if(this.rotation > 10){
                        app.playSoundEffect('dial',false);
                    }

                    //Force ring into dragEnd when these criterias are filled
                    if(this.rotation === this.maxRotation && (e.type === 'mousemove' || e.type === 'touchmove')){

                        app.pages['contact'].instance.disable();

                        //Add number or get contect link
                        if(hasAnswered){
                            getContactLink();
                        }else{
                            saveNumber();
                        }

                    }
                },

                onDragEnd:function(e) {

                    //Rollback and disable if any of these rules are met
                    if(e.target.nodeName === 'DIV' || e.target.nodeName === 'UL' || e.target.nodeName === 'LI'){
                        app.pages['contact'].instance.disable();
                    }else{
                        this.kill();
                    }

                    //Cache the ring
                    var $target = $('.ring');

                    app.stopAllSounds();
                    app.playSoundEffect('dialBack',false);

                    //Rollback animation. Length is depending on which item that was dragged
                    TweenMax.to($target, maxrot/400, {rotation:0, onComplete:function(){

                        app.playSoundEffect('dialEnd',false);

                        //When rollback completed, enable the Draggable instance again
                        if(!calling){app.pages['contact'].instance.enable();}

                    }});
                }
            });
        }
    };

};

var Television = function ($) {

    //Inject youtube api
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    var currentPlaylist = [], playlists = [];
    var currentVideoIndex;
    var done = false;

    var init = function(){

        currentVideoIndex = 0;

        if(!player){

            player = new YT.Player('iframe', {
            
                'height': '390',
                'width': '640',
                'autoplay': 0,
                'controls': 0,
                'enablejsapi': 1,
                'playsinline': 1,
                'showinfo': 0,
                'volume':100,
                'videoId': currentPlaylist[currentVideoIndex],
                'events': {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });

        }else{

            loadVideo(currentPlaylist[currentVideoIndex]);
        }

    };

    /**
     * Get youtube feed data for a specified playlist ID and store videos in playlist array
     * @param {String} key
     * @return {Audio} sound
    */
    var loadPlaylistTracks = function(playlistID){

        ga('send', 'event', 'television', 'loadPlaylist', playlistID);

        var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/'+ playlistID +'?playsinline&v=2&alt=json&callback=?';

        //Retrieve the items from the requested playlist ID.
        $.getJSON(playListURL, function(data) {

            //Empty current playlist
            currentPlaylist = [];

            $.each(data.feed.entry, function(i, item) {

                var feedTitle = item.title.$t;
                var feedURL = item.link[1].href;
                var fragments = feedURL.split('/');
                var videoID = fragments[fragments.length - 2];
                //var url = videoURL + videoID;
                var thumb = 'http://img.youtube.com/vi/'+ videoID +'/default.jpg';

                //Store ID parameter in playlist array
                currentPlaylist.push(videoID);

            });

            init();

        });

    };

    var getPlaylists = function(user){

        var userPlaylistsUrl = 'https://gdata.youtube.com/feeds/api/users/' + user + '/playlists?v=2&alt=json&callback=?';

        //Retrieve the playlists from the requested user ID.
        $.getJSON(userPlaylistsUrl, function(data) {

            var channels_html = '';

            $.each(data.feed.entry, function(i, item) {

                var playlistID = item.yt$playlistId.$t;

                //Store playlist ID parameter in playlists array
                playlists.push(playlistID);

                //Generate channel-button
                if (playlistID !='videos') {
                    channels_html += '<li><a href="" data-id="' + playlistID + '"></a></li>';
                }

                /*var $channels = $('ul.channels');
                $channels.find('li:first a').addClass('active');
                $channels.append('');*/

            });

            $(channels_html).prependTo('ul.channels');

            $('ul.channels li:eq(0) a').addClass('active');

            loadPlaylistTracks(playlists[0]);

        });

    };

    var prepare = function(playlistID){

        app.playSoundEffect('tv',true);
        app.sound('tv').volume = 0;

        player = null;

        //Retrieve all the user's playlists
        getPlaylists('riversidesoc');

        $('.controls .prev').on('click', function(e){
            e.preventDefault();
            prevVideo();
        });

        $('.controls .next').on('click', function(e){
            e.preventDefault();
            nextVideo();
        });

        $('.channels').on('click','li', function(e){

            e.preventDefault();

            var $target = $(e.target).closest('li'),
                $link = $target.find('a'),
                $channels = $('.channels');

            if($target.find('a').data('id')){

                var playlistID =$link.data('id');

                loadPlaylistTracks(playlistID);

                app.playSoundEffect('channel',false);

                $target.siblings().find('a').removeClass('active');
                $link.addClass('active');

            }else{

                //Event trigger is probably the onoff-button

                ga('send', 'event', 'television', 'turnoff', currentPlaylist[currentVideoIndex]);

                player.stopVideo();

                currentPlaylist = [];

                app.playSoundEffect('channel',false);

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

                    if(typeof(app.pages['television'][$(e.target).data('control')]) === 'function'){
                        app.pages['television'][$(e.target).data('control')]($(this).val());
                    }

                },
                set: function (e) {
                    if(typeof(app.pages['television'][$(e.target).data('control')]) === 'function'){
                        app.pages['television'][$(e.target).data('control')]($(this).val());
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
            nextVideo();
        }

        if(done){
            $('#player iframe').css('opacity', 1);
            app.sound('tv').volume = 0;
        }

    };

    function prevVideo(){

        ga('send', 'event', 'television', 'skipToNext', currentPlaylist[currentVideoIndex]);

        if(currentVideoIndex > 0){
            currentVideoIndex--;
        }else{
            currentVideoIndex = currentPlaylist.length - 1;
        }

        loadVideo(currentPlaylist[currentVideoIndex]);
    }

    function nextVideo(){

        if(currentVideoIndex < currentPlaylist.length - 1){
            currentVideoIndex++;
        }else{
            currentVideoIndex = 0;
        }

        loadVideo(currentPlaylist[currentVideoIndex]);
    }

    function stopVideo() {
        //this.player.stopVideo();
    }

    var onPlayerReady = function(event) {
        //event.target.playVideo();
        $('#player iframe').css('opacity', 1);
        
    };

    var loadVideo = function(id){

        ga('send', 'event', 'television', 'load', id);

        if(currentPlaylist.length > 0){
            $('#player iframe').css('opacity', 0.3);
            app.sound('tv').volume = 0.4;
            setTimeout(function() {player.loadVideoById(id, 5, 'large');}, 500);
        }

    };

    var setVolume = function(vol){
        player.setVolume(vol);
    };

    var setBrightness = function(val){
        if(currentPlaylist.length > 0){
            $('#player iframe').css('opacity', val/100);
            app.sound('tv').volume = 1 - (val/100);
        }

    };

    var setSaturation = function(val){
        //$('#player iframe').css('opacity', 'saturate(val+'%'));
    };

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

    var sounds = [];

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

                        if(playlist.artwork_url){
                            $('.record label').css('background-image', 'url('+playlist.artwork_url+')');
                        }

                        var totalsounds = playlist.tracks.length;

                        playlist.tracks.forEach(function(track){
                            SC.stream('/tracks/' + track.id, 
                                {
                                    autoLoad:true, 
                                    


                                }, 
                                
                                function(sound){
                                    sounds.push(sound);
                                    //console.log('pushed a sound.', totalsounds === sounds.length);

                                    //All tracks loaded && the current page hasn't been changed
                                    if(totalsounds === sounds.length && app.getCurrentPage() === 'record'){
                                        app.pages['record'].init();
                                    }


                                });
                        });



                        tracks = playlist.tracks;
                        totalTime = 0;

                        tracks.forEach(function (track) {
                            totalTime += track.duration;
                        });

                        this.setLabel();

                        //app.pages['record'].setTracks(playlist.tracks);

                        

                    }.bind(this));
                }.bind(this), 2200);

            }.bind(this));


        },

        init: function () {

            $('.slider').noUiSlider({

                start: 24,
                handles: 1,
                range: {
                    'min': 24,
                    'max': 75
                }

            });

            $('.slider').change(function (e) {

                app.pages['record'].armMoving = false;
                app.pages['record'].setPosition($(e.target).val(), 24, 75);

            }.bind(this));

            $('.slider').on({
                slide: function () {
                    app.pages['record'].armMoving = true;

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

            ga('send', 'event', 'record', 'setPosition', this.getCurrentTrack().id + ' (' + localTargetTime + ')');

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
                $('.arm').css('-webkit-animation', 'wobblearm 4.3s infinite');
            } else {
                currentTrack++;
                this.playCurrentTrack(0);
            }

            ga('send', 'event', 'record', 'next', this.getCurrentTrack().id);


        },

        playCurrentTrack: function (position) {

            //Stop current sound if any
            try {
                soundObject.stop();
            } catch (err) { /*do nothing*/ }

            soundObject = sounds[currentTrack];

            app.stopAllSounds();
            app.playSoundEffect('crackling', false);

            soundObject.play({

                whileplaying: function () {

                    if (!app.pages['record'].armMoving && soundObject.loaded) {
                        app.pages.record.onPosition();
                    }

                },
                onload: function () {

                    soundObject.setVolume(100);
                    soundObject.setPosition(position);

                },
                onfinish: function () {

                    this.next();

                }.bind(this)
            });

            /*if (this.getCurrentTrack() && this.getCurrentTrack() !== 'undefined') {

                //Load the track
                SC.stream('/tracks/' + this.getCurrentTrack().id, {
                    whileplaying: function () {
                        if (!app.pages['record'].armMoving && soundObject.loaded) {
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
                            console.log(this);
                            this.next();
                        }.bind(this)
                    });
                }.bind(this));
            }*/

        },

        unload: function () {

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

app = new App(jQuery);
app.addPage('menu', new Menu(jQuery));
app.addPage('record', new Record(jQuery));
//app.addPage('television', new Television(jQuery));
app.addPage('contact', new Contact(jQuery));
