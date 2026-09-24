const fields = document.querySelectorAll("[data-save]");
const checks = document.querySelectorAll("[data-check]");
const exportStatus = document.getElementById("exportStatus");

function setStatus(message, isError = false) {
  exportStatus.textContent = message;
  exportStatus.style.color = isError ? "#fca5a5" : "var(--green)";
}

function collectData() {
  const data = { version: 1, exportedAt: new Date().toISOString(), fields: {}, checks: {} };
  fields.forEach(el => data.fields[el.dataset.save] = el.value);
  checks.forEach(el => data.checks[el.dataset.check] = el.checked);
  return data;
}

function applyData(data) {
  if (!data || typeof data !== "object") throw new Error("This file doesn't contain saved CS110 project data.");
  fields.forEach(el => {
    if (Object.prototype.hasOwnProperty.call(data.fields || {}, el.dataset.save)) {
      el.value = String(data.fields[el.dataset.save] ?? "");
      localStorage.setItem("cs110_" + el.dataset.save, el.value);
    }
  });
  checks.forEach(el => {
    if (Object.prototype.hasOwnProperty.call(data.checks || {}, el.dataset.check)) {
      el.checked = Boolean(data.checks[el.dataset.check]);
      localStorage.setItem("cs110_check_" + el.dataset.check, el.checked);
    }
  });
  updateProgress();
}

fields.forEach(el => {
  const key = "cs110_" + el.dataset.save;
  const saved = localStorage.getItem(key);
  if (saved !== null) el.value = saved;
  el.addEventListener("input", () => localStorage.setItem(key, el.value));
});

checks.forEach(el => {
  const key = "cs110_check_" + el.dataset.check;
  el.checked = localStorage.getItem(key) === "true";
  el.addEventListener("change", () => {
    localStorage.setItem(key, el.checked);
    updateProgress();
  });
});

function updateProgress() {
  const total = checks.length;
  const done = [...checks].filter(c => c.checked).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById("completionPercent").textContent = pct + "%";
  document.getElementById("meterFill").style.width = pct + "%";
  document.getElementById("completionText").textContent = `${done} of ${total} checklist items complete`;
}
updateProgress();

// Download just the filled-in answers as a portable JSON backup.
document.getElementById("exportData").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(collectData(), null, 2)], {type:"application/json"});
  downloadBlob(blob, "cs110-saved-entries.json");
  setStatus("Saved answers exported as JSON.");
});

// Restore a previously exported JSON backup.
document.getElementById("importDataFile").addEventListener("change", async event => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    applyData(data);
    setStatus("Saved entries imported. Your browser now has the restored answers.");
  } catch (err) {
    setStatus("Could not import that file: " + err.message, true);
  }
  event.target.value = "";
});

// Offline full-site ZIP export. All project assets are embedded in export-assets.js.
document.getElementById("exportWebsite").addEventListener("click", () => {
  const button=document.getElementById("exportWebsite"); button.disabled=true; setStatus("Preparing offline website bundle…");
  try {
    const manifest=window.CS110_EXPORT_FILES; if(!manifest) throw new Error("Embedded website files are missing. Re-extract the project ZIP.");
    const snapshot = collectData();
    const entries=Object.entries(manifest).map(([name,b64])=>{
      let data=b64bytes(b64);
      if(name==="index.html"){
        let page=new TextDecoder().decode(data);
        page=page.replace(/\s*<script src="export-assets\.js"><\/script>/g, "");
        const inlineData="<script>window.CS110_BUNDLED_DATA = "+JSON.stringify(snapshot)+";</script>\\n";
        page=page.replace('<script src="script.js"></script>',inlineData+'<script src="script.js"></script>');
        data=new TextEncoder().encode(page);
      }
      return {name,data};
    });
    entries.push({name:"saved-entries.json",data:new TextEncoder().encode(JSON.stringify(snapshot,null,2))});
    entries.push({name:"EXPORTED-WITH-SAVED-ENTRIES.txt",data:new TextEncoder().encode("Includes saved fields and checklist in saved-entries.json.\nExtract and open index.html. If needed, use Import saved answers.\n")});
    downloadBlob(zipStore(entries),"CS110_Week5_Website_With_Saved_Entries.zip"); setStatus("Full website ZIP exported offline with your entries and checklist.");
  } catch(e) { setStatus("Website export failed: "+e.message,true); } finally {button.disabled=false;}
});
function b64bytes(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a;}
function zipStore(files){const enc=new TextEncoder(),locals=[],centrals=[];let off=0;
 for(const f of files){const n=enc.encode(f.name),d=f.data,c=crc32(d),l=new Uint8Array(30+n.length+d.length),v=new DataView(l.buffer);
 v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(8,0,true);v.setUint32(14,c,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,n.length,true);l.set(n,30);l.set(d,30+n.length);locals.push(l);
 const q=new Uint8Array(46+n.length),w=new DataView(q.buffer);w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(8,0x800,true);w.setUint32(16,c,true);w.setUint32(20,d.length,true);w.setUint32(24,d.length,true);w.setUint16(28,n.length,true);w.setUint32(42,off,true);q.set(n,46);centrals.push(q);off+=l.length;}
 const cs=centrals.reduce((a,b)=>a+b.length,0),e=new Uint8Array(22),v=new DataView(e.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,cs,true);v.setUint32(16,off,true);return new Blob([...locals,...centrals,e],{type:"application/zip"});}
function crc32(a){let c=0xffffffff;for(let x of a){c^=x;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

document.getElementById("clearData").addEventListener("click", () => {
  if (!confirm("Clear all saved CS110 entries and checklist states on this browser?")) return;
  [...fields, ...checks].forEach(el => localStorage.removeItem("cs110_" + (el.dataset.save || "check_" + el.dataset.check)));
  location.reload();
});

window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  document.getElementById("progressBar").style.width = (max ? scrollY / max * 100 : 0) + "%";
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("in-view");
  });
}, {threshold:.08});
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));


// Restore data embedded directly into an exported index.html. This works when
// the ZIP is extracted and the page is opened using file:// as well.
if (window.CS110_BUNDLED_DATA && window.CS110_BUNDLED_DATA.fields) {
  applyData(window.CS110_BUNDLED_DATA);
  setStatus("Saved entries from this exported website are loaded.");
}

// Also support a separate saved-entries.json file when the browser permits fetch.
(async function restoreBundledData() {
  try {
    const response = await fetch(new URL("saved-entries.json", document.baseURI));
    if (response.ok) {
      const data = await response.json();
      if (data && data.fields && data.checks) {
        applyData(data);
        setStatus("Saved entries from the exported website bundle are loaded.");
      }
    }
  } catch (_) {
    // The embedded data path above handles file:// exports without fetch access.
  }
})();
