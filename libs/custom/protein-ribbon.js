(function () {
  'use strict';
  // An illustrative chignolin-like hairpin: one straight ribbon bends into
  // two parallel arms joined by a rounded turn. This is not an MD trajectory.
  var length = 220;
  var radius = 30;
  var arm = (length - Math.PI * radius) / 2;
  var segments = 144;
  var halfWidth = 8;

  function angleAt(distance, fold) {
    var angle = distance < arm ? Math.PI / 2 :
      distance > length - arm ? -Math.PI / 2 :
      Math.PI / 2 - (distance - arm) / radius;
    return angle * fold;
  }

  window.ResearchRibbon = {
    draw: function (ctx, cx, cy, scale, fold) {
      fold = Math.max(0, Math.min(1, fold));
      var points = [{x: 0, y: 0}], step = length / segments;
      var x = 0, y = 0, minY = 0, maxY = 0;
      // Integrating the tangent preserves ribbon length throughout the bend,
      // so it folds at its center rather than shrinking or twisting into knots.
      for (var i = 1; i <= segments; i++) {
        var angle = angleAt((i - .5) * step, fold);
        x += Math.cos(angle) * step;
        y += Math.sin(angle) * step;
        points.push({x: x, y: y});
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      var centerX = x / 2, centerY = (minY + maxY) / 2;
      var rings = [], faces = [], frames = [];
      // A bevelled rectangular cross-section gives the ribbon real width,
      // front/back surfaces and thickness, rather than an extruded 2D line.
      var section = [[-1,0],[-.78,3.2],[.78,3.2],[1,0],[.78,-3.2],[-.78,-3.2]];
      function normalize(v) {
        var size = Math.hypot(v.x,v.y,v.z) || 1;
        return {x:v.x/size,y:v.y/size,z:v.z/size};
      }
      function cross(a,b) { return {x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}; }
      function subtract(a,b) { return {x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}; }
      function camera(p) {
        var yaw = -.42, pitch = .34, roll = -.18;
        var x = p.x*Math.cos(yaw)+p.z*Math.sin(yaw);
        var z = -p.x*Math.sin(yaw)+p.z*Math.cos(yaw);
        var y = p.y*Math.cos(pitch)-z*Math.sin(pitch);
        z = p.y*Math.sin(pitch)+z*Math.cos(pitch);
        return {x:x*Math.cos(roll)-y*Math.sin(roll),y:x*Math.sin(roll)+y*Math.cos(roll),z:z};
      }
      points.forEach(function(point,index) {
        var t = index / segments, angle = angleAt(index * step,fold);
        // Gentle torsion lets the broad ribbon face turn toward and away
        // from the light while preserving the simple straight-to-U silhouette.
        var twist = .75*Math.sin(t*Math.PI*1.6-.5)+.2;
        var width = {x:-Math.sin(angle)*Math.cos(twist),y:Math.cos(angle)*Math.cos(twist),z:Math.sin(twist)};
        var tangent = {x:Math.cos(angle),y:Math.sin(angle),z:0};
        var normal = cross(tangent,width);
        frames.push({point:point,width:width,normal:normal});
        rings.push(section.map(function(edge) {
          return camera({x:point.x-centerX+width.x*edge[0]*halfWidth+normal.x*edge[1],
            y:point.y-centerY+width.y*edge[0]*halfWidth+normal.y*edge[1],
            z:width.z*edge[0]*halfWidth+normal.z*edge[1]});
        }));
      });
      function addFace(vertices,bevel) {
        var normal = normalize(cross(subtract(vertices[1],vertices[0]),subtract(vertices[3],vertices[0])));
        if (normal.z <= 0) return;
        faces.push({vertices:vertices,normal:normal,bevel:bevel,
          z:vertices.reduce(function(sum,p){return sum+p.z;},0)/vertices.length});
      }
      for(var j=0;j<segments;j++) {
        for(var k=0;k<section.length;k++) {
          var next = (k+1)%section.length;
          addFace([rings[j][k],rings[j+1][k],rings[j+1][next],rings[j][next]],k!==1 && k!==4);
        }
      }
      addFace(rings[0].slice().reverse(),true);
      addFace(rings[segments],true);
      // A schematic ten-residue backbone (N–Cα–C, with carbonyl O) follows
      // the same moving frame as the ribbon. These are illustrative atom
      // positions, not an all-atom reconstruction of a specific sequence.
      function addAtom(index,lateral,element) {
        var frame=frames[index],p=frame.point,w=frame.width,n=frame.normal;
        var position=camera({x:p.x-centerX+w.x*lateral+n.x*8,
          y:p.y-centerY+w.y*lateral+n.y*8,z:w.z*lateral+n.z*8});
        return {point:position,element:element};
      }
      function addBond(a,b) {
        faces.push({type:'bond',a:a.point,b:b.point,elements:[a.element,b.element],z:(a.point.z+b.point.z)/2});
      }
      var previous=null;
      for(var atomIndex=0;atomIndex<30;atomIndex++) {
        var index=Math.round(atomIndex/29*segments);
        var lateral=atomIndex%3===1?4:-4;
        var atom=addAtom(index,lateral,atomIndex%3===0?'N':'C');
        if(previous)addBond(previous,atom);
        if(atomIndex%3===2)addBond(atom,addAtom(index,-19,'O'));
        previous=atom;
      }
      function project(p) {
        var perspective=650/(650-p.z);
        return {x:cx+p.x*scale*perspective,y:cy+p.y*scale*perspective,scale:scale*perspective};
      }
      var stickColors={C:['#738eb9','#e1ebff','#b7caee'],N:['#7b6ab6','#e8e0ff','#a088e0'],O:['#a86c99','#ffdeee','#e58bbc']};
      faces.sort(function(a,b){return a.z-b.z;});
      var light = normalize({x:-.45,y:-.65,z:1});
      ctx.save();ctx.globalAlpha=1;ctx.lineJoin='round';
      faces.forEach(function(face) {
        if(face.type==='bond') {
          var a=project(face.a),b=project(face.b);
          var middle={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
          var dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
          var diameter=2.8*(a.scale+b.scale)/2;
          var nx=-dy/length*diameter/2,ny=dx/length*diameter/2;
          // Two element-colored cylinder halves form a stick, with no
          // enlarged spheres at the joints. Ribbon geometry stays on the
          // backbone; carbonyl branches remain sticks only.
          [[a,middle],[middle,b]].forEach(function(half,index) {
            var colors=stickColors[face.elements[index]];
            var material=ctx.createLinearGradient(middle.x-nx,middle.y-ny,middle.x+nx,middle.y+ny);
            material.addColorStop(0,colors[0]);material.addColorStop(.35,colors[1]);material.addColorStop(1,colors[2]);
            ctx.lineCap='round';ctx.lineWidth=diameter;ctx.strokeStyle=material;
            ctx.beginPath();ctx.moveTo(half[0].x,half[0].y);ctx.lineTo(half[1].x,half[1].y);ctx.stroke();
          });
          return;
        }
        var n=face.normal;
        var diffuse=Math.max(0,n.x*light.x+n.y*light.y+n.z*light.z);
        var brightness=46+diffuse*36+(face.bevel?3:0);
        // Opaque satin periwinkle: shape-dependent lighting, without glass.
        ctx.fillStyle='hsl(257,60%,'+brightness+'%)';
        ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.4*scale;
        ctx.beginPath();
        face.vertices.forEach(function(p,index) {
          var perspective=650/(650-p.z);
          var px=cx+p.x*scale*perspective,py=cy+p.y*scale*perspective;
          if(index===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
        });
        ctx.closePath();ctx.fill();ctx.stroke();
      });
      ctx.restore();
    }
  };
})();
