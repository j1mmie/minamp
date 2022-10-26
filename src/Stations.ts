import { Fonts } from 'figlet'
import { GradientPresetKey } from './GradientPresets'

export type Station = {
  name:string,
  url:string,
  font?:Fonts,
  gradient?:(GradientPresetKey | tinycolor.ColorInput[]),
  marginBottom?:number,
  default?:boolean
}

export const stations:Station[] = [
  {
    name:        'Nightride',
    url:         'https://stream.rekt.network/nightride.ogg',
    font:        'Cybermedium',
    gradient:    'passion',
    marginBottom: 1,
  },
  {
    name:        'Chillsynth',
    url:         'https://stream.rekt.network/chillsynth.ogg',
    font:        'Santa Clara',
    gradient:    'vice',
    marginBottom: -1,
    default:     true
  },
]
