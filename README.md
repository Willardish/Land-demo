# Rednote Land Mode（小红书乐园模式）

高保真移动端原型：**React + Tailwind CSS v4 + Framer Motion**。地图底图为静态 **`public/disney-map.jpg`**（由你提供的园区导览图复制而来），POI 以 **百分比坐标** 叠在图上。

## 运行

```bash
cd "C:\Users\willard\Desktop\地图demo"
npm install
npm run dev
```

PowerShell 若拦截脚本，使用：`npm.cmd run dev`

## 结构说明

| 路径 | 说明 |
|------|------|
| `public/disney-map.jpg` | 乐园地图底图（可替换同名文件） |
| `src/App.jsx` | 状态与页面编排 |
| `src/components/rn/*` | 手机框、地图层、顶栏、抽屉、路线、笔记等 |
| `src/data/poisData.js` | POI 与 `pos: { xPct, yPct }` |
| `src/index.css` | Tailwind 入口 `@import "tailwindcss"` |

## 交互摘要

- **顶栏四控**：Map/List、游玩类型 chips、玩家画像、实况开关  
- **实况**：POI 等待角标 + 互助针 **5:00 倒计时**（循环演示）  
- **问地图**：底部居中麦克风 → 全图 **脉冲波纹**（Mock 语音）  
- **游览计划**：右下 FAB → 路线列表 + **AI Optimize** / **静默导航**  
- **长按 POI**：加入/移除 **路线多选**（红圈）  
- **我的**：足迹开关 + **生成小红书笔记**（攻略体 / 故事体）

## 设备框

固定 **390×844**（iPhone 15 Pro 逻辑尺寸），居中 + 阴影 + 深色外圈。
