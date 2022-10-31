import moduleAlias from 'module-alias'
moduleAlias()

import createVlc from '@richienb/vlc'
import blessed from 'neo-blessed'
import gradientString from 'gradient-string'
import figlet, { Fonts } from 'figlet'
import { getMarginHeight, getNum, Station, StationHeader, stations } from './Stations.js'
import { GradientPresetKey, GradientPresets } from './GradientPresets.js'
import { DelaySecs } from './Delay.js'

type AsyncReturnType<T extends (...args: any) => Promise<any>> =
    T extends (...args: any) => Promise<infer R> ? R : any

const APP_NAME    = 'minamp'
const APP_VERSION = '0.0.1'

const RAINBOW_OPTIONS = { interpolation: 'hsv', hsvSpin: 'long' }

const STARTUP_HEADER:StationHeader = {
  title:    APP_NAME,
  font:     'Chunky',
  gradient: 'vice',
  pos: {
    top: 0,
  },
  margin: {
    top:    0,
    bottom: 0
  }
}


class App {
  private _screen:blessed.Widgets.Screen

  private _boxLoading:blessed.Widgets.BoxElement
  private _labelsCaptions:blessed.Widgets.TextElement
  private _labelHeader:blessed.Widgets.TextElement
  private _labelContent:blessed.Widgets.TextElement

  private _vlc?:AsyncReturnType<typeof createVlc>
  private _updateInterval?:NodeJS.Timer
  private _animationInterval?:NodeJS.Timeout

  private _currentStationIndex = 0
  private _currentStation?:Station

  private _currentContent?                   = '--\n--'
  private _currentArtist?:(string | number)  = '--'
  private _currentTrack?:(string | number)   = '--'
  private _lastArtist                        = this._currentArtist
  private _lastTrack                         = this._currentTrack

  constructor() {
    this._screen = blessed.screen({
      fastCSR: true
    })
    this._screen.title = APP_NAME

    this._labelHeader = blessed.text({
      top:    getNum(STARTUP_HEADER.pos?.top),
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
      content: `${APP_NAME} v${APP_VERSION}, \nloading...`,
      align: 'left'
    })

    this._labelsCaptions = blessed.text({
      top:    2,
      left:   2,
      width:  '100%', // This gets changed after loading is complete
      bottom: 0,
      content: `${APP_NAME} v${APP_VERSION}\nloading...`,
      border: undefined,
      style: {
        fg: '#5ee7df'
      },
    })

    this._labelContent = blessed.text({
      top:    1,
      left:   11,
      right:  0,
      bottom: 0,
      content: 'Content',
      border: undefined,
    })

    this._screen.append(this._labelHeader)
    this._screen.append(this._boxLoading)

    this._screen.key(['escape', 'q', 'C-c'], this._end.bind(this))
    this._screen.key(['p'], this._togglePlayPause.bind(this))
    this._screen.key(['.'], this._nextStation.bind(this))
    this._screen.key([','], this._prevStation.bind(this))
    this._screen.key(['r'], this._randomStation.bind(this))
    this._screen.key(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], this._gotoStationIndex.bind(this))

    this._setHeaderContent(STARTUP_HEADER)

