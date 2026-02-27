import{Da as H,Ga as K,d as j,e as P,g as N,i as R,wa as q,xa as y}from"./chunk-22QDKRRG.js";import{$b as d,Ab as m,Bb as p,Db as M,Eb as O,Fb as I,Kb as u,Lb as f,Mb as k,Nb as D,Ob as E,Pb as g,Ub as h,Ya as o,Yb as s,Z as b,_ as C,_b as v,cc as S,da as $,jb as w,kb as F,kc as Q,mc as _,nb as z,oa as T,pb as c,wc as B}from"./chunk-I5INVV6P.js";var A=["content"],L=["opposite"],G=["marker"],x=e=>({$implicit:e});function J(e,r){e&1&&g(0)}function U(e,r){e&1&&g(0)}function W(e,r){if(e&1&&(D(0),c(1,U,1,0,"ng-container",4),E()),e&2){let i=h().$implicit,n=h();o(),p("ngTemplateOutlet",n.markerTemplate||n._markerTemplate)("ngTemplateOutletContext",_(2,x,i))}}function X(e,r){e&1&&k(0,"div",9),e&2&&m("data-pc-section","marker")}function Y(e,r){e&1&&k(0,"div",10)}function Z(e,r){e&1&&g(0)}function ee(e,r){if(e&1&&(u(0,"div",2)(1,"div",3),c(2,J,1,0,"ng-container",4),f(),u(3,"div",5),c(4,W,2,4,"ng-container",6)(5,X,1,1,"ng-template",null,0,B)(7,Y,1,0,"div",7),f(),u(8,"div",8),c(9,Z,1,0,"ng-container",4),f()()),e&2){let i=r.$implicit,n=r.last,t=S(6),l=h();m("data-pc-section","event"),o(),m("data-pc-section","opposite"),o(),p("ngTemplateOutlet",l.oppositeTemplate||l._oppositeTemplate)("ngTemplateOutletContext",_(11,x,i)),o(),m("data-pc-section","separator"),o(),p("ngIf",l.markerTemplate||l._markerTemplate)("ngIfElse",t),o(3),p("ngIf",!n),o(),m("data-pc-section","content"),o(),p("ngTemplateOutlet",l.contentTemplate||l._contentTemplate)("ngTemplateOutletContext",_(13,x,i))}}var te=({dt:e})=>`
.p-timeline {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    direction: ltr;
}

.p-timeline-left .p-timeline-event-opposite {
    text-align: right;
}

.p-timeline-left .p-timeline-event-content {
    text-align: left;
}

.p-timeline-right .p-timeline-event {
    flex-direction: row-reverse;
}

.p-timeline-right .p-timeline-event-opposite {
    text-align: left;
}

.p-timeline-right .p-timeline-event-content {
    text-align: right;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) {
    flex-direction: row-reverse;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(odd) .p-timeline-event-opposite {
    text-align: right;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(odd) .p-timeline-event-content {
    text-align: left;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) .p-timeline-event-opposite {
    text-align: left;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) .p-timeline-event-content {
    text-align: right;
}

.p-timeline-vertical .p-timeline-event-opposite,
.p-timeline-vertical .p-timeline-event-content {
    padding: ${e("timeline.vertical.event.content.padding")};
}

.p-timeline-vertical .p-timeline-event-connector {
    width: ${e("timeline.event.connector.size")};
}

.p-timeline-event {
    display: flex;
    position: relative;
    min-height: ${e("timeline.event.min.height")};
}

.p-timeline-event:last-child {
    min-height: 0;
}

.p-timeline-event-opposite {
    flex: 1;
}

.p-timeline-event-content {
    flex: 1;
}

.p-timeline-event-separator {
    flex: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
}

.p-timeline-event-marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    align-self: baseline;
    border-width: ${e("timeline.event.marker.border.width")};
    border-style: solid;
    border-color: ${e("timeline.event.marker.border.color")};
    border-radius: ${e("timeline.event.marker.border.radius")};
    width: ${e("timeline.event.marker.size")};
    height: ${e("timeline.event.marker.size")};
    background: ${e("timeline.event.marker.background")};
}

.p-timeline-event-marker::before {
    content: " ";
    border-radius: ${e("timeline.event.marker.content.border.radius")};
    width: ${e("timeline.event.marker.content.size")};
    height:${e("timeline.event.marker.content.size")};
    background: ${e("timeline.event.marker.content.background")};
}

.p-timeline-event-marker::after {
    content: " ";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${e("timeline.event.marker.border.radius")};
    box-shadow: ${e("timeline.event.marker.content.inset.shadow")};
}

.p-timeline-event-connector {
    flex-grow: 1;
    background: ${e("timeline.event.connector.color")};
}

.p-timeline-horizontal {
    flex-direction: row;
}

.p-timeline-horizontal .p-timeline-event {
    flex-direction: column;
    flex: 1;
}

.p-timeline-horizontal .p-timeline-event:last-child {
    flex: 0;
}

.p-timeline-horizontal .p-timeline-event-separator {
    flex-direction: row;
}

.p-timeline-horizontal .p-timeline-event-connector {
    width: 100%;
    height: ${e("timeline.event.connector.size")};
}

.p-timeline-horizontal .p-timeline-event-opposite,
.p-timeline-horizontal .p-timeline-event-content {
    padding: ${e("timeline.horizontal.event.content.padding")};
}

.p-timeline-horizontal.p-timeline-alternate .p-timeline-event:nth-child(even) {
    flex-direction: column-reverse;
}

.p-timeline-bottom .p-timeline-event {
    flex-direction: column-reverse;
}
`,ie={root:({props:e})=>["p-timeline p-component","p-timeline-"+e.align,"p-timeline-"+e.layout],event:"p-timeline-event",eventOpposite:"p-timeline-event-opposite",eventSeparator:"p-timeline-event-separator",eventMarker:"p-timeline-event-marker",eventConnector:"p-timeline-event-connector",eventContent:"p-timeline-event-content"},V=(()=>{class e extends H{name="timeline";theme=te;classes=ie;static \u0275fac=(()=>{let i;return function(t){return(i||(i=T(e)))(t||e)}})();static \u0275prov=b({token:e,factory:e.\u0275fac})}return e})();var ne=(()=>{class e extends K{value;style;styleClass;align="left";layout="vertical";contentTemplate;oppositeTemplate;markerTemplate;templates;_contentTemplate;_oppositeTemplate;_markerTemplate;_componentStyle=$(V);get hostClass(){return this.styleClass}getBlockableElement(){return this.el.nativeElement.children[0]}ngAfterContentInit(){this.templates.forEach(i=>{switch(i.getType()){case"content":this._contentTemplate=i.template;break;case"opposite":this._oppositeTemplate=i.template;break;case"marker":this._markerTemplate=i.template;break}})}static \u0275fac=(()=>{let i;return function(t){return(i||(i=T(e)))(t||e)}})();static \u0275cmp=w({type:e,selectors:[["p-timeline"]],contentQueries:function(n,t,l){if(n&1&&(s(l,A,4),s(l,L,4),s(l,G,4),s(l,q,4)),n&2){let a;v(a=d())&&(t.contentTemplate=a.first),v(a=d())&&(t.oppositeTemplate=a.first),v(a=d())&&(t.markerTemplate=a.first),v(a=d())&&(t.templates=a)}},hostVars:24,hostBindings:function(n,t){n&2&&(m("data-pc-section","root")("data-pc-name","timeline"),O(t.style),I(t.hostClass),M("p-timeline",!0)("p-component",!0)("p-timeline-left",t.align==="left")("p-timeline-right",t.align==="right")("p-timeline-top",t.align==="top")("p-timeline-bottom",t.align==="bottom")("p-timeline-alternate",t.align==="alternate")("p-timeline-vertical",t.layout==="vertical")("p-timeline-horizontal",t.layout==="horizontal"))},inputs:{value:"value",style:"style",styleClass:"styleClass",align:"align",layout:"layout"},features:[Q([V]),z],decls:1,vars:1,consts:[["marker",""],["class","p-timeline-event",4,"ngFor","ngForOf"],[1,"p-timeline-event"],[1,"p-timeline-event-opposite"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[1,"p-timeline-event-separator"],[4,"ngIf","ngIfElse"],["class","p-timeline-event-connector",4,"ngIf"],[1,"p-timeline-event-content"],[1,"p-timeline-event-marker"],[1,"p-timeline-event-connector"]],template:function(n,t){n&1&&c(0,ee,10,15,"div",1),n&2&&p("ngForOf",t.value)},dependencies:[R,j,P,N,y],encapsulation:2,changeDetection:0})}return e})(),Te=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=F({type:e});static \u0275inj=C({imports:[ne,y,y]})}return e})();export{Te as a};
