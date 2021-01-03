(this.webpackJsonpcharges=this.webpackJsonpcharges||[]).push([[0],{100:function(t,s,e){},125:function(t,s,e){"use strict";e.r(s);var i=e(20),a=e(0),r=e.n(a),n=e(17),o=e.n(n),h=(e(99),e(129)),l=e(132),c=e(130),u=e(133),d=e(134),v=(e(100),e(50)),b=e(28),f=e(29),p=e(5),g=function(){function t(s,e,i,a){Object(b.a)(this,t),this.sys=void 0,this.two=void 0,this.showDebug=void 0,this.scale=void 0,this.partSprites=void 0,this.sys=s,this.two=e,this.showDebug=a,this.scale=i,a&&this.drawSpatialHash(),this.partSprites=new Array(s.maxParts);for(var r=0;r<s.maxParts;r++)this.partSprites[r]=this.makeNegCharge();this.update()}return Object(f.a)(t,[{key:"drawSpatialHash",value:function(){for(var t=this,s=this.sys.spatial.origin,e=this.sys.spatial.cellSize,i=this.sys.spatial.grid.nCols,a=this.sys.spatial.grid.nRows,r=function(s,e,i,a){t.two.makeLine(s,e,i,a).stroke="lightgrey"},n=0;n<i;n++){var o=p.b.clone(s);p.b.add(o,o,p.b.fromValues(n*e,0));var h=this.toScreen(o),l=Object(v.a)(h,2),c=l[0],u=l[1],d=p.b.clone(o);p.b.add(d,d,p.b.fromValues(0,a*e));var b=this.toScreen(d),f=Object(v.a)(b,2);r(c,u,f[0],f[1])}for(var g=0;g<a;g++){var y=p.b.clone(s);p.b.add(y,y,p.b.fromValues(0,g*e));var m=this.toScreen(y),j=Object(v.a)(m,2),w=j[0],k=j[1],O=p.b.clone(y);p.b.add(O,O,p.b.fromValues(i*e,0));var C=this.toScreen(O),P=Object(v.a)(C,2);r(w,k,P[0],P[1])}}},{key:"makeNegCharge",value:function(){var t=this.two.makeCircle(0,0,this.sys.rad);t.fill="purple",t.linewidth=.1;var s=this.two.makeRectangle(0,0,1.2*this.sys.rad,.3*this.sys.rad);s.fill="black",s.noStroke();var e=this.two.makeGroup([t]);if(this.showDebug){var i=this.two.makeCircle(0,0,this.sys.collisionRad);i.noFill(),i.linewidth=.1,i.stroke="lightgrey",e.add(i)}return e}},{key:"toScreen",value:function(t){var s=p.b.fromValues(this.two.width/2,this.two.height/2),e=p.b.create();return p.b.scaleAndAdd(e,s,t,this.scale),e}},{key:"update",value:function(){for(var t=0;t<this.sys.nParts;t++){var s=this.toScreen(this.sys.pos[t]);this.partSprites[t].translation.set(s[0],s[1]),this.partSprites[t].scale=this.scale}}}]),t}(),y=e(36),m=e(70),j=function(){function t(s,e,i){Object(b.a)(this,t),this.nRows=void 0,this.nCols=void 0,this.cells=void 0,this.nRows=e,this.nCols=i,this.cells=new Array(e*i);for(var a=0;a<this.cells.length;a++)this.cells[a]=new s}return Object(f.a)(t,[{key:"get",value:function(t,s){return this.cells[s+t*this.nCols]}},{key:"getCellAndNeighbors",value:function(t,s){var e=[[0,0],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]],i=new Array(e.length);i.length=0;for(var a=0,r=e;a<r.length;a++){var n=r[a],o=t+n[0],h=s+n[1];this.inBounds(o,h)&&i.push(this.get(o,h))}return i}},{key:"inBounds",value:function(t,s){return t>=0&&t<this.nRows&&s>=0&&s<this.nCols}},{key:"getCells",value:function(){return this.cells}}]),t}(),w=function(){function t(){Object(b.a)(this,t),this.partIds=void 0,this.partIds=new Array(10),this.clear()}return Object(f.a)(t,[{key:"add",value:function(t){this.partIds.push(t)}},{key:"remove",value:function(t){var s=this.partIds.indexOf(t);this.partIds.splice(s,1)}},{key:"ids",value:function(){return this.partIds}},{key:"clear",value:function(){this.partIds.length=0}}]),t}(),k=function(){function t(s,e,i){Object(b.a)(this,t),this.cellSize=void 0,this.invCellSize=void 0,this.bounds=void 0,this.origin=void 0,this.grid=void 0,this.idToCell=void 0,this.cellSize=e,this.invCellSize=1/e,this.bounds=i,this.origin=i.min;var a=Math.ceil((i.max[0]-i.min[0])/e),r=Math.ceil((i.max[0]-i.min[0])/e);this.grid=new j(w,r,a),this.idToCell=new Array(s.length),this.updateParticles(s)}return Object(f.a)(t,[{key:"checkBounds",value:function(t){var s,e=Object(y.a)(t);try{for(e.s();!(s=e.n()).done;){var i=s.value;if(i[0]>this.bounds.max[0]||i[1]>this.bounds.max[1]||i[0]<this.bounds.min[0]||i[1]<this.bounds.min[1])throw new Error("Attempting to add particle outside of bounds")}}catch(a){e.e(a)}finally{e.f()}}},{key:"updateParticles",value:function(t){var s,e=Object(y.a)(this.grid.getCells());try{for(e.s();!(s=e.n()).done;){s.value.clear()}}catch(n){e.e(n)}finally{e.f()}for(var i=0;i<t.length;i++){var a=t[i],r=this.getCell(a);r.add(i),this.idToCell[i]=r}}},{key:"setParticle",value:function(t,s){var e=this.idToCell[t],i=this.getCell(s);i!==e&&(e.remove(t),i.add(t),this.idToCell[t]=i)}},{key:"pointToId",value:function(t){var s=p.b.create();return p.b.sub(s,t,this.origin),p.b.scale(s,s,this.invCellSize),p.b.floor(s,s),[s[0],s[1]]}},{key:"getCell",value:function(t){var s;return(s=this.grid).get.apply(s,Object(m.a)(this.pointToId(t)))}},{key:"getCellAndNeighbors",value:function(t){var s;return(s=this.grid).getCellAndNeighbors.apply(s,Object(m.a)(this.pointToId(t)))}},{key:"getParticles",value:function(t,s,e){var i,a=new Array,r=this.getCellAndNeighbors(s),n=Object(y.a)(r);try{for(n.s();!(i=n.n()).done;){var o,h=i.value,l=Object(y.a)(h.ids());try{for(l.s();!(o=l.n()).done;){var c=o.value,u=t[c];p.b.sqrDist(u,s)<e&&a.push(c)}}catch(d){l.e(d)}finally{l.f()}}}catch(d){n.e(d)}finally{n.f()}return a}}]),t}(),O=function(){function t(s,e,i){Object(b.a)(this,t),this.useSpatial=void 0,this.spatial=void 0,this.pos=void 0,this.oldPos=void 0,this.charge=void 0,this.invMass=void 0,this.nParts=void 0,this.maxParts=void 0,this.rad=void 0,this.collisionRad=void 0,this.bounds=void 0,this.force=void 0,this.nParts=s,this.maxParts=s,this.rad=1,this.collisionRad=this.rad*this.rad*4,this.bounds=this.getBounds(e,i),this.pos=new Array(s),this.oldPos=new Array(s);for(var a=0;a<s;a++)this.pos[a]=p.b.fromValues(2*this.rad+this.bounds.min[0]+2*(a/10>>0),a%10*2),this.oldPos[a]=p.b.clone(this.pos[a]);this.charge=new Array(s),this.charge.fill(-1),this.invMass=new Array(s),this.invMass.fill(1),this.force=new Array(s);for(var r=0;r<this.nParts;r++)this.force[r]=p.b.fromValues(0,0);this.useSpatial=!0;var n=4*this.rad,o=8*this.rad*2,h={max:p.b.fromValues(e/2+o,i/2+o),min:p.b.fromValues(-e/2-o,-i/2-o)};this.spatial=new k(this.pos,n,h)}return Object(f.a)(t,[{key:"getBounds",value:function(t,s){return{max:p.b.fromValues(t/2-this.rad,s/2-this.rad),min:p.b.fromValues(-(t/2-this.rad),-(s/2-this.rad))}}},{key:"updateBounds",value:function(t,s){this.bounds=this.getBounds(t,s)}},{key:"setCharge",value:function(t){this.charge.fill(t)}},{key:"attractParticles",value:function(t,s){for(var e=0;e<this.nParts;e++){var i=p.b.create();p.b.sub(i,t,this.pos[e]),p.b.normalize(i,i),p.b.scale(i,i,s),p.b.add(this.force[e],this.force[e],i)}}},{key:"applyCoulombForces",value:function(){for(var t=0;t<this.nParts;t++)for(var s=this.charge[t],e=t+1;e<this.nParts;e++){var i=s*this.charge[e]/p.b.sqrDist(this.pos[t],this.pos[e])*50,a=p.b.create();p.b.sub(a,this.pos[e],this.pos[t]),p.b.normalize(a,a);var r=p.b.create();p.b.scale(r,a,-i);var n=p.b.create();p.b.scale(n,a,i),p.b.add(this.force[t],this.force[t],r),p.b.add(this.force[e],this.force[e],n)}}},{key:"applyGravity",value:function(){for(var t=p.b.fromValues(0,9.8),s=0;s<this.nParts;s++)p.b.add(this.force[s],this.force[s],t)}},{key:"updatePosition",value:function(t,s){this.pos[t]=s,this.useSpatial&&this.spatial.setParticle(t,s)}},{key:"step",value:function(t){this.applyCoulombForces();for(var s=0;s<this.nParts;s++){var e=this.oldPos[s],i=this.pos[s],a=p.b.create();p.b.scale(a,this.force[s],this.invMass[s]);var r=p.b.create();p.b.scale(r,i,2),p.b.scaleAndAdd(r,r,e,-1),p.b.scaleAndAdd(r,r,a,t*t),this.updatePosition(s,r),this.oldPos[s]=i}for(var n=0;n<2;n++)for(var o=0;o<this.nParts;o++)if(p.b.min(this.pos[o],this.pos[o],this.bounds.max),p.b.max(this.pos[o],this.pos[o],this.bounds.min),this.useSpatial){var h,l=this.spatial.getParticles(this.pos,this.pos[o],this.collisionRad),c=Object(y.a)(l);try{for(c.s();!(h=c.n()).done;){var u=h.value;u!==o&&this.resolveCollision(o,u)}}catch(b){c.e(b)}finally{c.f()}}else for(var d=o+1;d<this.nParts;d++)this.resolveCollision(o,d);for(var v=0;v<this.nParts;v++)this.force[v]=p.b.fromValues(0,0)}},{key:"resolveCollision",value:function(t,s){var e=this.pos[t],i=this.pos[s];if(p.b.sqrDist(e,i)<Math.pow(2*this.rad,2)){var a=p.b.create();p.b.add(a,e,i),p.b.scale(a,a,.5);var r=p.b.create();p.b.sub(r,e,a),p.b.normalize(r,r),p.b.scale(r,r,this.rad);var n=p.b.create();p.b.add(n,a,r);var o=p.b.create();p.b.scaleAndAdd(o,a,r,-1),this.updatePosition(t,n),this.updatePosition(s,o)}}}]),t}(),C=e(45),P=e.n(C);p.a.setMatrixArrayType(Array);var x=function(){var t=Object(a.useRef)(),s=Object(a.useRef)(new P.a({fullscreen:!0,autostart:!0})),e=s.current.width/14,r=s.current.height/14,n=Object(a.useRef)(new O(100,e,r)),o=Object(a.useRef)(new g(n.current,s.current,14,!1));function v(){var t=s.current.width/14,e=s.current.height/14;n.current.updateBounds(t,e)}function b(){n.current.attractParticles(p.b.fromValues(.1,.1),20),n.current.step(.05),o.current.update()}return Object(a.useEffect)((function(){var e=s.current;return e.appendTo(t.current),e.bind(P.a.Events.update,b),e.bind(P.a.Events.resize,v),function(){e.unbind(P.a.Events.update,b),e.unbind(P.a.Events.resize,v)}}),[]),Object(i.jsxs)("div",{children:[Object(i.jsxs)(h.a,{title:"Parameters",className:"control-panel",children:[Object(i.jsx)(l.a,{type:"primary",onClick:function(){n.current.attractParticles(p.b.fromValues(0,0),200)},children:"Test"}),Object(i.jsxs)("div",{className:"charge-slider",children:[Object(i.jsx)(u.a,{}),Object(i.jsx)(c.a,{defaultValue:-1,min:-2,max:2,step:.01,onChange:function(t){n.current.setCharge(t)}}),Object(i.jsx)(d.a,{})]})]}),Object(i.jsx)("div",{children:Object(i.jsx)("div",{className:"stage",ref:t})})]})},A=function(){return Object(i.jsxs)("div",{className:"Charges",children:[Object(i.jsx)("header",{className:"Charges-header"}),Object(i.jsx)(x,{})]})},S=function(t){t&&t instanceof Function&&e.e(3).then(e.bind(null,135)).then((function(s){var e=s.getCLS,i=s.getFID,a=s.getFCP,r=s.getLCP,n=s.getTTFB;e(t),i(t),a(t),r(t),n(t)}))};o.a.render(Object(i.jsx)(r.a.StrictMode,{children:Object(i.jsx)(A,{})}),document.getElementById("root")),S()},99:function(t,s,e){}},[[125,1,2]]]);
//# sourceMappingURL=main.fcb29fae.chunk.js.map