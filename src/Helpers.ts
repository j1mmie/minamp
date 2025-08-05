import blessed from 'neo-blessed'
import figlet, { Fonts } from 'figlet'
import gradientString from 'gradient-string'
import { GradientPresetKey, GradientPresets } from './GradientPresets.js'
import { FgBg } from './StationManager.js'

export function cleanStreamContent(input:(string | undefined | number), defaultVal = '--'):string {
  if (typeof input === 'number') {
    input = input.toString()
  }

  const output = input ?? defaultVal

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

export async function macroText(text:string, font?:Fonts):Promise<string> {
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

export function gradientText(text:string, gradient?:(GradientPresetKey | tinycolor.ColorInput[])):string {
  if (!gradient) return text

  if (typeof gradient === 'string') {
    const preset = GradientPresets[gradient]
    return preset.multiline(text)
  } else {
    return gradientString(gradient).multiline(text)
  }
}

export function getLineHeight(text:string) {
  return (text.trim().match(/\n/g) || []).length + 1
}

export function setFgBg(element:blessed.Widgets.BlessedElement, fgBg?:FgBg) {
  element.style.fg = fgBg?.fg
  element.style.bg = fgBg?.bg
}
