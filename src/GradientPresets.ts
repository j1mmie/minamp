import gradientString from 'gradient-string'

export const GradientPresets = {
  atlas:     gradientString.atlas,
  cristal:   gradientString.cristal,
  teen:      gradientString.teen,
  mind:      gradientString.mind,
  morning:   gradientString.morning,
  vice:      gradientString.vice,
  passion:   gradientString.passion,
  fruit:     gradientString.fruit,
  instagram: gradientString.instagram,
  retro:     gradientString.retro,
  summer:    gradientString.summer,
  rainbow:   gradientString.rainbow,
  pastel:    gradientString.pastel,
}

export type GradientPresetKey = keyof(typeof GradientPresets)
