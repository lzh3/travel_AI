import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import 'vant/lib/index.css'
import './styles/common.css'
import {
  NavBar,
  NoticeBar,
  Field,
  Button,
  Cell,
  CellGroup,
  Grid,
  GridItem,
  Tabbar,
  TabbarItem,
  Popup,
  Picker,
  Loading,
  Empty,
  Icon,
  Collapse,
  CollapseItem,
  Tag,
  Image,
  Dialog,
  Toast
} from 'vant'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册 Vant 组件
app.use(NavBar)
app.use(NoticeBar)
app.use(Field)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Grid)
app.use(GridItem)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Popup)
app.use(Picker)
app.use(Loading)
app.use(Empty)
app.use(Icon)
app.use(Collapse)
app.use(CollapseItem)
app.use(Tag)
app.use(Image)
app.use(Dialog)
app.use(Toast)

app.mount('#app')