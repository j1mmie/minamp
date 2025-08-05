import moduleAlias from 'module-alias'
moduleAlias()

import blessed from 'neo-blessed'
import gradientString from 'gradient-string'
import { getMarginHeight, getNum, Station, stationDefaults, StationManager } from './StationManager.js'
import { DelaySecs } from './Delay.js'
import { KeyAction, KeyBinds } from './Keybinds.js'
import chalk from 'chalk'
import { VlcClient } from './vlc-client/VlcClient.js'
import { cleanStreamContent, getLineHeight, gradientText, macroText, setFgBg } from './Helpers.js'
import * as Constants from './Constants.js'
import merge from 'deepmerge'

import { DefaultStations } from './defaults/DefaultStations.js'

type MetaDataValue = string | number | undefined

const RAINBOW_OPTIONS = { interpolation: 'hsv', hsvSpin: 'long' }

const MAX_VOLUME = 256
const START_VOLUME = 128
const MIN_VOLUME = 1
const VOLUME_BAR_STRING = '▁▂▃▄▅▆▇'

const LOADING_STATION = merge(stationDefaults, {
  header: {
    title:    Constants.APP_NAME,
    font:     'chunky',
    gradient: 'vice'
  }
})

class App {
  private _screen:blessed.Widgets.Screen

  private _boxLoading:blessed.Widgets.BoxElement
  private _labelStatus:blessed.Widgets.TextElement
  private _labelHeader:blessed.Widgets.TextElement
  private _labelTrack:blessed.Widgets.TextElement
  private _volumeBar:blessed.Widgets.TextElement

  private _vlc:VlcClient
  private _updateInterval?:NodeJS.Timer
  private _animationInterval?:NodeJS.Timeout

  private _stationManager:StationManager

  private _currentContent?                  = '--\n--'
  private _trackDisplay1?:(string | number) = '--'
  private _trackDisplay2?:(string | number) = '--'

  private _lastTrackDisplay1 = this._trackDisplay1
  private _lastTrackDisplay2 = this._trackDisplay2

  private _isPlaying = false

  constructor() {
    this._vlc = new VlcClient('--volume', START_VOLUME, '--volume-step', START_VOLUME, '--auhal-volume', START_VOLUME)

    this._screen = blessed.screen({
      fastCSR: true
    })
    this._screen.title = Constants.APP_NAME

    this._stationManager = new StationManager(LOADING_STATION, DefaultStations)

    this._labelHeader = blessed.text({
      top:    getNum(LOADING_STATION.header?.pos?.top),
      left:   2,
      right:  1,
      height: 1,
      content: '',
      border: undefined
    })

    this._boxLoading = blessed.box({
      top:    2,
      left:   2,
      width:  24,
      bottom: 0,
      content: `${Constants.APP_NAME} v${Constants.APP_VERSION}, \nloading...`,
      align: 'left'
    })

    this._labelStatus = blessed.text({
      top:    2,
      left:   2,
      width:  10,
      height: 1,
      content: '',
      border: undefined,
      tags: true
    })

    this._labelTrack = blessed.text({
      top:    1,
      left:   13,
      right:  0,
      bottom: 0,
      content: '--',
      tags: true,
      border: undefined,
    })

    this._volumeBar = blessed.text({
      top:    2,
      left:   4,
      width:  10,
      height: 1,
      content: '',
      tags: true,
    })

    this._screen.append(this._labelHeader)
    this._screen.append(this._boxLoading)

    this._loadKeyBinds()

    this._setHeaderContent(LOADING_STATION)

    this._screen.render()
  }

  private _loadKeyBinds() {
    this._loadKeyBind('quit',            this._end)
    this._loadKeyBind('togglePlayPause', this._togglePlayPause)
    this._loadKeyBind('nextStation',     this._nextStation)
    this._loadKeyBind('prevStation',     this._prevStation)
    this._loadKeyBind('randomStation',   this._randomStation)
    this._loadKeyBind('gotoStation',     this._gotoStationByKeycode)
    this._loadKeyBind('volumeUp',        this._volumeUp)
    this._loadKeyBind('volumeDown',      this._volumeDown)
  }

  private _loadKeyBind(command:string, callback:KeyAction) {
    var keys = KeyBinds.getKeysFor(command)
    this._screen.key(keys, callback.bind(this))
  }

  private async _setHeaderContent(station:Station) {
    const header = station.header
    const macroStr = await macroText(header.title, header.font)
    const lineHeight = getLineHeight(macroStr)
    const headerTop = getNum(header.pos?.top)
    const headerBottom = headerTop + lineHeight + getMarginHeight(header.margin)

    this._labelHeader.top    = headerTop
    this._labelHeader.height = lineHeight
    this._labelStatus.top    = headerBottom + 1
    this._labelTrack.top     = headerBottom + 1
    this._boxLoading.top     = headerBottom
    this._volumeBar.top      = headerBottom + 2

    const gradientStr = gradientText(macroStr, header.gradient)
    this._labelHeader.setContent(gradientStr)

    this._screen.render()
  }

  public async start() {
    await this._vlc.connect()
    await DelaySecs(1)
    await this._startUpdateLoop()
  }

  private async _startUpdateLoop() {
    this._setStatusLabelPlaying()

    this._screen.remove(this._boxLoading)
    this._screen.append(this._labelStatus)
    this._screen.append(this._volumeBar)
    this._screen.append(this._labelTrack)

    this._stationManager.gotoUserDefault()
    this._syncWithCurrentStation()

    await this._updateMeta()
    this._isPlaying = true

    await this._syncVolumeBar()

    this._updateInterval = setInterval(this._updateMeta.bind(this), 1500)
  }

