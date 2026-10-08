(function(){
  const base=(window.NBRP_CONFIG&&window.NBRP_CONFIG.API_BASE||'').replace(/\/$/,'');
  async function request(path, options={}){
    const res=await fetch(base+path,{credentials:'include',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
    let data=null; try{data=await res.json()}catch{}
    if(!res.ok) throw new Error((data&&data.error)||`Request failed (${res.status})`);
    return data;
  }
  window.NBRPApi={
    me:()=>request('/api/me'),
    register:(body)=>request('/api/auth/register',{method:'POST',body:JSON.stringify(body)}),
    login:(body)=>request('/api/auth/login',{method:'POST',body:JSON.stringify(body)}),
    logout:()=>request('/api/auth/logout',{method:'POST'}),
    listReports:(q='')=>request('/api/reports'+(q?'?q='+encodeURIComponent(q):'')),
    getReport:(id)=>request('/api/reports/'+encodeURIComponent(id)),
    createReport:(body)=>request('/api/reports',{method:'POST',body:JSON.stringify(body)}),
    updateReport:(id,body)=>request('/api/reports/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify(body)}),
    deleteReport:(id)=>request('/api/reports/'+encodeURIComponent(id),{method:'DELETE'}),
    duplicateReport:(id)=>request('/api/reports/'+encodeURIComponent(id)+'/duplicate',{method:'POST'}),
    updatePhotoNote:(reportId,photoId,note)=>request('/api/reports/'+encodeURIComponent(reportId)+'/photos/'+encodeURIComponent(photoId),{method:'PUT',body:JSON.stringify({note})}),
    adminOverview:()=>request('/api/admin/overview'),
    adminUsers:(q='')=>request('/api/admin/users'+(q?'?q='+encodeURIComponent(q):'')),
    uploadPhoto:async(reportId,file,note='',sortOrder=0)=>{
      const fd=new FormData();fd.append('file',file);fd.append('note',note);fd.append('sort_order',String(sortOrder));
      const res=await fetch(base+'/api/reports/'+encodeURIComponent(reportId)+'/photos',{method:'POST',credentials:'include',body:fd});
      const data=await res.json();if(!res.ok)throw new Error(data.error||'Upload failed');return data;
    },
    deletePhoto:(reportId,photoId)=>request('/api/reports/'+encodeURIComponent(reportId)+'/photos/'+encodeURIComponent(photoId),{method:'DELETE'}),
    reorderPhotos:(reportId,ids)=>request('/api/reports/'+encodeURIComponent(reportId)+'/photos/reorder',{method:'POST',body:JSON.stringify({ids})}),
    uploadSignature:async(reportId,blob)=>{const fd=new FormData();fd.append('file',blob,'signature.png');const res=await fetch(base+'/api/reports/'+encodeURIComponent(reportId)+'/signature',{method:'POST',credentials:'include',body:fd});const data=await res.json();if(!res.ok)throw new Error(data.error||'Signature upload failed');return data;},
    mediaUrl:(key)=>key
  };
})();
