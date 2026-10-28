import * as T from "three";

/** Both states share the same vertex topology, including during reverse scroll. */
export function noteGeometry(width:number,height:number){
 const g=new T.SphereGeometry(.85,96,64);
 const positions=g.attributes.position as T.BufferAttribute;
 const normals=g.attributes.normal as T.BufferAttribute;
 const sphere=new Float32Array(positions.array),sphereNormals=new Float32Array(normals.array);
 const card=new Float32Array(sphere.length),direction=new T.Vector3(),point=new T.Vector3();
 const half=new T.Vector3(width*.5,height*.5,.09),radius=.075;
 const distance=(p:T.Vector3)=>{
  const x=Math.abs(p.x)-half.x+radius,y=Math.abs(p.y)-half.y+radius,z=Math.abs(p.z)-half.z+radius;
  return Math.min(Math.max(x,y,z),0)+Math.hypot(Math.max(x,0),Math.max(y,0),Math.max(z,0))-radius;
 };
 for(let i=0;i<positions.count;i++){
  direction.fromBufferAttribute(positions,i).normalize();
  let lo=0,hi=Math.max(width,height);
  for(let j=0;j<20;j++){const mid=(lo+hi)*.5;point.copy(direction).multiplyScalar(mid);if(distance(point)>0)hi=mid;else lo=mid;}
  direction.multiplyScalar((lo+hi)*.5).toArray(card,i*3);
 }
 const target=g.clone();target.setAttribute("position",new T.BufferAttribute(card,3));target.computeVertexNormals();
 g.userData={card,cardNormals:new Float32Array(target.attributes.normal.array),sphere,sphereNormals,morph:-1};
 target.dispose();positions.setUsage(T.DynamicDrawUsage);normals.setUsage(T.DynamicDrawUsage);
 g.boundingSphere=new T.Sphere(new T.Vector3(),Math.max(.85,Math.hypot(width*.5,height*.5)));
 return g;
}
