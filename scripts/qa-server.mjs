// Local-only responsive and 200% text checks when an embedded browser cannot resize.
import http from 'node:http';
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1:4322');
    if(url.pathname==='/'){
      const page=url.searchParams.get('page')||'/zh/';
      const text=url.searchParams.get('mode')==='text';
      const safe=/^\/(zh|en)\/(?:[a-z-]+\/)*$/.test(page)?page:'/zh/';
      res.setHeader('Content-Type','text/html;charset=utf-8');
      res.end(`<html><head><title>Local layout check</title><style>body{margin:10px;font:14px system-ui;background:#e5e8ed}iframe{display:block;border:1px solid #ccd2dc;background:white}</style></head><body><p>${text?'200% text / 800px':'Mobile / 390px'} · Local QA only</p><iframe title="Portfolio preview" width="${text?800:390}" height="844" src="${text?'/zoom':''}${safe}"></iframe></body></html>`);return;
    }
    const zoom=url.pathname.startsWith('/zoom/');
    const upstream='http://127.0.0.1:4321'+(zoom?url.pathname.slice(5):url.pathname)+url.search;
    const response=await fetch(upstream);
    const mime=response.headers.get('content-type')||'application/octet-stream';
    res.statusCode=response.status;res.setHeader('Content-Type',mime);
    if(zoom&&mime.includes('text/html'))res.end((await response.text()).replace('</head>','<style>html{font-size:200%!important}</style></head>').replaceAll('href="/zh/','href="/zoom/zh/').replaceAll('href="/en/','href="/zoom/en/'));
    else res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){res.statusCode=500;res.end(String(error));}
}).listen(4322,'127.0.0.1',()=>console.log('Local QA: http://127.0.0.1:4322/'));
