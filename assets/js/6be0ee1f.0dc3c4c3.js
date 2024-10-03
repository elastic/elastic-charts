"use strict";(self.webpackChunkelastic_charts_docs=self.webpackChunkelastic_charts_docs||[]).push([[79991],{95432:(e,c,l)=>{l.r(c),l.d(c,{assets:()=>t,contentTitle:()=>d,default:()=>h,frontMatter:()=>n,metadata:()=>a,toc:()=>o});var r=l(74848),s=l(28453);const n={},d=void 0,a={id:"all-types/functions/Goal",title:"Goal",description:"@elastic/charts \u2022 Exports",source:"@site/docs/all-types/functions/Goal.md",sourceDirName:"all-types/functions",slug:"/all-types/functions/Goal",permalink:"/elastic-charts/all-types/functions/Goal",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"api",previous:{title:"Flame",permalink:"/elastic-charts/all-types/functions/Flame"},next:{title:"GroupBy",permalink:"/elastic-charts/all-types/functions/GroupBy"}},t={},o=[{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Deprecated",id:"deprecated",level:2},{value:"Source",id:"source",level:2}];function i(e){const c={a:"a",blockquote:"blockquote",code:"code",del:"del",h1:"h1",h2:"h2",hr:"hr",p:"p",strong:"strong",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(c.p,{children:[(0,r.jsx)(c.strong,{children:"@elastic/charts"})," \u2022 ",(0,r.jsx)(c.a,{href:"/elastic-charts/all-types/",children:"Exports"})]}),"\n",(0,r.jsx)(c.hr,{}),"\n",(0,r.jsxs)(c.p,{children:[(0,r.jsx)(c.a,{href:"/elastic-charts/all-types/",children:"@elastic/charts"})," / Goal"]}),"\n",(0,r.jsxs)(c.h1,{id:"function-goal",children:["Function: ",(0,r.jsx)(c.del,{children:"Goal()"})]}),"\n",(0,r.jsxs)(c.blockquote,{children:["\n",(0,r.jsxs)(c.p,{children:[(0,r.jsx)(c.strong,{children:"Goal"}),"(",(0,r.jsx)(c.code,{children:"props"}),"): ",(0,r.jsx)(c.code,{children:"null"})]}),"\n"]}),"\n",(0,r.jsx)(c.p,{children:"Add Goal spec to chart"}),"\n",(0,r.jsx)(c.h2,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(c.p,{children:["\u2022 ",(0,r.jsx)(c.strong,{children:"props"}),": ",(0,r.jsx)(c.code,{children:"SFProps"}),"<",(0,r.jsx)(c.a,{href:"/elastic-charts/all-types/interfaces/GoalSpec",children:(0,r.jsx)(c.code,{children:"GoalSpec"})}),", ",(0,r.jsx)(c.code,{children:'"chartType"'})," | ",(0,r.jsx)(c.code,{children:'"specType"'}),", ",(0,r.jsx)(c.code,{children:'"base"'})," | ",(0,r.jsx)(c.code,{children:'"actual"'})," | ",(0,r.jsx)(c.code,{children:'"bandFillColor"'})," | ",(0,r.jsx)(c.code,{children:'"tickValueFormatter"'})," | ",(0,r.jsx)(c.code,{children:'"labelMajor"'})," | ",(0,r.jsx)(c.code,{children:'"labelMinor"'})," | ",(0,r.jsx)(c.code,{children:'"centralMajor"'})," | ",(0,r.jsx)(c.code,{children:'"centralMinor"'})," | ",(0,r.jsx)(c.code,{children:'"angleStart"'})," | ",(0,r.jsx)(c.code,{children:'"angleEnd"'})," | ",(0,r.jsx)(c.code,{children:'"bandLabels"'})," | ",(0,r.jsx)(c.code,{children:'"tooltipValueFormatter"'}),", ",(0,r.jsx)(c.code,{children:"SFOptionalKeys"}),"<",(0,r.jsx)(c.a,{href:"/elastic-charts/all-types/interfaces/GoalSpec",children:(0,r.jsx)(c.code,{children:"GoalSpec"})}),", ",(0,r.jsx)(c.code,{children:'"chartType"'})," | ",(0,r.jsx)(c.code,{children:'"specType"'}),", ",(0,r.jsx)(c.code,{children:'"base"'})," | ",(0,r.jsx)(c.code,{children:'"actual"'})," | ",(0,r.jsx)(c.code,{children:'"bandFillColor"'})," | ",(0,r.jsx)(c.code,{children:'"tickValueFormatter"'})," | ",(0,r.jsx)(c.code,{children:'"labelMajor"'})," | ",(0,r.jsx)(c.code,{children:'"labelMinor"'})," | ",(0,r.jsx)(c.code,{children:'"centralMajor"'})," | ",(0,r.jsx)(c.code,{children:'"centralMinor"'})," | ",(0,r.jsx)(c.code,{children:'"angleStart"'})," | ",(0,r.jsx)(c.code,{children:'"angleEnd"'})," | ",(0,r.jsx)(c.code,{children:'"bandLabels"'})," | ",(0,r.jsx)(c.code,{children:'"tooltipValueFormatter"'}),">, ",(0,r.jsx)(c.code,{children:"SFRequiredKeys"}),"<",(0,r.jsx)(c.a,{href:"/elastic-charts/all-types/interfaces/GoalSpec",children:(0,r.jsx)(c.code,{children:"GoalSpec"})}),", ",(0,r.jsx)(c.code,{children:'"chartType"'})," | ",(0,r.jsx)(c.code,{children:'"specType"'}),", ",(0,r.jsx)(c.code,{children:'"base"'})," | ",(0,r.jsx)(c.code,{children:'"actual"'})," | ",(0,r.jsx)(c.code,{children:'"bandFillColor"'})," | ",(0,r.jsx)(c.code,{children:'"tickValueFormatter"'})," | ",(0,r.jsx)(c.code,{children:'"labelMajor"'})," | ",(0,r.jsx)(c.code,{children:'"labelMinor"'})," | ",(0,r.jsx)(c.code,{children:'"centralMajor"'})," | ",(0,r.jsx)(c.code,{children:'"centralMinor"'})," | ",(0,r.jsx)(c.code,{children:'"angleStart"'})," | ",(0,r.jsx)(c.code,{children:'"angleEnd"'})," | ",(0,r.jsx)(c.code,{children:'"bandLabels"'})," | ",(0,r.jsx)(c.code,{children:'"tooltipValueFormatter"'}),", ",(0,r.jsx)(c.code,{children:"SFOptionalKeys"}),"<",(0,r.jsx)(c.a,{href:"/elastic-charts/all-types/interfaces/GoalSpec",children:(0,r.jsx)(c.code,{children:"GoalSpec"})}),", ",(0,r.jsx)(c.code,{children:'"chartType"'})," | ",(0,r.jsx)(c.code,{children:'"specType"'}),", ",(0,r.jsx)(c.code,{children:'"base"'})," | ",(0,r.jsx)(c.code,{children:'"actual"'})," | ",(0,r.jsx)(c.code,{children:'"bandFillColor"'})," | ",(0,r.jsx)(c.code,{children:'"tickValueFormatter"'})," | ",(0,r.jsx)(c.code,{children:'"labelMajor"'})," | ",(0,r.jsx)(c.code,{children:'"labelMinor"'})," | ",(0,r.jsx)(c.code,{children:'"centralMajor"'})," | ",(0,r.jsx)(c.code,{children:'"centralMinor"'})," | ",(0,r.jsx)(c.code,{children:'"angleStart"'})," | ",(0,r.jsx)(c.code,{children:'"angleEnd"'})," | ",(0,r.jsx)(c.code,{children:'"bandLabels"'})," | ",(0,r.jsx)(c.code,{children:'"tooltipValueFormatter"'}),">>>"]}),"\n",(0,r.jsx)(c.h2,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(c.p,{children:(0,r.jsx)(c.code,{children:"null"})}),"\n",(0,r.jsx)(c.h2,{id:"deprecated",children:"Deprecated"}),"\n",(0,r.jsxs)(c.p,{children:["please use ",(0,r.jsx)(c.code,{children:"Bullet"})," spec instead"]}),"\n",(0,r.jsx)(c.h2,{id:"source",children:"Source"}),"\n",(0,r.jsx)(c.p,{children:(0,r.jsx)(c.a,{href:"https://github.com/elastic/elastic-charts/blob/fa97790e24/packages/charts/src/chart_types/goal_chart/specs/index.ts#L99",children:"packages/charts/src/chart_types/goal_chart/specs/index.ts:99"})}),"\n",(0,r.jsx)(c.hr,{}),"\n",(0,r.jsxs)(c.p,{children:["Generated using ",(0,r.jsx)(c.a,{href:"https://www.npmjs.com/package/typedoc-plugin-markdown",children:"typedoc-plugin-markdown"})," and ",(0,r.jsx)(c.a,{href:"https://typedoc.org/",children:"TypeDoc"})]})]})}function h(e={}){const{wrapper:c}={...(0,s.R)(),...e.components};return c?(0,r.jsx)(c,{...e,children:(0,r.jsx)(i,{...e})}):i(e)}},28453:(e,c,l)=>{l.d(c,{R:()=>d,x:()=>a});var r=l(96540);const s={},n=r.createContext(s);function d(e){const c=r.useContext(n);return r.useMemo((function(){return"function"==typeof e?e(c):{...c,...e}}),[c,e])}function a(e){let c;return c=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:d(e.components),r.createElement(n.Provider,{value:c},e.children)}}}]);