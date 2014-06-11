"use strict";var app,record,television;$(function(){$("a[href*=#]:not([href=#])").on("click",function(){var a,b=this.hash.slice(1);switch(b){case"audio":"audio"!==app.currentPage&&app.playSoundEffect("end",!0),a=record.prepare;break;case"video":record.stop(),a=television.prepare;break;case"contact":record.stop(),a=function(){}}app.load(b,a)})});var App=function(a){var b={crackling:new Audio("../sounds/needle.ogg"),end:new Audio("../sounds/endloop.ogg"),channel:new Audio("../sounds/btn.ogg")};return{playSoundEffect:function(a,c){b[a].loop=c,b[a].play()},stopAllSounds:function(){for(var a in b)b[a].pause()},getCurrentPage:function(){return this._currentPage},init:function(a){var b=a;b()},load:function(b,c){app._initMethod=c,a.ajax({context:this,dataType:"html",url:"templates/"+b+".html",success:function(b){a("#wrapper").html(b),app.init(c)}})}}},Television=function(a){function b(){}var c=document.createElement("script");c.src="https://www.youtube.com/iframe_api";var d=document.getElementsByTagName("script")[0];d.parentNode.insertBefore(c,d);var e,f=!1,g=function(){a("ul.channels li").on("click",function(b){var c=a(b.target).closest("li"),d=c.find("a");c.find("a").data("id")&&(k(d.data("id")),app.playSoundEffect("channel",!1),c.siblings().find("a").removeClass("active"),d.addClass("active")),b.preventDefault()}),a(".sliders div").each(function(b,c){a(c).css("height",a(".sliders").outerHeight()),a(c).noUiSlider({start:100,direction:"rtl",orientation:"vertical",handles:1,range:{min:0,max:100}}).on({slide:function(b){"function"==typeof television[a(b.target).data("control")]&&television[a(b.target).data("control")](a(this).val())},set:function(b){"function"==typeof television[a(b.target).data("control")]&&television[a(b.target).data("control")](a(this).val())}})})},h=function(){e=new YT.Player("iframe",{height:"390",width:"640",volume:100,videoId:"-6phZtbBFRk",events:{onReady:j,onStateChange:i}}),g()},i=function(c){c.data!==YT.PlayerState.PLAYING||f||(setTimeout(b,6e3),f=!0),f&&a("#player iframe").css("opacity",1)},j=function(b){b.target.playVideo(),a("#player iframe").css("opacity",1)},k=function(b){a("#player iframe").css("opacity",.3),setTimeout(function(){e.loadVideoById(b,5,"large")},500)},l=function(a){e.setVolume(a)},m=function(b){a("#player iframe").css("opacity",b/100)};return{prepare:h,load:k,volume:l,brightness:m}},Record=function(a){var b,c=[],d=0,e=0,f=0;return{getCurrentTrack:function(){return c[e]},setCurrentTrack:function(a){e=a},setTracks:function(a){c=a,d=0,c.forEach(function(a){d+=a.duration}),this.setLabel()},setLabel:function(){var b="",d=1;c.forEach(function(a){b+="<br>",b+=d++ +". ",b+=a.title.substr(0,a.title.indexOf(" -"))}),a(".record").find(".title").html(b)},onPosition:function(){var a=f+b.position;this.setArmRotation(a/d)},setArmRotation:function(b){var c=51*(1-b);a(".slider").val(c+24,!0)},prepare:function(){SC.whenStreamingReady(function(){setTimeout(function(){SC.get("/playlists/2373914",function(a){record.setTracks(a.tracks)}.bind(this))}.bind(this),2200)}),a(".slider").noUiSlider({start:24,handles:1,range:{min:24,max:75}}),a(".slider").change(function(b){record.armMoving=!1,record.setPosition(a(b.target).val(),24,75)}),a(".slider").on({slide:function(){record.armMoving=!0,a(".arm").css("-webkit-animation","none"),a(".arm").css("-webkit-transform","rotate(-"+a(".slider").val()+"deg)"),a(".slider").css("-webkit-transform","rotate(-"+a(".slider").val()/3+"deg)")},set:function(){a(".arm").css("-webkit-transform","rotate(-"+a(".slider").val()+"deg)")}}),a(".arm").css("-webkit-animation","wobblearm 4.3s infinite"),a(".record").css("-webkit-animation","rotating 4.3s linear infinite"),app.playSoundEffect("end",!0)},setPosition:function(a,g,h){var i,j=1-(a-g)/(h-g),k=d*j,l=0,m=0,n=!1;c.forEach(function(a){n||(l+=a.duration,l>k?(i=k-(l-a.duration),f=l-a.duration,n=!0):m++)}),b&&b.playState>0&&e===m?b.setPosition(i):(e=m,this.playCurrentTrack(i))},next:function(){f+=c[e].duration;try{b.stop()}catch(a){}e>=c.length-1||(e++,this.playCurrentTrack(0))},playCurrentTrack:function(a){try{b.stop()}catch(c){}this.getCurrentTrack()&&"undefined"!==this.getCurrentTrack()&&SC.stream("/tracks/"+this.getCurrentTrack().id,{whileplaying:function(){!record.armMoving&&b.loaded&&this.onPosition()}.bind(this),autoLoad:!0},function(c){b=c,app.playSoundEffect("crackling",!1),b.setVolume(0),b.play({onload:function(){b.setVolume(90),b.setPosition(a)},onfinish:function(){record.next()}})}.bind(this))},stop:function(){try{b.stop()}catch(a){}},initSoundcloud:this.initSoundcloud}};$(document).ready(function(){}),app=new App(jQuery),record=new Record(jQuery),television=new Television(jQuery),app.load("audio",record.prepare);