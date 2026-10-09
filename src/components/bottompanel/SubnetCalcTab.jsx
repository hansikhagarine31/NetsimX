import React, { useState, useMemo } from 'react';
import { Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';

// ─── Pure calculation logic ────────────────────────────────────────────────

function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0;
}

function intToIp(n) {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8)  & 0xff,
     n         & 0xff,
  ].join('.');
}

function ipToBinary(ip) {
  return ip.split('.').map(o => Number(o).toString(2).padStart(8, '0')).join('.');
}

function isValidIp(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = Number(p);
    return /^\d+$/.test(p) && n >= 0 && n <= 255;
  });
}

function calcSubnet(ip, cidr) {
  const prefix = Number(cidr);
  if (!isValidIp(ip) || isNaN(prefix) || prefix < 0 || prefix > 32) return null;

  const ipInt = ipToInt(ip);
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const firstHostInt = prefix < 31 ? networkInt + 1 : networkInt;
  const lastHostInt  = prefix < 31 ? broadcastInt - 1 : broadcastInt;
  const hostCount    = prefix >= 31 ? (32 - prefix === 1 ? 2 : 1) : Math.pow(2, 32 - prefix) - 2;
  const wildcardInt  = (~maskInt) >>> 0;

  // IP class detection
  const firstOctet = (ipInt >>> 24) & 0xff;
  let ipClass = 'E';
  if (firstOctet < 128) ipClass = 'A';
  else if (firstOctet < 192) ipClass = 'B';
  else if (firstOctet < 224) ipClass = 'C';
  else if (firstOctet < 240) ipClass = 'D (Multicast)';

  // Private range check
  const isPrivate =
    (firstOctet === 10) ||
    (firstOctet === 172 && ((ipInt >>> 16) & 0xff) >= 16 && ((ipInt >>> 16) & 0xff) <= 31) ||
    (firstOctet === 192 && ((ipInt >>> 16) & 0xff) === 168);

  return {
    ip, cidr: prefix,
    mask:       intToIp(maskInt),
    wildcard:   intToIp(wildcardInt),
    network:    intToIp(networkInt),
    broadcast:  intToIp(broadcastInt),
    firstHost:  intToIp(firstHostInt),
    lastHost:   intToIp(lastHostInt),
    hostCount,
    ipClass,
    isPrivate,
    // binary forms
    ipBin:      ipToBinary(ip),
    maskBin:    ipToBinary(intToIp(maskInt)),
    networkBin: ipToBinary(intToIp(networkInt)),
  };
}

// ─── Binary visual with coloured network / host portions ──────────────────

function BinaryBar({ binary, cidr, label, color }) {
  const bits = binary.replace(/\./g, '');
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] text-slate-500 font-semibold uppercase">{label}</span>
      <div className="flex flex-wrap gap-0.5 font-mono text-[11px]">
        {bits.split('').map((b, i) => {
          const isNet = i < cidr;
          return (
            <span
              key={i}
              className={`w-4 h-5 flex items-center justify-center rounded font-bold
                ${isNet
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-600/40'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-600/40'}
                ${(i + 1) % 8 === 0 && i !== 31 ? 'mr-2' : ''}`}
            >
              {b}
            </span>
          );
        })}
        <span className="ml-2 text-slate-500 text-[10px] self-end">
          <span className="text-cyan-400">■</span> network &nbsp;
          <span className="text-purple-400">■</span> host
        </span>
      </div>
    </div>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────

