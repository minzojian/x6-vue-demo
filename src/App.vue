<template>
  <div style="width=100vw; height=100vh">
    <div id="container"></div>
    <!-- <button @click="testaddport">添加Port</button> -->
    <el-button type="primary" @click="testaddnode">添加节点</el-button>
    <el-button type="primary" @click="testaddport">添加Port</el-button>
  </div>
</template>

<script>
import { h, createApp } from "vue";

// const RootComponent = {
//   render() {
//     return h('div', 'hello world')
//   }
// }

// createApp(RootComponent).mount('#app')
import { ElButton, ElTag, ElMenuItem } from "element-plus";

import { chalk } from "@element-plus/colors";

import MyNode from "@/components/my-node.vue";
// import MyPort from "@/components/my-port.vue";
import { Graph, Markup, Path } from "@antv/x6";
import { register } from "@antv/x6-vue-shape";
import { Dom } from "@antv/x6-common";
import { ContextMenuTool } from "./components/ContextMenuTool.ts";

const degreesToRadians = (degrees) => degrees * (Math.PI / 180);
const transCanvasAngleToRos = (angle) => angle - 90;

const calcPoint = (p) => {
  const distance = 10;
  const theta = degreesToRadians(transCanvasAngleToRos(p.angle));
  const x = p.x + distance * Math.cos(theta);
  const y = p.y + distance * Math.sin(theta);
  return { x, y };
};

const calcIntersectionPoint = (points) => {
  const [p1, p2] = points;
  const p11 = calcPoint(p1);
  const p22 = calcPoint(p2);
  const d1 = (p1.x - p11.x) * (p2.y - p22.y);
  const d2 = (p1.y - p11.y) * (p2.x - p22.x);
  const d = d1 - d2;

  if (d === 0) {
    return { x: p1.x, y: p1.y };
  }

  const u1 = p1.x * p11.y - p1.y * p11.x;
  const u4 = p2.x * p22.y - p2.y * p22.x;

  const u2x = p2.x - p22.x;
  const u3x = p1.x - p11.x;
  const u2y = p2.y - p22.y;
  const u3y = p1.y - p11.y;

  const px = (u1 * u2x - u3x * u4) / d;
  const py = (u1 * u2y - u3y * u4) / d;

  const p = { x: px, y: py };

  return p;
};

Graph.registerConnector(
  "curve",
  (sourcePoint, targetPoint) => {
    const path = new Path();
    path.appendSegment(Path.createSegment("M", sourcePoint));
    // 基于方向获取控制点
    const controlPoint = calcIntersectionPoint([
      {
        ...sourcePoint,
        angle: graph.getNodesFromPoint(sourcePoint)[0]?.getAngle() || 0,
      },
      {
        ...targetPoint,
        angle: graph.getNodesFromPoint(targetPoint)[0]?.getAngle() || 0,
      },
    ]);
    // 基于控制点生成二次贝塞尔曲线
    path.appendSegment(path.quadTo(controlPoint, targetPoint));
    return path.serialize();
  },
  true
);

window["Dom"] = Dom;
register({
  shape: "my-node",
  width: 100,
  height: 100,
  component: MyNode,
  markup: [Markup.getForeignObjectMarkup()],
  attrs: {
    body: {
      width: "100%",
      height: "100%",
    },
  },
  ports: {
    groups: {
      group1: {
        position: { name: "mylayout" },
        markup: [Markup.getForeignObjectMarkup()],
        attrs: {
          fo: {
            width: 40,
            height: 24,
            magnet: true,
          },
        },
      },
    },
  },
});

Graph.unregisterPortLayout("mylayout");
Graph.registerPortLayout("mylayout", (portsPositionArgs, elemBBox, args) => {
  let x = 5;
  return portsPositionArgs.map((arg, index) => {
    //这里的arg是在下边连接桩items里添加的参数内容,我们这里添加了一个width,来描述标签的宽
    //然后根据宽度,加上10的间隔,这样水平排列
    //纵坐标直接按elemBBox,也就是整个节点的矩形,的底部位置-25的地方为准
    x += arg.width + 5;
    return {
      position: {
        x: x - arg.width - 5,
        y: elemBBox.height - 28,
      },
      angle: 0,
    };
  });
});

//连接桩的颜色MAP
const portColors = {
  肯定: "success",
  拒绝: "warning",
  否定: "danger",
  默认: "primary",
};

