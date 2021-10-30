import { PropType, ExtractPropTypes } from 'vue'
export interface PaletteType {
  bgColor?: string
  longfgColor?: string
  shortfgColor?: string
  fontColor?: string
  shadowColor?: string
  lineColor?: string
  borderColor?: string
  cornerActiveColor?: string
  menu?: MenuType
}

export interface MenuType {
  bgColor?: string
  dividerColor?: string
  listItem?: {
    textColor?: string
    hoverTextColor?: string
    disabledTextColor?: string
    bgColor?: string
    hoverBgColor?: string
  }
}
interface configType {
  width: number
  height: number
}
export interface ShadowType {
  x: number
  y: number
  width: number
  height: number
}
interface lineType {
  h?: Array<number>
  v?: Array<number>
}
export const sketchRulerProps = {
  config: Object as PropType<configType>,
  ratio: {
    type: Number,
    default: 1
  },
  thick: {
    type: Number,
    default: 16
  },
  palette: Object as PropType<PaletteType>,
  shadow: {
    type: Object as PropType<ShadowType>,
    default: () => {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
    }
  },
  lines: {
    type: Object as PropType<lineType>,
    default: () => {
      return {
        h: [],
        v: []
      }
    }
  },
  cornerActive: {
    type: Boolean,
    default: false
  },

  isShowReferLine: {
    type: Boolean,
    default: true
  }
}
export type SketchRulerProps = ExtractPropTypes<typeof sketchRulerProps>
