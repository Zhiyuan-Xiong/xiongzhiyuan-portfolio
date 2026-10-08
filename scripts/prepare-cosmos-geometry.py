from pathlib import Path
import rhino3dm as r,numpy as np,gzip,json,struct,hashlib,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/media/cosmos';OUT.mkdir(parents=True,exist_ok=True)
source=Path(r'D:\skills portfolio\源文件\Rhino-grasshopper-processing\rhino model\infinite cosmos.3dm');doc=r.File3dm.Read(str(source));positions=[];normals=[];colors=[];indices=[];offset=0;objects=0;red=0
for obj in doc.Objects:
 a=obj.Attributes
 if not a.Visible or a.Mode!=r.ObjectMode.Normal or not doc.Layers[a.LayerIndex].Visible:continue
 g=obj.Geometry;meshes=[]
 if isinstance(g,r.Mesh):meshes=[g]
 elif isinstance(g,r.Brep):meshes=[face.GetMesh(r.MeshType.Render) for face in g.Faces]
 elif isinstance(g,r.Extrusion):meshes=[g.GetMesh(r.MeshType.Render)]
 else:raise ValueError('Unexpected visible geometry: '+type(g).__name__)
 if not meshes or not all(meshes):raise ValueError('Missing render mesh for original geometry')
 color=(236,234,237)
 if a.MaterialSource==r.ObjectMaterialSource.MaterialFromObject and a.MaterialIndex>=0:
  c=doc.Materials[a.MaterialIndex].DiffuseColor;color=tuple(c[:3])
 elif doc.Layers[a.LayerIndex].Name.lower()=='shelf':color=(255,0,0)
 color=(222,24,37) if color[0]>220 and color[1]<80 and color[2]<80 else (236,234,237)
 objects+=1
 for mesh in meshes:
  n=len(mesh.Vertices)
  if len(mesh.Normals)!=n:mesh.Normals.ComputeNormals()
  v=np.array([(p.X,p.Z,-p.Y) for p in mesh.Vertices],dtype=np.float32);no=np.array([(p.X,p.Z,-p.Y) for p in mesh.Normals],dtype=np.float32)
  faces=np.array([tuple(f) for f in mesh.Faces],dtype=np.uint32);tri=faces[:,:3];quads=faces[faces[:,2]!=faces[:,3]];extra=quads[:,[0,2,3]]
  positions.append(v);normals.append(no);colors.append(np.tile(np.array(color,dtype=np.uint8),(n,1)));indices.append(np.concatenate([tri,extra],axis=0).reshape(-1)+offset);offset+=n
  if color[1]<80:red+=n
p=np.concatenate(positions);n=np.concatenate(normals);c=np.concatenate(colors);idx=np.concatenate(indices).astype('<u4');lo=p.min(axis=0);hi=p.max(axis=0);center=(hi+lo)*.5;scale=3/float((hi-lo).max());p=(p-center)*scale
packed=np.rint(np.clip((p/4+.5)*65535,0,65535)).astype('<u2');ns=np.rint(np.clip(n,-1,1)*127).astype('i1');header=struct.pack('<4I',0x4d534f43,1,len(p),len(idx));blob=header+packed.tobytes()+ns.tobytes()+c.tobytes()+idx.tobytes();compressed=gzip.compress(blob,compresslevel=8);(OUT/'rhino-mesh.bin.gz').write_bytes(compressed)
# Sample the same OBJ face vertices that Processing's PShape enumerates, per object.
obj=Path(r'D:\skills portfolio\源文件\Rhino-grasshopper-processing\processing\data\model.obj');verts=[];groups=[];current=[]
for line in obj.open(encoding='utf8',errors='replace'):
 parts=line.split()
 if not parts:continue
 if parts[0]=='v':verts.append(list(map(float,parts[1:4])))
 elif parts[0]=='o':
  if current:groups.append(current);current=[]
 elif parts[0]=='f':current.extend(int(x.split('/')[0])-1 for x in parts[1:])
if current:groups.append(current)
step=math.ceil(sum(len(g) for g in groups)/30000);v=np.array(verts,dtype=np.float32);sample=np.concatenate([v[np.array(g[::step])] for g in groups]);sample-=sample.mean(axis=0);sample*=.9/abs(sample).max();(OUT/'processing-points.bin.gz').write_bytes(gzip.compress(sample.astype('<f4').tobytes(),compresslevel=8))
meta={'mesh':{'src':'/media/cosmos/rhino-mesh.bin.gz','vertices':len(p),'triangles':len(idx)//3,'objects':objects,'bytes':len(compressed)},'particles':{'src':'/media/cosmos/processing-points.bin.gz','count':len(sample),'step':step,'vines':160}}
(ROOT/'src/data/cosmos-interactive.json').write_text(json.dumps(meta,indent=2)+'\n',encoding='utf8')
(ROOT/'.cache/cosmos/geometry-provenance.json').write_text(json.dumps({'rhino_source':str(source),'rhino_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'processing_source':str(obj),'obj_sha256':hashlib.sha256(obj.read_bytes()).hexdigest(),'mesh_bounds_before_conversion':[lo.tolist(),hi.tolist()],'red_vertices':red,**meta},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(meta));print('Geometry bytes',len(blob),'compressed',len(compressed))