function Row({ label, value, mono = true, accent }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
      <span className="text-[11px] text-slate-400 font-semibold">{label}</span>
      <span className={`text-xs font-bold ${mono ? 'font-mono' : ''} ${accent || 'text-slate-100'}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function SubnetCalcTab() {
  const [ip, setIp]     = useState('192.168.1.100');
  const [cidr, setCidr] = useState('24');

  const result = useMemo(() => calcSubnet(ip.trim(), cidr), [ip, cidr]);

  const ipValid = isValidIp(ip.trim());
  const cidrNum = Number(cidr);
  const cidrValid = !isNaN(cidrNum) && cidrNum >= 0 && cidrNum <= 32;

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col gap-4 overflow-y-auto font-sans text-xs">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Calculator className="w-4 h-4 text-cyan-400" />
          IPv4 Subnet Calculator
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1 rounded-lg">
          Network Layer — Layer 3
        </span>
      </div>

      {/* Input Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            IPv4 Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={ip}
              onChange={e => setIp(e.target.value)}
              placeholder="192.168.1.100"
              className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors
                ${ipValid ? 'border-slate-700 text-slate-100' : 'border-rose-600 text-rose-300'}`}
            />
            {!ipValid && ip.length > 0 && (
              <AlertTriangle className="absolute right-2 top-2 w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            CIDR Prefix
          </label>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-bold text-sm">/</span>
            <input
              type="number"
              min="0"
              max="32"
              value={cidr}
              onChange={e => setCidr(e.target.value)}
              className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500
                ${cidrValid ? 'border-slate-700 text-cyan-300' : 'border-rose-600 text-rose-300'}`}
            />
          </div>
        </div>
      </div>

      {/* CIDR Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-500 w-4 text-right">0</span>
        <input
          type="range" min="0" max="32"
          value={cidrNum || 0}
          onChange={e => setCidr(e.target.value)}
          className="flex-1 accent-cyan-400 h-1.5 rounded cursor-pointer"
        />
        <span className="text-[10px] text-slate-500 w-4">32</span>
        <span className="text-[11px] font-mono font-bold text-cyan-400 w-8">/{cidrNum}</span>
      </div>

      {/* Results */}
      {result ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Network Address', value: result.network, color: 'text-cyan-400' },
              { label: 'Subnet Mask',     value: result.mask,    color: 'text-slate-100' },
              { label: 'Broadcast',       value: result.broadcast, color: 'text-amber-400' },
              { label: 'Usable Hosts',    value: result.hostCount.toLocaleString(), color: 'text-emerald-400' },
            ].map(card => (
              <div key={card.label} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase mb-1">{card.label}</span>
                <span className={`font-mono font-bold ${card.color}`}>{card.value}</span>
              </div>
            ))}
          </div>

          {/* Detailed table */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <Row label="IP Address"          value={`${result.ip} / ${result.cidr}`} />
            <Row label="Subnet Mask"         value={result.mask} />
            <Row label="Wildcard Mask"       value={result.wildcard} accent="text-amber-300" />
            <Row label="Network Address"     value={result.network} accent="text-cyan-400" />
            <Row label="Broadcast Address"   value={result.broadcast} accent="text-amber-400" />
            <Row label="First Usable Host"   value={result.firstHost} accent="text-emerald-400" />
            <Row label="Last Usable Host"    value={result.lastHost} accent="text-emerald-400" />
            <Row label="Usable Host Count"   value={result.hostCount.toLocaleString()} accent="text-emerald-300" mono={false} />
            <Row label="IP Class"            value={result.ipClass} mono={false} />
            <Row
              label="Address Type"
              value={result.isPrivate ? '🔒 Private (RFC 1918)' : '🌐 Public'}
              mono={false}
              accent={result.isPrivate ? 'text-sky-400' : 'text-orange-400'}
            />
          </div>

          {/* Binary visualizer */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-slate-300 block">
              Binary Representation
            </span>
            <BinaryBar binary={result.ipBin}      cidr={result.cidr} label="IP Address" />
            <BinaryBar binary={result.maskBin}    cidr={result.cidr} label="Subnet Mask" />
            <BinaryBar binary={result.networkBin} cidr={result.cidr} label="Network Address" />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-rose-400 text-xs font-semibold gap-2">
          <AlertTriangle className="w-4 h-4" /> Invalid IP address or CIDR prefix
        </div>
      )}
    </div>
  );
}
