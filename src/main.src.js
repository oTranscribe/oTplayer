
var oTplayer = function(opts){
    var that = this;
    
    this.container = opts.container;
    this.buttons = opts.buttons || {};
    this.skipTime = opts.skipTime || 1.5;
    this._rewindOnPlay = opts.rewindOnPlay || true;
    this._onReady = opts.onReady || function(){};
    this._onChange = opts.onChange || function(){};
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
            this.format = 'audio';
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

oTplayer.prototype._setSpeedIncrement = function(incr){
    this.speedIncrement = incr;
    if (this.buttons.speedSlider) {
        this.buttons.speedSlider.setAttribute('step',incr);
    }
};

oTplayer.prototype._initProgressor = function(){
    if (typeof Progressor !== 'undefined') {
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
    this.container.appendChild(this.element); 
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
    } else {
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
    playPauseButton.addClass('playing');
    if(this.format === 'youtube') {
        try {
            this._ytEl.playVideo();
        } catch(err) {
            //
        }
    } else {
        this.element.play();
    }
    this.paused = false;
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
    this.skipTo( this.element.currentTime + (this.skipTime*mod) );
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
    var currentSpeed = this.element.playbackRate;
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
oTplayer.prototype.getTime = function(){
    var that = this;
    if (this.format === 'youtube') {
        return this._ytEl.getCurrentTime();
    } else {
        return this.element.currentTime;
    }
};
oTplayer.prototype.getDuration = function(){
    return this.element.duration;
};

oTplayer.prototype.reset = function(){
    this._onChange = function(){};
    this.speed("reset");
    if (this.progressBar) {
        this.progressBar.remove();
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
};


oTplayer.prototype.disableSpeedChange = function(){
    this.speed = function(){
        return false;
    };
    this.speedChangeDisabled = true;
};



