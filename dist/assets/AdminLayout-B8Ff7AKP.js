import{c as s,a as u,b as p,r as l,j as e,al as g,S as y,k as f,L as i,C as b,am as k,an as v}from"./index-DqMg1GFW.js";import{d as j,C as w,g as C}from"./collectionIcons-Dgg6LF5M.js";import{U as N}from"./users-BrNin2KR.js";import{S as L}from"./sparkles-CGyxzAqL.js";import{L as M}from"./leaf-DEo3YqGL.js";import{L as z}from"./log-out-CRpfEVEV.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=s("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=s("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=s("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=s("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=s("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=s("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]),_=[{title:"Dashboard",url:"/admin",icon:B},{title:"Orders",url:"/admin/orders",icon:A},{title:"Customers",url:"/admin/customers",icon:N},{title:"Inquiries",url:"/admin/inquiries",icon:W},{title:"Reviews",url:"/admin/reviews",icon:y},{title:"Site pages",url:"/admin/site-pages",icon:O},{title:"Hero Sections",url:"/admin/sections",icon:I},{title:"Collections",url:"/admin/collections",icon:f},{title:"Bridal Collection",url:"/admin/bridal",icon:w},{title:"Tissue Collection",url:"/admin/tissue",icon:L},{title:"Linen Collection",url:"/admin/linen",icon:M}],V=[{title:"Blog",url:"/admin/blog",icon:S},{title:"Edit History",url:"/admin/history",icon:b}],$=({onNavigate:n})=>{const o=u(),a=p(),[c,d]=l.useState([]);l.useEffect(()=>{j().then(d).catch(()=>{})},[]);const m=async()=>{await k(),a("/admin/login")};return e.jsxs("aside",{className:"w-64 h-screen bg-background border-r border-border flex flex-col shrink-0 overflow-hidden",children:[e.jsxs("div",{className:"px-6 py-6 border-b border-border",children:[e.jsx("img",{src:g,alt:"Athina Regal Weaves",className:"h-10 w-auto"}),e.jsx("p",{className:"font-body text-xs text-foreground/40 mt-2",children:"Admin Panel"})]}),e.jsxs("nav",{className:"min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-6",children:[_.map(t=>{const r=o.pathname===t.url;return e.jsxs(i,{to:t.url,onClick:n,className:`flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-colors ${r?"bg-maroon/10 text-maroon border-l-3 border-maroon":"text-foreground/60 hover:text-foreground hover:bg-ivory-warm"}`,children:[e.jsx(t.icon,{size:20,strokeWidth:1.5}),e.jsx("span",{children:t.title})]},t.url)}),c.length>0&&e.jsx("div",{className:"pt-2 pb-1 px-4",children:e.jsx("p",{className:"font-body text-[10px] uppercase tracking-wider text-foreground/35",children:"Custom collections"})}),c.map(t=>{const r=`/admin/collection/${encodeURIComponent(t.collection_key)}`,h=o.pathname===r,x=C(t.icon_key);return e.jsxs(i,{to:r,onClick:n,className:`flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-colors ${h?"bg-maroon/10 text-maroon border-l-3 border-maroon":"text-foreground/60 hover:text-foreground hover:bg-ivory-warm"}`,children:[e.jsx(x,{size:20,strokeWidth:1.5}),e.jsx("span",{className:"truncate",children:t.display_name})]},t.collection_key)}),V.map(t=>{const r=o.pathname===t.url;return e.jsxs(i,{to:t.url,onClick:n,className:`flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-colors ${r?"bg-maroon/10 text-maroon border-l-3 border-maroon":"text-foreground/60 hover:text-foreground hover:bg-ivory-warm"}`,children:[e.jsx(t.icon,{size:20,strokeWidth:1.5}),e.jsx("span",{children:t.title})]},t.url)})]}),e.jsx("div",{className:"px-4 py-4 border-t border-border",children:e.jsxs("button",{onClick:m,className:"flex items-center gap-3 px-4 py-3 w-full font-body text-sm font-medium text-foreground/50 hover:text-destructive transition-colors",children:[e.jsx(z,{size:20,strokeWidth:1.5}),e.jsx("span",{children:"Logout"})]})})]})},G=({children:n})=>{const[o,a]=l.useState(!1);return e.jsxs("div",{className:"flex h-screen w-full overflow-hidden bg-ivory-warm",children:[o&&e.jsx("div",{className:"fixed inset-0 bg-black/40 z-40 lg:hidden",onClick:()=>a(!1)}),e.jsx("div",{className:`
        fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${o?"translate-x-0":"-translate-x-full"}
      `,children:e.jsx($,{onNavigate:()=>a(!1)})}),e.jsxs("main",{className:"flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden lg:ml-64",children:[e.jsxs("div",{className:"lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3",children:[e.jsx("button",{onClick:()=>a(!0),className:"p-1.5 text-foreground/70 hover:text-foreground transition-colors",children:e.jsx(v,{size:22,strokeWidth:1.5})}),e.jsx("span",{className:"font-display text-sm font-semibold text-foreground",children:"Admin Panel"})]}),n]})]})};export{G as A,O as G,I,W as M};
