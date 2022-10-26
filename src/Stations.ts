import { Fonts } from 'figlet'
import { GradientPresetKey } from './GradientPresets'

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

export function getNum(num?:number) {
  return num || 0
}

export function getMarginHeight(margin?:(VerticalMargin & AnyOtherKeys)) {
  return getNum(margin?.top) + getNum(margin?.bottom)
}

export type Station = {
  url:string,
  header:StationHeader,
  default?:boolean
}

export type StationHeader = {
  title:string,
  font?:Fonts,
  gradient?:(GradientPresetKey | tinycolor.ColorInput[]),
  pos?:Coord,
  margin?:FullMargin
}

export const stations:Station[] = [
  {
    url: 'https://stream.rekt.network/rekt.ogg',
    header: {
      title:    'Rekt',
      font:     'Graffiti',
      gradient: ['#cc0000', '#990000'],
      pos: {
        top: 0
      },
      margin: {
        top:    0,
        bottom: -1
      }
    }
  },
  {
    url: 'https://stream.rekt.network/nightride.ogg',
    header: {
      title:    'Nightride',
      font:     'Cybermedium',
      gradient: 'passion',
      pos: {
        top: 1
      },
      margin: {
        top:    0,
        bottom: 0
      }
    }
  },
  {
    url: 'https://stream.rekt.network/chillsynth.ogg',
    default: true,
    header: {
      title: 'Chillsynth',
      font: 'Santa Clara',
      gradient: 'vice',
      pos: {
        top: 1
      },
      margin: {
        top:    0,
        bottom: -2
      },
    }
  },
]
