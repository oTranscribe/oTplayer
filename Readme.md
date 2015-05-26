# oTplayer

HTML5 audio/video player for [oTranscribe](https://github.com/otranscribe/otranscribe). Requires jQuery and [progressor.js](https://github.com/ejb/progressor.js).

oTplayer is a bring-your-own-interface component. See [this demo](http://otranscribe.com/oTplayer/examples/basic-player.html) for an example of a very basic GUI player.

## How to use

With a parent element (in this case, a div with class '.player-container') and a media source (either a URL, or an HTML5 [File object](https://developer.mozilla.org/en/docs/Web/API/File) from local upload):

```js
var config = {
  source: 'http://example.com/my-file.mp3',
  container: document.querySelector('.player-container')
}
var player = new oTplayer(config);
```

This won't do a whole lot without adding your own interface, which can then be linked up to the methods below.

### Options

In addition to `source` and `player`, there are many potential options to add to the configuration object.

- `source`: HTML5 [File object](https://developer.mozilla.org/en/docs/Web/API/File) or media URL. **Required.**
- `container`: DOM element (eg. grabbed using `querySelector`). **Required.**
- `startpoint`: Time in seconds at which the media should start. Default: `0`
- `skipTime`: The number of seconds the player should skip forward/back. Default: `1.5`
- `speedIncrement`: Factor of speed increase/decrease step. Default: `0.25`
- `speedMax`: Maximum speed allowed. Normal speed is `1`. Default: `2`
- `speedMin`: Minimum speed allowed. Default: `0.5`
- `buttons`: Sub-object of selectors (or elements):
    - `playPause`: Is given class name `playing` during playback, and is clickable to start/stop.
    - `speedSlider`: HTML input element with `type="range"`. Becomes linked with current speed and max/min/steps are modified to match settings.
- `onReady`: Callback function for when ready to use.
- `onChange(name)`: Callback function when there is a change of state (eg. speed changes, play/pause, skip forward). Argument is the name of function which called it, as a string.
- `onDisableSpeedChange`: Callback function only triggered when speed changing is disabled (primarily for certain YouTube videos).
- `rewindOnPlay`: If true, will trigger `skip('back')` when resuming. Default: `true`

### Methods

These can be used with an initialised oTplayer object. For example:

```js
// setup
var config = {
  source: 'http://example.com/my-file.mp3',
  container: document.querySelector('.player-container')
}
var player = new oTplayer(config);
// using methods
player.play();
var duration = player.getDuration();
player.skipTo( 42 );
player.reset();
```

- `playPause()`: Play or pause media, depending on current playback state.
- `play()`: Play media.
- `pause()`: Pause media.
- `skipTo(seconds)`: Skip to a point in media, in seconds.
- `skip(direction)`: Jump either `'backwards'` or `'forwards'` in time, as determined by `skipTime` option.
- `speed(newSpeed)`: Speed playback `'up'` or `'down'`, or `'reset'` to return to `1`. Can also enter a number instead (eg. `0.5`, `2`).
- `getSpeed()`: Get current playback speed. `1` is normal speed.
- `getTime()`: Get current playback time, in seconds.
- `setTime(seconds)`: Alias for `skipTo()`.
- `getDuration()`: Get length of media, in seconds.
- `parseYoutubeURL(url)`: Returns true if `url` argument is a valid YouTube URL. Can be used from uninitialised `oTplayer` object.
- `reset()`: Return element to original state. `oTplayer` object will no longer be usable.
- `remove()`: Alias for `reset()`.

### Read-only properties

These can be accessed in a similar manner to methods:

```js
// assuming it's already been set up...
player.paused; // true
player.play();
player.paused; // false
```

- `progressBar`: Instance of `progressor.js`, if you need to access it.
- `speedChangeDisabled`: Is `true` if speed change is disabled (eg. in some YouTube videos).
- `paused`: Is `true` if playback is currently paused.

## Browser support

This should work with anything that [supports the File API](http://caniuse.com/#feat=fileapi).

## Building dist folder

- Install [Node and npm](https://nodejs.org) and [Grunt](http://gruntjs.com)
- Run `npm install`
- Run `grunt`

## Running tests

- Build dist folder
- Run `grunt test`

## Version history

### v1.0.0

May 25, 2015

- Initial release
