import { Fonts } from 'figlet'
import { GradientPresetKey } from './GradientPresets.js'
import merge from 'deepmerge'

export type AnyOtherKeys = {[key:string]:any}

export type Coord = {
  top?:number,
  left?:number
}

export type VerticalMargin =  {
  top?:number,
  bottom?:number
}

export interface FullMargin {
  top?:number,
  right?:number,
  bottom?:number,
  left?:number,
}

export interface FgBg {
  bg?:string,
  fg?:string,
}

export function getNum(num?:number) {
  return num || 0
}

export function getMarginHeight(margin?:(VerticalMargin & AnyOtherKeys)) {
  return getNum(margin?.top) + getNum(margin?.bottom)
}

export type Station = {
  url:string,
  header:StationHeader,
  volumeBar?:FgBg,
  playStatus?:FgBg,
  pauseStatus?:FgBg,
  default?:boolean,
}

export type StationHeader = {
  title:string,
  font?:Fonts,
  gradient?:(GradientPresetKey | tinycolor.ColorInput[]),
  pos?:Coord,
  margin?:FullMargin
}

export const stationDefaults:Station = {
  url: '',
  header: {
    title: '',
    pos: {
      top: 0,
    },
    margin: {
      top:    0,
      bottom: 0
    }
  },
  playStatus: {
    fg: '#5ee7df',
  },
  pauseStatus: {
    // bg: '#5599aa',
    // fg: '#ffffff',
    fg: '#5ee7df'
  },
  volumeBar: {
    bg: '#5599aa',
    fg: '#5fb0d7'
  }
}

export class StationManager {
  private _stations:Station[]

  private _currentStationIndex = 0
  private _currentStation:Station
  private _startupStation:Station

  public get currentStationIndex() { return this._currentStationIndex }
  public get currentStation() { return this._currentStation }

  constructor(startupStation:Station, stationsIn:Station[]) {
    this._startupStation = startupStation
    this._currentStation = startupStation

    this._stations = stationsIn.map(station => merge(stationDefaults, station))
  }

  private _clampIndex(index:number):number {
    if (index >= this._stations.length) {
      return 0
    }

    if (index < 0) {
      return index + this._stations.length
    }

    return index
  }

  public getStationAt(index:number):Station {
    if (this._stations.length === 0) {
      return this._startupStation
    }

    index = this._clampIndex(index)
    return this._stations[index]
  }

  public goto(station:(number | Station)):void {
    if (typeof(station) === 'number') {
      const index = this._clampIndex(station)
      this._currentStationIndex = index
      this._currentStation = this.getStationAt(index)
    } else {
      this._currentStationIndex = -1
      this._currentStation = station
    }
  }

  public gotoUserDefault() {
    let startupStationIndex = this._stations.findIndex(_ => _.default)
    if (startupStationIndex === -1) {
      startupStationIndex = 0
    }
    this.goto(startupStationIndex)
  }

  public next() {
    this.goto(this._currentStationIndex + 1)
  }

  public previous() {
    this.goto(this._currentStationIndex - 1)
  }

  public random() {
    const index = Math.floor(Math.random() * this._stations.length)
    return this.goto(index)
  }
}