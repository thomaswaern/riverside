"use strict";var app,App=function(a){var b="record",c={crackling:new Audio("sounds/needle.ogg"),end:new Audio("sounds/endloop.ogg"),channel:new Audio("sounds/btn.ogg"),dial:new Audio("sounds/dial_short.ogg"),dialBack:new Audio("sounds/dialback.ogg"),dialEnd:new Audio("sounds/dialend.ogg"),tv:new Audio("sounds/tv.ogg"),wrongnumber:new Audio("sounds/wrongnumber.ogg"),dialtone:new Audio("sounds/dialtone.ogg"),answer:new Audio("sounds/answer.ogg")},d=[],e=[];return{pages:d,playSoundEffect:function(a,b){return c[a].loop=b,c[a].play(),c[a]},addPage:function(a,b){d[a]=b,e.push(a)},stopAllSounds:function(){for(var a in c)c[a].pause()},sound:function(a){return c[a]},prepare:function(){a(".switch > div").noUiSlider({start:0,orientation:"vertical",handles:1,step:1,behaviour:"extend-tap",range:{min:0,max:2}}).on({slide:function(){var b=parseInt(Math.floor(a(this).val()));app.load(e[b])},set:function(b){"function"==typeof app.pages.television[a(b.target).data("control")]&&app.pages.television[a(b.target).data("control")](a(this).val())}}),a("a[href*=#]:not([href=#])").on("click",function(b){var c=this.hash.slice(1);app.load(c),a(".switch > div").val(a(this).data("index")),b.preventDefault()})},getCurrentPage:function(){return b},load:function(c){a.ajax({context:this,dataType:"html",url:"pages/"+c+".html",success:function(d){"function"==typeof this.pages[b].unload&&this.pages[b].unload(),a("#wrapper").html(d),b=c,this.stopAllSounds(),this.pages[c].prepare()}.bind(this)})}}},Contact=function(a){var b,c,d="",e=!1,f=!1,g=[["+46(0)708-138138","tel:0708138138","_self"],["hey@riverside.com","mailto:hey@riverside.com","_blank"],["Youtube","http://youtube.com/user/riversidesoc","_blank"],["Soundcloud","http://soundcloud.com/riverside-society","_blank"],["Twitter","http://twitter.com/riversidesoc","_blank"],["Facebook","","_blank"],["Instagram","http://instagram.com/riversidesociety","_blank"]],h=function(){f=!1,app.playSoundEffect("answer",!1),d="",e=!0,a(".ring").addClass("active"),app.pages.contact.instance.enable()},i=function(){f=!0,app.pages.contact.instance.disable(),app.playSoundEffect("dialtone",!0),setTimeout(function(){"contact"===app.getCurrentPage()&&(app.stopAllSounds(),h())},1e4*Math.random()+3e3)},j=function(){var b=a(c).index(),d=a("<a/>",{href:g[b][1],target:g[b][2],text:g[b][0]});a(".note").html(d)},k=function(){e||(d+=c.text(),l(d),a(".note").text(d))},l=function(a){a.length>=5&&(a===window.contactCode?(app.pages.contact.instance.disable(),i()):(app.playSoundEffect("wrongnumber",!1),d=""))},m=function(a){c=a};return{prepare:function(){d="",e=!1,f=!1,Draggable.create(".ring",{type:"rotation",trigger:".ring .links",dragResistance:0,bounds:{minRotation:0,maxRotation:0},throwProps:!1,onPress:function(c){app.pages.contact.instance=this,"LI"!==c.target.nodeName?b=0:(b=29*a(c.target).index()+55,m(a(c.target))),this.applyBounds({minRotation:0,maxRotation:b})},onDrag:function(a){this.rotation>10&&app.playSoundEffect("dial",!1),this.rotation!==this.maxRotation||"mousemove"!==a.type&&"touchmove"!==a.type||(app.pages.contact.instance.disable(),e?j():k())},onDragEnd:function(c){"DIV"===c.target.nodeName||"UL"===c.target.nodeName||"LI"===c.target.nodeName?app.pages.contact.instance.disable():this.kill();var d=a(".ring");app.stopAllSounds(),app.playSoundEffect("dialBack",!1),TweenMax.to(d,b/400,{rotation:0,onComplete:function(){app.playSoundEffect("dialEnd",!1),f||app.pages.contact.instance.enable()}})}})}}},Television=function(a){function b(){h>0?h--:h=i.length-1,r(i[h])}function c(){h<i.length-1?h++:h=0,r(i[h])}function d(){}var e=document.createElement("script");e.src="https://www.youtube.com/iframe_api";var f=document.getElementsByTagName("script")[0];f.parentNode.insertBefore(e,f);var g,h,i=[],j=[],k=!1,l=function(){h=0,g?r(i[h]):g=new YT.Player("iframe",{height:"390",width:"640",volume:100,videoId:i[h],events:{onReady:q,onStateChange:p}})},m=function(b){var c="http://gdata.youtube.com/feeds/api/playlists/"+b+"?v=2&alt=json&callback=?";a.getJSON(c,function(b){i=[],a.each(b.feed.entry,function(a,b){var c=(b.title.$t,b.link[1].href),d=c.split("/"),e=d[d.length-2];i.push(e)}),l()})},n=function(b){var c="https://gdata.youtube.com/feeds/api/users/"+b+"/playlists?v=2&alt=json&callback=?";a.getJSON(c,function(b){var c="";a.each(b.feed.entry,function(a,b){var d=b.yt$playlistId.$t;j.push(d),"videos"!=d&&(c+='<li><a href="" data-id="'+d+'"></a></li>')}),a(c).prependTo("ul.channels"),a("ul.channels li:eq(0) a").addClass("active"),m(j[0])})},o=function(){app.playSoundEffect("tv",!0),app.sound("tv").volume=0,g=null,n("riversidesoc"),a(".controls .prev").on("click",function(a){a.preventDefault(),b()}),a(".controls .next").on("click",function(a){a.preventDefault(),c()}),a(".channels").on("click","li",function(b){b.preventDefault();var c=a(b.target).closest("li"),d=c.find("a"),e=a(".channels");if(c.find("a").data("id")){var f=d.data("id");m(f),app.playSoundEffect("channel",!1),c.siblings().find("a").removeClass("active"),d.addClass("active")}else g.stopVideo(),i=[],app.playSoundEffect("channel",!1),e.find("a").removeClass("active"),e.find("li:last a").addClass("active")}),a(".sliders div").each(function(b,c){a(c).css("height",a(".sliders").outerHeight()),a(c).noUiSlider({start:100,direction:"rtl",orientation:"vertical",handles:1,range:{min:0,max:100}}).on({slide:function(b){"function"==typeof app.pages.television[a(b.target).data("control")]&&app.pages.television[a(b.target).data("control")](a(this).val())},set:function(b){"function"==typeof app.pages.television[a(b.target).data("control")]&&app.pages.television[a(b.target).data("control")](a(this).val())}})})},p=function(b){b.data!==YT.PlayerState.PLAYING||k||(setTimeout(d,6e3),k=!0),b.data===YT.PlayerState.ENDED&&c(),k&&(a("#player iframe").css("opacity",1),app.sound("tv").volume=0)},q=function(b){b.target.playVideo(),a("#player iframe").css("opacity",1)},r=function(b){i.length>0&&(a("#player iframe").css("opacity",.3),app.sound("tv").volume=.4,setTimeout(function(){g.loadVideoById(b,5,"large")},500))},s=function(a){g.setVolume(a)},t=function(b){i.length>0&&(a("#player iframe").css("opacity",b/100),app.sound("tv").volume=1-b/100)},u=function(){};return{prepare:o,load:r,volume:s,brightness:t,saturation:u}},Record=function(a){var b,c=[],d=0,e=0,f=0;return{getCurrentTrack:function(){return c[e]},setCurrentTrack:function(a){e=a},setTracks:function(a){c=a,d=0,c.forEach(function(a){d+=a.duration}),this.setLabel()},setLabel:function(){var b="",d=1;c.forEach(function(a){b+="<br>",b+=d++ +". ",b+=a.title.substr(0,a.title.indexOf(" -"))}),a(".record").find(".title").html(b)},onPosition:function(){var a=f+b.position;this.setArmRotation(a/d)},setArmRotation:function(b){var c=51*(1-b);a(".slider").val(c+24,!0)},prepare:function(){SC.whenStreamingReady(function(){setTimeout(function(){SC.get("/playlists/2373914",function(b){b.artwork_url&&a(".record label").css("background-image","url("+b.artwork_url+")"),app.pages.record.setTracks(b.tracks),"record"===app.getCurrentPage()&&app.pages.record.init()}.bind(this))}.bind(this),2200)}.bind(this))},init:function(){a(".slider").noUiSlider({start:24,handles:1,range:{min:24,max:75}}),a(".slider").change(function(b){app.pages.record.armMoving=!1,app.pages.record.setPosition(a(b.target).val(),24,75)}),a(".slider").on({slide:function(){app.pages.record.armMoving=!0,a(".arm").css("-webkit-animation","none"),a(".arm").css("-webkit-transform","rotate(-"+a(".slider").val()+"deg)"),a(".slider").css("-webkit-transform","rotate(-"+a(".slider").val()/3+"deg)")},set:function(){a(".arm").css("-webkit-transform","rotate(-"+a(".slider").val()+"deg)")}}),a(".arm").css("-webkit-animation","wobblearm 4.3s infinite"),a(".record").css("-webkit-animation","rotating 4.3s linear infinite"),app.playSoundEffect("end",!0)},setPosition:function(a,g,h){var i,j=1-(a-g)/(h-g),k=d*j,l=0,m=0,n=!1;c.forEach(function(a){n||(l+=a.duration,l>k?(i=k-(l-a.duration),f=l-a.duration,n=!0):m++)}),b&&b.playState>0&&e===m?b.setPosition(i):(e=m,this.playCurrentTrack(i))},next:function(){f+=c[e].duration;try{b.stop()}catch(d){}e>=c.length-1?a(".arm").css("-webkit-animation","wobblearm 4.3s infinite"):(e++,this.playCurrentTrack(0))},playCurrentTrack:function(a){try{b.stop()}catch(c){}this.getCurrentTrack()&&"undefined"!==this.getCurrentTrack()&&SC.stream("/tracks/"+this.getCurrentTrack().id,{whileplaying:function(){!app.pages.record.armMoving&&b.loaded&&this.onPosition()}.bind(this),autoLoad:!0},function(c){b=c,app.playSoundEffect("crackling",!1),b.setVolume(0),b.play({onload:function(){b.setVolume(90),b.setPosition(a)},onfinish:function(){console.log(this),this.next()}.bind(this)})}.bind(this))},unload:function(){try{b.stop()}catch(a){}},initSoundcloud:this.initSoundcloud}};$(document).ready(function(){app.prepare()}),app=new App(jQuery),app.addPage("record",new Record(jQuery)),app.addPage("television",new Television(jQuery)),app.addPage("contact",new Contact(jQuery)),app.load("record");