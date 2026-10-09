import React, { useState } from 'react';
import { calculateCRC, verifyCRC, injectBitError, CRC_POLYNOMIALS, stringToBinary } from '../../algorithms/crc.js';
import { Cpu, ShieldCheck, ShieldAlert, Zap, RefreshCw } from 'lucide-react';

export function CRCLabTab() {
  const [inputDataType, setInputDataType] = useState('binary'); // 'binary' | 'text'
  const [dataInput, setDataInput] = useState('1101011011');
  const [selectedPolyKey, setSelectedPolyKey] = useState('CRC-16');
  const [customPoly, setCustomPoly] = useState('');
  const [corruptedFrame, setCorruptedFrame] = useState(null);
  const [errorBitIdx, setErrorBitIdx] = useState(3);

  const activePoly = selectedPolyKey === 'CUSTOM' ? customPoly : CRC_POLYNOMIALS[selectedPolyKey];
  const binaryBits = inputDataType === 'text' ? stringToBinary(dataInput) : dataInput;

  const crcResult = calculateCRC(binaryBits, activePoly);
  const frameToVerify = corruptedFrame !== null ? corruptedFrame : crcResult.transmittedFrame;
  const verificationResult = verifyCRC(frameToVerify, activePoly);

  const handleInjectError = () => {
    const injected = injectBitError(crcResult.transmittedFrame, Number(errorBitIdx));
    setCorruptedFrame(injected);
  };

  const handleResetError = () => {
    setCorruptedFrame(null);
  };

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col gap-4 overflow-y-auto font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Cyclic Redundancy Check (CRC) Protocol Laboratory
        </div>
        <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1 rounded-lg">
          Polynomial: {activePoly}
        </div>
      </div>

      {/* Inputs Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Polynomial Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Standard Polynomial
          </label>
          <select
            value={selectedPolyKey}
            onChange={e => {
              setSelectedPolyKey(e.target.value);
              setCorruptedFrame(null);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="CRC-12">CRC-12 (x¹² + x¹¹ + x³ + x² + x + 1)</option>
            <option value="CRC-16">CRC-16 (x¹⁶ + x¹⁵ + x² + 1)</option>
            <option value="CRC-CCITT">CRC-CCITT (x¹⁶ + x¹² + x⁵ + 1)</option>
            <option value="CUSTOM">Custom Generator Polynomial</option>
          </select>
        </div>

        {/* Custom Poly Input */}
        {selectedPolyKey === 'CUSTOM' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Custom Binary Polynomial
            </label>
            <input
              type="text"
              value={customPoly}
              onChange={e => setCustomPoly(e.target.value.replace(/[^01]/g, ''))}
              placeholder="e.g. 10011"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Data Bits Input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Data Bits Input
          </label>
          <input
            type="text"
            value={dataInput}
            onChange={e => {
              setDataInput(e.target.value);
              setCorruptedFrame(null);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* CRC Calculation Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="block text-[10px] text-slate-500 font-semibold">ORIGINAL DATA</span>
          <span className="font-mono text-slate-100 font-bold break-all">{crcResult.originalData}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="block text-[10px] text-slate-500 font-semibold">CRC REMAINDER</span>
          <span className="font-mono text-cyan-400 font-bold">{crcResult.remainder}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="block text-[10px] text-slate-500 font-semibold">TRANSMITTED FRAME</span>
          <span className="font-mono text-purple-300 font-bold break-all">{crcResult.transmittedFrame}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="block text-[10px] text-slate-500 font-semibold">RECEIVER VERIFICATION</span>
          {verificationResult.isValid ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> PASS (Valid Frame)
            </span>
          ) : (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> ❌ ERROR DETECTED
            </span>
          )}
        </div>
      </div>

      {/* Error Injection Toolbar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">Noise Error Injection:</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Bit Index:</span>
            <input
              type="number"
              min="0"
              max={crcResult.transmittedFrame.length - 1}
              value={errorBitIdx}
              onChange={e => setErrorBitIdx(e.target.value)}
              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-cyan-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {corruptedFrame && (
            <button
              onClick={handleResetError}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <button
            onClick={handleInjectError}
            className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow-lg shadow-rose-500/20"
          >
            [ Inject Bit Error ]
          </button>
        </div>
      </div>

      {/* Binary Division Steps */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <span className="font-semibold text-slate-300 block">Step-by-Step Modulo-2 Binary Division</span>
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <div className="max-h-48 overflow-y-auto p-3 font-mono text-xs text-slate-300 space-y-1">
            {crcResult.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 border-b border-slate-900 pb-1">
                <span className="text-cyan-400 w-16">Step {step.stepIndex}</span>
                <span className="w-28 text-slate-200 font-bold">{step.currentWindow}</span>
                <span className="text-slate-500">XOR ({step.divisor})</span>
                <span className="text-emerald-400 font-semibold">= {step.xorResult}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
