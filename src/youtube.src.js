
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