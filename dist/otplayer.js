/*! otplayer v1.0.0 */
(function(){
'use strict';

var oTplayer = function(opts){
    var that = this;
    
    this.container = opts.container;
    this.buttons = opts.buttons || {};
    this.skipTime = opts.skipTime || 1.5;
    this._rewindOnPlay = opts.rewindOnPlay || true;
    this._onReady = opts.onReady || function(){};
    this._onChange = opts.onChange || function(){};
    this._onDisableSpeedChange = opts.onDisableSpeedChange || function(){};
    this._setupSpeed(opts);
    
    this.source = opts.source;
    
    if (typeof this.source === 'undefined') {
        throw('must specify source (URL or file object) in config');
    }
    if (typeof this.container === 'undefined') {
        throw('must specify container element');
    }
    
    if (opts.startpoint) {
        this._startPoint = opts.startpoint;
    }
    
    this.paused = true;
    this._addClickEvents();

    if (this.source.indexOf && this.parseYoutubeURL(this.source)) {
        // youtube URL detected
        this.format = 'youtube';
        $('#player-time').hide();
        this._buildYoutube();
    } else {
        var url;
        if (this.source.indexOf) {
            // URL string detected
            url = this.source;
            if (this._isVideoFormat(url)) {
                this.format = 'video';
            } else {
                this.format = 'audio';
            }
            this.title = url.split('/')[url.split('/').length];
        } else {
            // assume file upload
            url = this._createObjectURL(this.source);
            if ( this.source.type.indexOf("video") > -1 ) {
                this.format = 'video';
            } else {
                this.format = 'audio';
            }
            this.title = this.source.name;
        }
        this._buildMediaElement(url);
        this._initProgressor();
    }
    if (this._startPoint) {
        this.skipTo(this._startPoint);
    }
    this._onReady();    
};

window.oTplayer = oTplayer;

oTplayer.prototype._setupSpeed = function(opts){

    this.speedMin = opts.speedMin || 0.5;
    this.speedMax = opts.speedMax || 2;
    this._setSpeedIncrement( opts.speedIncrement || 0.25 ); 
        
    if (this.buttons.speedSlider) {
        $(this.buttons.speedSlider)
        .attr('min',this.speedMin)
        .attr('max',this.speedMax);
    }
        
};


oTplayer.prototype._isVideoFormat = function(url){
    var urlSplt = url.split('.');
    var format = urlSplt[urlSplt.length-1];
    return !!format.match(/mov|mp4|avi|webm/);
};

oTplayer.prototype._setSpeedIncrement = function(incr){
    this.speedIncrement = incr;
    if (this.buttons.speedSlider) {
        this.buttons.speedSlider.setAttribute('step',incr);
    }
};

oTplayer.prototype._initProgressor = function(){
    if ((typeof Progressor !== 'undefined') && (this.format !== 'youtube')) {
        this.progressBar = new Progressor({
            media : this.element,
            bar : $('#player-hook')[0],
            text : this.title,
            time : $('#player-time')[0]
        });
    }
};

oTplayer.prototype._createObjectURL = function(file){
    if (window.webkitURL) {
        return window.webkitURL.createObjectURL(file);
    } else {
        return window.URL.createObjectURL(file);      
    }
};
oTplayer.prototype._buildMediaElement = function(url){
    this.element = document.createElement( this.format );
    this.element.src = url;
    this.element.id = 'oTplayerEl';
    if (this.format === 'video') {
        document.body.appendChild(this.element);
    } else {
        this.container.appendChild(this.element); 
    }
};
oTplayer.prototype.remove = function(){
    $(this.element).remove();
};
oTplayer.prototype.pause = function(){
    var playPauseButton = $(this.buttons.playPause);
    playPauseButton.removeClass('playing');
    if(this.format === 'youtube') {
        try {
            this._ytEl.pauseVideo();
        } catch (err) {
            //
        }
    } else if (this.element) {
        this.element.pause();
    }
    this.paused = true;
    this._onChange('pause');
};
oTplayer.prototype.play = function(){
    var playPauseButton = $(this.buttons.playPause);
    if (this._rewindOnPlay) {
        this.skip('backwards');
    }
    if(this.format === 'youtube') {
        try {
            this._ytEl.playVideo();
            this.paused = false;
            playPauseButton.addClass('playing');
        } catch(err) {
            //
        }
    } else if (this.element) {
        this.element.play();
        this.paused = false;
        playPauseButton.addClass('playing');
    }
    this._onChange('play');
};
oTplayer.prototype.playPause = function(){
    if (this.paused === false){
        this.pause();
    } else {
        this.play();
    }
};
oTplayer.prototype.skipTo = function(time){
    try {
        if (this.format === 'youtube') {
            this._ytEl.seekTo( time );
        } else {
           this.element.currentTime = time;
        }    
    } catch (err) {
        //
    }
    this._onChange('skipTo');
};
oTplayer.prototype.setTime = oTplayer.prototype.skipTo;
oTplayer.prototype.skip = function(direction){
    var mod = 1;
    if (direction === "backwards"){
        mod = -1;
    }
    this.skipTo( this.getTime() + (this.skipTime*mod) );
};
oTplayer.prototype.speed = function(newSpeed){
    var el = this.element;
    if (this.format === 'youtube') {
        el = this._ytEl;
    }
    var min = this.speedMin;
    var max = this.speedMax;
    var step = this.speedIncrement;
    
    var newSpeedNumber;
    var currentSpeed = this.getSpeed();
    if ((newSpeed === "up") && (currentSpeed < max)){
        newSpeedNumber = currentSpeed+step;
    } else if ((newSpeed === "down") && (currentSpeed > min)){
        newSpeedNumber = currentSpeed-step;
    } else if (newSpeed === "reset"){
        newSpeedNumber = 1;
    } else if (typeof newSpeed === 'number') {
        newSpeedNumber = newSpeed;
    }
    if (el && newSpeedNumber) {
       el.playbackRate = newSpeedNumber;
        if (el.setPlaybackRate) {
            el.setPlaybackRate(newSpeedNumber);
        }
        if (this.buttons.speedSlider) {
            this.buttons.speedSlider.value = newSpeedNumber;
        }
    }
    this._onChange('speed');
};
oTplayer.prototype.getSpeed = function(){
    if ((this.format === 'youtube') && this._ytEl && this._ytEl.getPlaybackRate) {
        return this._ytEl.getPlaybackRate();
    } else if (this.format === 'youtube'){
        return 1;
    }
    if (this.element) {
        return this.element.playbackRate;
    }
};
oTplayer.prototype.getTime = function(){
    var that = this;
    if ((this.format === 'youtube') && this._ytEl && this._ytEl.getCurrentTime) {
        return this._ytEl.getCurrentTime();
    } else if (this.element && this.element.currentTime) {
        return this.element.currentTime;
    }
    return 0;
};
oTplayer.prototype.getDuration = function(){
    if (this.element) {
        return this.element.duration;
    }
};

oTplayer.prototype.reset = function(){
    this._onChange = function(){};
    this.speed("reset");
    this.element = undefined;
    this._ytEl = undefined;
    if (this.progressBar) {
        try {
            this.progressBar.remove();
        } catch (err) {}
    }
    $('#oTplayerEl').remove();
    $('#player-time').show();
    $('#player-hook').removeClass('progressor media-title media-titleprogressor').empty();
};
oTplayer.prototype.remove = oTplayer.prototype.reset;

oTplayer.prototype._addClickEvents = function(){
    var that = this;
    var buttons = this.buttons;
    $(buttons.playPause).click(function(){
        that.playPause();
    });
    $(this.buttons.speedSlider).change(function(){
        that.speed(this.valueAsNumber);
    });
};


oTplayer.prototype.disableSpeedChange = function(){
    this.speed = function(){
        return false;
    };
    this.speedChangeDisabled = true;
    this._onDisableSpeedChange();
};





oTplayer.prototype._youtubeReady = function(){
    var that = this;
    
    var videoId = this.parseYoutubeURL(this.source);
    this._ytEl = new YT.Player('oTplayerEl', {
        width: '100%',
        videoId: videoId,
        playerVars: {
            // controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1
        },
        events: {
            'onReady': this._youtubeReadyPartTwo.bind(this),
            'onStateChange': updatePause
        }
    });
    
    this._setYoutubeTitle(videoId);
        
    // YouTube embeds can't do 0.25 increments
    if (this.buttons.speedSlider) {
        this._setSpeedIncrement(0.5);
    }
    
    function updatePause (ev){
        var status = ev.data;
        if (status === 2) {
            that.paused = true;
        } else {
            that.paused = false;
        }
    }
    
};

oTplayer.prototype._youtubeReadyPartTwo = function(){
    // fix non-responsive keyboard shortcuts bug
    $(this.buttons.speedSlider).val(0.5).change().val(1).change();
    
    // Some YouTube embeds only support normal speed
    if (this._ytEl.getAvailablePlaybackRates()[0] === 1) {
        this.disableSpeedChange();
    }
    
    this.element.duration = this._ytEl.getDuration();
    this._onReady();
    

    var that = this;
    
    setTimeout(function(){
        // kickstart youtube
        that.play();
        setTimeout(function(){
            that.pause();
            if (this._startPoint) {
                setTimeout(function(){
                    that.seekTo( this._startPoint );
                },500);
            }
        },500);
        
    },1000);

};


oTplayer.prototype._buildYoutube = function(url){
    var that = this;
    this.url = url;
    
    this.element = document.createElement('div');
    this.element.setAttribute('id','oTplayerEl');
    document.body.appendChild(this.element); 
        
    // import YouTube API
    if ( window.YT === undefined ) {
        var tag = document.createElement('script');
        tag.setAttribute('id','youtube-script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        this._youtubeReady();
    }
    window.onYouTubeIframeAPIReady = this._youtubeReady.bind(this);        
};

oTplayer.prototype.parseYoutubeURL = function(url){
    if (url.match) {
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match&&match[2].length===11){
            return match[2];
        }
    }
    return false;
};
oTplayer.parseYoutubeURL = oTplayer.prototype.parseYoutubeURL;

oTplayer.prototype._setYoutubeTitle = function(id){
    var url = 'http://gdata.youtube.com/feeds/api/videos/'+id+'?v=2&alt=json-in-script&callback=?';
    $.ajax({
       type: 'GET',
        url: url,
        async: false,
        jsonpCallback: 'jsonCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(d) {
            var title = '[YouTube] '+d.entry.title.$t;
            this.title = title;
            $('#player-hook').html(title).addClass('media-title');
        },
        error: function(e){
            console.log(e);
        }
    });
};
}());