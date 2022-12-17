<template>
  <div ref="wrapper" class="wrapper" :style="style">
 
    <div class="top-part">
      <div class="icon" v-if="icon"><img :src="iconUrl" /></div>
  <div  class="title" >{{ title }}</div>
</div>
  <div  class="content" >{{ content }}</div>
</div>
</template>

<script >
// console.log(import.meta.glob(["@/assets/image/**"]));

// const getImageUrl = (name) => {
//         return new URL(name, import.meta.url).href
//     }


const iconUrlMap={
  'min': 'image/min.png',
  'plus':'image/plus.png',
}
console.log(iconUrlMap);

export default {
  name: "my-node",
  inject: ["getNode"],
  computed:{
    iconUrl(){
      return iconUrlMap[this.icon]
    }
  },
  data() {
    return {
      icon:'min',
      title: "some title string",
      content:"some content string",
      style: {
        // background: "white",
        // padding: "2px 4px",
        // paddingBottom: "32px", //为下方的连接桩留够空间
        // borderRadius: "4px",
        // border: "1px black solid",
      },
    };
  },
  // updated() {
    //console.log("updated");
  // },
  mounted() {
    const node = this.getNode();
    node.on("change:data", ({ current }) => {
      this.updateData();
    });
    node.on("change:ports", ({ current }) => {
      console.log('ports change')
      this.updateData();
    });

    

    this.updateData();
  },
  methods: {
    updateData() {
      const node = this.getNode();
      //window["ttt"] = node;
      //console.log(node.getData());
      const { icon, title,content } = node.getData();
      this.icon = icon;
      this.title = title;
      this.content = content;
      this.style = { ...this.style, ...node.getData().style };

      this.$nextTick(() => {
        const bound = this.$refs.wrapper.getBoundingClientRect();
        console.log(bound)
        node.setPropByPath("size/height", bound.height);
        const portsWidth=Object.values(node.getPorts()).reduce((acc,cur)=>{
          return acc+cur.args.width+5 //5是为了间隔
        },-5)+10;//10是为了左右留空,初始值为-5,因为间隔累积值要少算一个
        node.setPropByPath("size/width", Math.max(bound.width,portsWidth));
      });
    },
  },
};
</script>
<style scoped>
.wrapper{
  display: flex;
  flex-direction: column;

  background: white;
        padding: 5px 5px;
        /* 为下方的连接桩留够空间 */
        padding-bottom: 32px; 
        border-radius: 4px;
        border: 1px black solid;

}
.top-part{
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.icon{
  width: 20px;
  height: 20px;
  padding: 2px;
  margin-right: 4px;
 
}
.icon img{
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
.title{
  font-weight: 500;
  color:black;
  font-size: 14px;
}
.content{
  text-align: left;
  color:#5c5c5c;
  font-size: 14px;
}
</style>