    this._screen.render()
  }

  private async _macroText(text:string, font?:Fonts):Promise<string> {
    if (!font) return text

    return new Promise<string>((resolve, reject) => {
      figlet.text(text, {
        font:             font,
        horizontalLayout: 'default',
        verticalLayout:   'default',
        width:            80,
        whitespaceBreak:  true
      }, (err, data) => {
        if (err) {
          console.log('Unable to draw macro text');
          console.dir(err);
        }

        data ??= text
        resolve(data)
      })
    })
  }

  private _gradientText(text:string, gradient?:(GradientPresetKey | tinycolor.ColorInput[])):string {
    if (!gradient) return text

    if (typeof gradient === 'string') {
      const preset = GradientPresets[gradient]
      return preset.multiline(text)
    } else {
      return gradientString(gradient).multiline(text)
    }
  }

  private _getLineHeight(text:string) {
    return (text.trim().match(/\n/g) || []).length + 1
  }

  private async _setHeaderContent(header:StationHeader) {
    const macroText = await this._macroText(header.title, header.font)
    const lineHeight = this._getLineHeight(macroText)
    const headerTop = getNum(header.pos?.top)
    const headerBottom = headerTop + lineHeight + getMarginHeight(header.margin)

    this._labelHeader.top    = headerTop
    this._labelHeader.height = headerBottom
    this._labelsCaptions.top = headerBottom + 1
    this._labelContent.top   = headerBottom + 1
    this._boxLoading.top     = headerBottom

    const gradientText = this._gradientText(macroText, header.gradient)
    this._labelHeader.setContent(gradientText)
    this._screen.render()
  }

  public async start() {
    this._vlc = await createVlc()
    await DelaySecs(1)
    await this._startUpdateLoop()
  }

  private async _startUpdateLoop() {
    this._labelsCaptions.setContent('Artist: \nTitle:  ')
    this._labelsCaptions.width = 24

    this._screen.remove(this._boxLoading)
    this._screen.append(this._labelsCaptions)
    this._screen.append(this._labelContent)

    let startupStationIndex = stations.findIndex(_ => _.default)
    this._setCurrentStation(startupStationIndex)

    await this._updateMeta()

    this._updateInterval = setInterval(this._updateMeta.bind(this), 1500)
  }

  private _end() {
    clearInterval(this._updateInterval)
    return process.exit(0)
  }

  private async _togglePlayPause() {
    if (this._vlc === undefined) {
      console.error('VLC not found')
      return
    }

    await this._vlc.command('pl_pause')
  }

  private _cleanContent(input:(string | undefined | number)) {
    if (typeof input === 'number') {
      input = input.toString()
    }

    const output = input ?? '--'

    try {
      return decodeURIComponent(output)
    } catch {
      try {
        return decodeURI(output)
      } catch {
        return output
      }
    }
  }

  private async _updateMeta() {
    if (this._vlc === undefined) return

    const info = await this._vlc.info()
    const meta = info.information?.category.meta

    this._processMeta(meta?.artist, meta?.title)
  }

  private _processMeta(artist:(string | number | undefined), track:(string | number | undefined)) {
    this._currentArtist = artist
    this._currentTrack  = track

    if (this._currentArtist === this._lastArtist &&
        this._currentTrack  === this._lastTrack)
    {
      // The content has not changed
      return
    }

    const valuesItems = [
      this._cleanContent(this._currentArtist),
      this._cleanContent(this._currentTrack),
    ]

    this._currentContent = valuesItems.join('\n')

    this._animateContentChange()

    this._lastArtist = this._currentArtist
    this._lastTrack  = this._currentTrack
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
      this._labelContent.setContent(text)
      this._screen.render()
    }, 20)
  }

  private async _setCurrentStation(station:(number | Station)) {
    if (!this._vlc) return

    if (typeof(station) === 'number') {
      if (station >= stations.length) station = 0
      if (station < 0) station += stations.length
      this._currentStationIndex = station
      this._currentStation = stations[station]
    } else {
      this._currentStationIndex = 0
      this._currentStation = station
    }

    this._cancelContentChangeAnimation()
    this._setHeaderContent(this._currentStation.header)
    this._labelContent.setContent('--\n--')

    await this._vlc.command('in_play', {
      input: this._currentStation.url,
    })
  }

  private async _nextStation() {
    this._setCurrentStation(this._currentStationIndex + 1)
  }

  private async _prevStation() {
    this._setCurrentStation(this._currentStationIndex - 1)
  }

  private async _randomStation() {
    const index = Math.floor(Math.random() * stations.length)
    this._setCurrentStation(index)
  }

  private async _gotoStationIndex(key:string) {
    if (key === '0') key = '10'
    const index = parseInt(key) - 1

    if (index < 0) return
    if (index > stations.length - 1) return

    this._setCurrentStation(index)
  }
}

const app = new App()
app.start()
