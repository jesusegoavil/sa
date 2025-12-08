function ipToInt(ip) {
  const p = ip.split('.').map(Number);
  return ((p[0]<<24)>>>0)+((p[1]<<16)>>>0)+((p[2]<<8)>>>0)+p[3];
}
function intToIp(int) {
  return [(int>>>24)&255,(int>>>16)&255,(int>>>8)&255,int&255].join('.');
}

function prefixForHosts(hosts){
  let need = hosts + 2;
  let bits = Math.ceil(Math.log2(need));
  return {
    prefijo: 32 - bits,
    size: Math.pow(2, bits)
  };
}

function generarCampos(){
  const n = parseInt(numSubredes.value);
  campos.innerHTML = "";
  for (let i=0;i<n;i++){
    campos.innerHTML += `
      <label>Hosts SR ${i+1}</label>
      <input type="number" id="sr${i}" placeholder="Hosts">
    `;
  }
}

function calcularVLSM(){
  const base = ipToInt(ipBase.value);
  const pref = parseInt(prefijoBase.value);
  const n = parseInt(numSubredes.value);

  let needs = [];
  for(let i=0;i<n;i++){
    needs.push(parseInt(document.getElementById("sr"+i).value));
  }

  needs.sort((a,b)=>b-a);

  let baseNet = base & (0xFFFFFFFF << (32-pref));
  let output = `
    <table>
      <tr>
        <th>SR</th>
        <th>Hosts</th>
        <th>Prefijo</th>
        <th>Red</th>
        <th>Primera</th>
        <th>Última</th>
        <th>Broadcast</th>
      </tr>
  `;

  let current = baseNet;

  for(let i=0;i<n;i++){
    const info = prefixForHosts(needs[i]);
    const size = info.size;

    let net = current;
    let first = net+1;
    let last = net+size-2;
    let broad = net+size-1;

    output += `
      <tr>
        <td>${i+1}</td>
        <td>${needs[i]}</td>
        <td>/${info.prefijo}</td>
        <td>${intToIp(net)}</td>
        <td>${intToIp(first)}</td>
        <td>${intToIp(last)}</td>
        <td>${intToIp(broad)}</td>
      </tr>
    `;

    current += size;
  }

  output += "</table>";

  resultado.innerHTML = output;
}

async function guardarHistorial() {
  const res = await fetch("/guardar-historial", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      ipBase: ipBase.value,
      prefijo: prefijoBase.value,
      subredes: numSubredes.value
    })
  });

  const data = await res.json();
  alert(data.msg);
}