  private _end() {
    clearInterval(this._updateInterval)
    return process.exit(0)
  }

  private _setStatusLabelPlaying() {
    setFgBg(this._labelStatus, this._stationManager.currentStation.playStatus)
    this._labelStatus.setContent('▶ Playing')
  }

  private _setStatusLabelPaused() {
    setFgBg(this._labelStatus, this._stationManager.currentStation.pauseStatus)
    this._labelStatus.setContent('█ Stopped')
  }

  private async _togglePlayPause() {
    if (this._vlc === undefined) {
      console.error('VLC not found')
      return
    }

    await this._vlc.command('pl_pause')

    // if (this._isPlaying) {
    //   await this._vlc.command('pl_stop')
    //   this._isPlaying = false
    // } else {
    //   await this._vlc.command('pl_play')
    //   this._isPlaying = true
    // }

    const info = await this._vlc.info()

    if (info.state === 'playing') {
      this._setStatusLabelPlaying()
    } else {
      this._setStatusLabelPaused()
    }

    this._screen.render()
  }

  private async _updateMeta() {
    if (this._vlc === undefined) return

    const info = await this._vlc.info()
    const meta = info.information?.category.meta

    this._processMeta(meta?.artist, meta?.title)
  }

  private _processMeta(artist:MetaDataValue, track:MetaDataValue) {
    this._trackDisplay1 = track
    this._trackDisplay2 = artist

    if (this._trackDisplay1 === this._lastTrackDisplay1 &&
        this._trackDisplay2 === this._lastTrackDisplay2)
    {
      // The content has not changed
      return
    }

    const valuesItems = [
      cleanStreamContent(this._trackDisplay1),
      cleanStreamContent(this._trackDisplay2)
    ]

    this._currentContent = valuesItems.join('\n')
    this._labelTrack.setContent(this._currentContent)
    this._screen.render()

    this._animateContentChange()

    this._lastTrackDisplay1 = this._trackDisplay1
    this._lastTrackDisplay2 = this._trackDisplay2
  }

  private _rainbowText(text:string, hue:number, saturation:number, brightness:number):string {
		const leftColor  = {h: hue       % 360, s: saturation, v: brightness}
		const rightColor = {h: (hue + 1) % 360, s: saturation, v: brightness}
		return gradientString(leftColor, rightColor).multiline(text, RAINBOW_OPTIONS)
  }

  private _cancelContentChangeAnimation() {
    clearInterval(this._animationInterval)
  }

  private _animateContentChange() {
    this._cancelContentChangeAnimation()

    let hue = 0
    let sat = .8
    let bri = .5

    const satDelta = .01
    const briDelta = .01

    this._animationInterval = setInterval(() => {
      if (!this._currentContent) {
        this._cancelContentChangeAnimation()
        return
      }

      hue += 5
      sat -= satDelta
      bri += briDelta

      if (sat < 0) sat = 0
      if (bri > 1) bri = 1

      if (sat <= 0 && bri >= 1) {
        this._cancelContentChangeAnimation()
        return
      }

      const text = this._rainbowText(this._currentContent, hue, sat, bri)
      this._labelTrack.setContent(text)
      this._screen.render()
    }, 20)
  }

  private async _syncWithCurrentStation() {
    this._cancelContentChangeAnimation()
    this._setHeaderContent(this._stationManager.currentStation)
    this._labelTrack.setContent('--\n--')

    await this._vlc.command('in_play', {
      input: this._stationManager.currentStation.url,
    })
  }

  private async _nextStation() {
    this._stationManager.next()
    await this._syncWithCurrentStation()
  }

  private async _prevStation() {
    this._stationManager.previous()
    await this._syncWithCurrentStation()
  }

  private async _randomStation() {
    this._stationManager.random()
    await this._syncWithCurrentStation()
  }

  private async _gotoStationByKeycode(key:string) {
    if (key === '0') key = '10'
    const index = parseInt(key) - 1
    await this._gotoStationByIndex(index)
  }

  private async _gotoStationByIndex(index:number) {
    this._stationManager.goto(index)
    await this._syncWithCurrentStation()
  }

  private async _changeVolume(val:string) {
    if (!this._vlc) return

    await this._vlc.command('volume', { val: val })
    const info = await this._vlc.info()
    let volume = info.volume

    if (volume > MAX_VOLUME) {
      await this._vlc.command('volume', { val: MAX_VOLUME.toString() })
      volume = MAX_VOLUME
    } else if (volume < MIN_VOLUME) {
      await this._vlc.command('volume', { val: MIN_VOLUME.toString() })
      volume = MIN_VOLUME
    }

    await this._syncVolumeBar()
  }

  private async _syncVolumeBar() {
    if (!this._vlc) return

    const info = await this._vlc.info()

    const percent = info.volume / MAX_VOLUME
    const fillCh = Math.round(percent * VOLUME_BAR_STRING.length)

    const fg = this._stationManager.currentStation.volumeBar?.fg

    let barSlice:string
    if (fg) {
      const bg = this._stationManager.currentStation.volumeBar?.bg || ''
      barSlice = chalk.hex(fg)(VOLUME_BAR_STRING.slice(0, fillCh)) +
                 chalk.hex(bg)(VOLUME_BAR_STRING.slice(fillCh))
    } else {
      barSlice = VOLUME_BAR_STRING.slice(0, fillCh)
    }

    this._volumeBar.setContent(barSlice)
    this._screen.render()
  }

  private async _volumeUp() {
    this._changeVolume('+10')
  }

  private async _volumeDown() {
    this._changeVolume('-10')
  }
}

const app = new App()
app.start()