export default {
  data() {
    return {
      graph: null,
    };
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
    this.graph.dispose();
  },
  components: {},
  methods: {
    // test

    testaddport() {
      this.addPortInNode(this.graph.getNodes()[0].id, "肯定");
    },

    testaddnode() {
      this.addNode(
        "plus",
        "test",
        "asdlkfjsaldfhello worldfjasldkfjl\nasjdklfadsfl",
        ["肯定", "拒绝", "否定", "默认"]
      );
    },

    //end test

    addNode(icon, title, content, ports = []) {
      this.graph.addNode({
        shape: "my-node",
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        data: {
          icon,
          title,
          content,
          style: {},
        },
        tools: [
          {
            name: "contextmenu",
            args: {
              menu: [
                h(
                  ElMenuItem,
                  {
                    index: 1,
                    onClick: () => {
                      console.log("复制");
                    },
                  },
                  "复制"
                ),
                h(
                  ElMenuItem,
                  {
                    index: 2,
                    onClick: () => {
                      console.log("录音");
                    },
                  },
                  "录音"
                ),
              ],
            },
          },
        ],
        ports: {
          items: ports.map((port) => ({
            id: port,
            group: "group1",
            args: {
              width: Dom.measureText(port).width + 2,
            },
            attrs: {
              fo: { width: Dom.measureText(port).width + 2 },
              label: {
                text: port,
                // style: { background: chalk[portColors[port]], color: "white" },
              },
            },
          })),
          // [
          // {
          //   id: "port11",
          //   group: "group1",
          //   args: {
          //     width: Dom.measureText("肯定").width+8,
          //   },
          //   attrs: {
          //     fo:{width: Dom.measureText("肯定").width+8},
          //     label: {
          //       text: "肯定",
          //       style: { background: "blue", color: "white" },
          //     },
          //   },
          // },
          // {
          //   id: "port22",
          //   group: "group1",
          //   args: {
          //     width: Dom.measureText("肯定2").width+8,
          //   },
          //   attrs: {
          //     fo:{width: Dom.measureText("肯定2").width+8},
          //     label: {
          //       text: "肯定2",
          //       style: { background: "red", color: "white" },
          //     },
          //   },
          // },
          // {
          //   id: "port33",
          //   group: "group1",
          //   args: {
          //     width: Dom.measureText("肯定22").width+8,
          //   },
          //   attrs: {
          //     fo:{width: Dom.measureText("肯定22").width+8},
          //     label: {
          //       text: "肯定22",
          //       style: { background: "red", color: "white" },
          //     },
          //   },
          // },
          // ],
        },
      });
    },

    addPortInNode(nodeId, portLabel) {
      // const type=portColors[portLabel]||portColors['默认'];

      this.graph.getCellById(nodeId).addPort({
        group: "group1",

        args: {
          width: Dom.measureText(portLabel).width + 2,
        },
        attrs: {
          fo: { width: Dom.measureText(portLabel).width + 2 },
          label: {
            text: portLabel,
            // style: { background, color},
          },
        },
      });
    },

    init() {
      const that = this;
      // 创建画布
      const graph = (this.graph = new Graph({
        container: document.getElementById("container"),
        // autoResize: true,
        width: 800,
        height: 800,
        panning: true,
        mousewheel: {
          enabled: true,
        },
        background: { color: "#ddd" },
        grid: true,
        connecting: {
          allowLoop: false,
          // highlight:true,
          targetAnchor: "top",
          sourceAnchor: "bottom",
          // router:{
          // name: "er",
          // args:{
          //   startDirections:["bottom"],
          //   endDirections:["top"]
          // }
          // },
          connector: { name: "smooth" },
          validateConnection({
            edge,
            edgeView,
            sourceView,
            targetView,
            sourcePort,
            targetPort,
            sourceMagnet,
            targetMagnet,
            sourceCell,
            targetCell,
            type,
          }) {
            // console.log(targetPort,targetMagnet,targetCell,type)
            if (targetPort != null && sourcePort != null) {
              //不能用连接桩连接直接另一个连接桩
              return false;
            }
            return true;
          },
        },
        onPortRendered(args) {
          // args.container.innerHTML='';
          const selectors = args.contentSelectors;
          const container = selectors && selectors.foContent;
          if (container) {
            const c = document.createElement("div");
            c.id = "ttt";

            container.appendChild(c);

            // const r= createApp({render(){return h('div',"hello")}})
            //   console.log(r);
            //   r.mount("#ttt")

            requestAnimationFrame(() => {
              const type =
                portColors[args.port.attrs.label?.text] || portColors["默认"];

              const RootComponent = {
                render() {
                  return h(
                    ElTag,
                    {
                      type,
                      size: "default",
                      "disable-transitions": true,
                      class: "tag-button",
                    },
                    args.port.attrs.label?.text
                  );
                },
              };

              createApp(RootComponent).mount(c);
            });

            // container.innerHTML =' <el-button type="primary">Primary</el-button>'

            //  `<span
            //             style="
            //               padding: 1px 2px;
            //               border-radius: 4px;
            //               white-space: nowrap;
            //               color:${args.port.attrs.label?.style.color||'black'};
            //               background-color:${args.port.attrs.label?.style.background||'white'};
            //               "
            //           >
            //             ${args.port.attrs.label?.text}
            //           </span>`;
            // const holder = container.firstChild;

            // requestAnimationFrame(()=>{
            // args.node.setPortProp(args.port.id,'attrs/fo/width',holder.offsetWidth)
            // })
          }
        },
      }));
      window["graph"] = graph;
      graph.on("edge:mouseenter", function (props) {
        console.log(arguments);
        const { edge, e, cell, view } = props;
        cell.setAttrByPath("line/strokeWidth", 4);
      });

      graph.on("edge:mouseleave", function (props) {
        console.log(arguments);
        const { edge, e, cell, view } = props;
        cell.setAttrByPath("line/strokeWidth", 2);
      });

      graph.on("edge:mousedown", function (props) {
        const { edge, e, cell, view } = props;
        window["eee"] = props;

        setTimeout(() => {
          const portId = e.currentTarget.getAttribute("port");
          const port = view.sourceView.cell.getPort(portId);
          edge.setAttrByPath(
            "line/stroke",
            (chalk[
              portColors[port.attrs.label?.text] || portColors["默认"]
            ] || [""])[0]
          ); //
          console.log(arguments);
        }, 100);
      });
      //     graph.addNode({
      //       shape: "my-node",
      //       x: 100,
      //       y: 100,
      //       width: 200,
      //       height: 100,
      //       data: {
      //         label: "world aklsdjalksdjflkajsdf\nasdfklajdlfjaklsdf",
      //         style: { color: "blue" },
      //       },
      //       tools: [
      //   {
      //     name: 'contextmenu',
      //     args: {
      //       menu:[
      //         h(ElMenuItem,{index:1,onClick:()=>{console.log(111)}},'item 1'),
      //         h(ElMenuItem,{index:2,onClick:()=>{console.log(222)}},'item 2'),
      //         h(ElMenuItem,{index:3,onClick:()=>{console.log(333)}},'item 3')
      //       ],
      //     },
      //   },
      // ],
      //       ports: {
      //         items: [
      //           // {
      //           //   id: "port11",
      //           //   group: "group1",
      //           //   args: {
      //           //     width: Dom.measureText("肯定").width+8,
      //           //   },
      //           //   attrs: {
      //           //     fo:{width: Dom.measureText("肯定").width+8},
      //           //     label: {
      //           //       text: "肯定",
      //           //       style: { background: "blue", color: "white" },
      //           //     },
      //           //   },
      //           // },
      //           // {
      //           //   id: "port22",
      //           //   group: "group1",
      //           //   args: {
      //           //     width: Dom.measureText("肯定2").width+8,
      //           //   },
      //           //   attrs: {
      //           //     fo:{width: Dom.measureText("肯定2").width+8},
      //           //     label: {
      //           //       text: "肯定2",
      //           //       style: { background: "red", color: "white" },
      //           //     },
      //           //   },
      //           // },
      //           // {
      //           //   id: "port33",
      //           //   group: "group1",
      //           //   args: {
      //           //     width: Dom.measureText("肯定22").width+8,
      //           //   },
      //           //   attrs: {
      //           //     fo:{width: Dom.measureText("肯定22").width+8},
      //           //     label: {
      //           //       text: "肯定22",
      //           //       style: { background: "red", color: "white" },
      //           //     },
      //           //   },
      //           // },
      //         ],
      //       },
      //     });
      //   },
    },
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
<style scoped>
.flex {
  display: flex;
  align-items: center;
}
.container {
  align-items: flex-start;
  width: 100%;
  height: calc(100vh - 60px);
  padding: 20px;
  background-color: #f3f5f8;
  box-sizing: border-box;
}
</style>
<style>
.tag-button {
  white-space: nowrap;
  /* padding: 1px 2px!important; */
  padding-top: 1px !important;
  padding-bottom: 1px !important;
  padding-left: 2px !important;
  padding-right: 2px !important;
}
</style>
