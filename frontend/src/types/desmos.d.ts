declare module 'desmos' {
  export interface GraphBounds {
    left: number
    right: number
    bottom: number
    top: number
  }

  export interface GraphExpression {
    id: string
    latex: string
  }

  export interface GraphingCalculatorOptions {
    expressions?: boolean
    settingsMenu?: boolean
    keypad?: boolean
    zoomButtons?: boolean
    border?: boolean
    showResetButtonOnGraphpaper?: boolean
  }

  export interface GraphingCalculatorInstance {
    setMathBounds(bounds: GraphBounds): void
    setExpression(expression: GraphExpression): void
    destroy(): void
  }

  export interface DesmosModule {
    GraphingCalculator(container: HTMLElement, options?: GraphingCalculatorOptions): GraphingCalculatorInstance
  }

  const Desmos: DesmosModule

  export default Desmos
}