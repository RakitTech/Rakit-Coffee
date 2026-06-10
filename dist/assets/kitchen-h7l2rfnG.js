import{t as e}from"./store-Cz5k5dBT.js";document.addEventListener(`DOMContentLoaded`,()=>{t(),n(),e.subscribe(()=>{n()})});function t(){let e=document.getElementById(`clock`);setInterval(()=>{e.textContent=new Date().toLocaleTimeString(`id-ID`)},1e3),setInterval(()=>{n()},1e4)}function n(){let t=e.getOrders(),n={Diterima:document.getElementById(`col-diterima`),Dimasak:document.getElementById(`col-dimasak`),Siap:document.getElementById(`col-siap`)},r={Diterima:0,Dimasak:0,Siap:0};Object.values(n).forEach(e=>{e&&(e.innerHTML=``)});let i=Date.now();t.forEach(e=>{e.items.forEach(t=>{let a=t.status||`Diterima`,o=t.itemId||`unknown`;if(!(a===`Siap`&&t.completedAt&&i-new Date(t.completedAt).getTime()>6e4)&&n[a]){r[a]++;let i=document.createElement(`div`);i.className=`kds-card`;let s=new Date(e.timestamp).toLocaleTimeString(`id-ID`,{hour:`2-digit`,minute:`2-digit`}),c=`<ul class="kds-item-list" style="margin-top: 12px;">`,l=``;t.sugar&&t.sugar!==`Normal`&&(l+=`<span class="kds-item-note">Gula: ${t.sugar}</span> `),t.note&&(l+=`<span class="kds-item-note">Catatan: ${t.note}</span>`),c+=`
          <li>
            <div class="kds-item" style="font-size: 18px; font-weight: bold;">${t.qty}x ${t.name}</div>
            ${l?`<div style="margin-top: 4px;">${l}</div>`:``}
          </li>
        `,c+=`</ul>`;let u=``;a===`Diterima`?u=`<button class="btn btn-primary" onclick="updateItemStatus('${e.id}', '${o}', 'Dimasak')">Proses</button>`:a===`Dimasak`?u=`<button class="btn" style="background-color: var(--color-success); color: white;" onclick="updateItemStatus('${e.id}', '${o}', 'Siap')">Selesai</button>`:a===`Siap`&&(u=`<span style="color: var(--color-success); font-weight: bold; text-align: center; display: block; width: 100%;">Menunggu Diambil Pelayan</span>`),i.innerHTML=`
          <div class="kds-card-header">
            <span class="kds-card-table">Meja ${e.table}</span>
            <span class="kds-card-time">${s}</span>
          </div>
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--color-text-muted);">Pesanan: ${e.customerName}</div>
          ${c}
          <div class="kds-card-actions">
            ${u}
          </div>
        `,n[a].appendChild(i)}})}),document.getElementById(`count-diterima`).textContent=r.Diterima,document.getElementById(`count-dimasak`).textContent=r.Dimasak,document.getElementById(`count-siap`).textContent=r.Siap}window.updateStatus=function(t,n){e.updateOrderStatus(t,n)},window.updateItemStatus=function(t,n,r){e.updateOrderItemStatus(t,n,r)};