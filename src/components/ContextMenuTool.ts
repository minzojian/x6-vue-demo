
import { Graph, ToolsView, EdgeView } from '@antv/x6'
import { h, createApp } from '@vue/runtime-dom'
import { ElMenu } from 'element-plus'
export class ContextMenuTool extends ToolsView.ToolItem<
  EdgeView,
  ContextMenuToolOptions
> {
  private knob: HTMLDivElement
  private timer: number

  render() {
    if (!this.knob) {
      this.knob = ToolsView.createElement('div', false) as HTMLDivElement
      this.knob.style.position = 'absolute'
      this.container.appendChild(this.knob)
    }
    return this
  }

  private toggleContextMenu(visible: boolean) {
    // ReactDom.unmountComponentAtNode(this.knob)
    
    document.removeEventListener('mousedown', this.onMouseDown)

    if (visible) {
      let menu= this.options.menu;
      const RootComponent = {
        render() {
          return h(ElMenu,{} ,menu)
        }
      }
      createApp(RootComponent).mount(this.knob)
      document.addEventListener('mousedown', this.onMouseDown)
    }
  }

  private updatePosition(e?: MouseEvent) {
    const style = this.knob.style
    if (e) {
      const pos = this.graph.clientToGraph(e.clientX, e.clientY)
      style.left = `${pos.x}px`
      style.top = `${pos.y}px`
    } else {
      style.left = '-1000px'
      style.top = '-1000px'
    }
  }

  private onMouseDown = () => {
    this.timer = window.setTimeout(() => {
      this.updatePosition()
      this.toggleContextMenu(false)
    }, 200)
  }

  private onContextMenu({ e }: { e: MouseEvent }) {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = 0
    }
    this.updatePosition(e)
    this.toggleContextMenu(true)
  }

  delegateEvents() {
    this.cellView.on('cell:contextmenu', this.onContextMenu, this)
    return super.delegateEvents()
  }

  protected onRemove() {
    this.cellView.off('cell:contextmenu', this.onContextMenu, this)
  }
}

ContextMenuTool.config({
  tagName: 'div',
  isSVGElement: false,
})

export interface ContextMenuToolOptions extends ToolsView.ToolItem.Options {
//   menu: React.ReactElement
}

Graph.registerEdgeTool('contextmenu', ContextMenuTool, true)
Graph.registerNodeTool('contextmenu', ContextMenuTool, true)