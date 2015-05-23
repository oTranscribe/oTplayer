# Blank module template

This is a template for JavaScript module projects.

## Repo structure

- dist: Production-ready files
- src: Uncompiled source
- test: Unit tests
- examples: Demos of plugin in action

## Building dist folder

- Install [Node and npm](https://nodejs.org) and [Grunt](http://gruntjs.com)
- Run `npm install`
- Run `grunt`

## Running tests

- Build dist folder
- Run `grunt test`





## Options (* = required)

- source *
- startpoint (number, seconds)
- skipTime (number, seconds)
- speedIncrement (number, seconds)
- container*: element
- buttons
    - playPause
    - speedSlider
- onReady: function
- onChange: function(argument: name of function which called it)
- onDisableSpeedChange: function
- rewindOnPause: boolean

## Methods

- reset
- remove (same as reset)
- playPause
- play
- pause
- skipTo: number (seconds)
- skip
    - 'backwards'
    - 'forwards'
- speed
    - 'up'
    - 'down'
    - 'reset'
    - number (eg. 0.5, 1, 2)
- getTime
- setTime (same as skipTo)
- getDuration
- parseYoutubeURL


## Read-only properties

- progressBar (progressor instance)
- speedChangeDisabled
- paused


