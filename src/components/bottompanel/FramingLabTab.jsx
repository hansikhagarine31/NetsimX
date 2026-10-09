import React, { useState } from 'react';
import { characterCountFrame, characterStuffing, bitStuffing } from '../../algorithms/framing.js';
import { Layers, ArrowRight, ArrowDown, CheckCircle2 } from 'lucide-react';

export function FramingLabTab() {
  const [activeSubTab, setActiveSubTab] = useState('bit'); // 'charCount' | 'charStuff' | 'bit'

  // State for Character Stuffing
  const [charData, setCharData] = useState('ABCFLAGXYZ');
  const [flagChar, setFlagChar] = useState('FLAG');
  const [escChar, setEscChar] = useState('ESC');

  // State for Bit Stuffing
  const [bitInput, setBitInput] = useState('01111110111110');

  // State for Character Count
  const [countInput, setCountInput] = useState('COMPUTERNETWORKS');

  const charStuffResult = characterStuffing(charData, flagChar, escChar);
  const bitStuffResult = bitStuffing(bitInput);
  const charCountResult = characterCountFrame(countInput, 5);

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col gap-4 overflow-y-auto font-sans text-xs">
      {/* Sub-Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 text-sm">Data Link Layer Framing Protocols</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('bit')}
            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
              activeSubTab === 'bit'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bit Stuffing (5 Ones Rule)
          </button>
          <button
            onClick={() => setActiveSubTab('charStuff')}
            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
              activeSubTab === 'charStuff'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Character Stuffing (FLAG / ESC)
          </button>
          <button
            onClick={() => setActiveSubTab('charCount')}
            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
              activeSubTab === 'charCount'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Character Count Framing
          </button>
        </div>
      </div>

      {/* BIT STUFFING LAB */}
      {activeSubTab === 'bit' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Input Binary Bit Stream
            </label>
            <input
              type="text"
              value={bitInput}
              onChange={e => setBitInput(e.target.value.replace(/[^01]/g, ''))}
              placeholder="e.g. 01111110111110"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Original Bits</span>
              <div className="font-mono text-sm text-slate-100 bg-slate-950 p-3 rounded-lg border border-slate-800 tracking-wider">
                {bitStuffResult.originalBits}
              </div>
            </div>

            <div className="flex justify-center text-cyan-400">
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                  Stuffed Frame Bits (Zero inserted after 5 consecutive 1s)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  Inserted zeros count: {bitStuffResult.insertedIndices.length}
                </span>
              </div>
              <div className="font-mono text-sm bg-slate-950 p-3 rounded-lg border border-slate-800 tracking-wider flex flex-wrap gap-0.5">
                {bitStuffResult.stuffedBits.split('').map((bit, idx) => {
                  const isInserted = bitStuffResult.insertedIndices.includes(idx);
                  return (
                    <span
                      key={idx}
                      className={isInserted ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/60 font-bold px-1 rounded' : 'text-slate-200'}
                    >
                      {bit}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center text-purple-400">
              <ArrowDown className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-purple-400 font-semibold uppercase">Receiver Destuffing Recovery</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Perfectly Restored
                </span>
              </div>
              <div className="font-mono text-sm text-purple-300 bg-slate-950 p-3 rounded-lg border border-slate-800 tracking-wider">
                {bitStuffResult.destuffedBits}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARACTER STUFFING LAB */}
      {activeSubTab === 'charStuff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Original Text Data
              </label>
              <input
                type="text"
                value={charData}
                onChange={e => setCharData(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Flag Delimiter String
              </label>
              <input
                type="text"
                value={flagChar}
                onChange={e => setFlagChar(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Escape (ESC) Byte String
              </label>
              <input
                type="text"
                value={escChar}
                onChange={e => setEscChar(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-purple-300"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Transmitted Stuffed Frame</span>
              <div className="text-sm bg-slate-950 p-3 rounded-lg border border-slate-800 text-cyan-300 font-bold tracking-wide">
                {charStuffResult.stuffedFrame}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Receiver Destuffed Output</span>
              <div className="text-sm bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400 font-bold">
                {charStuffResult.recoveredData}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARACTER COUNT LAB */}
      {activeSubTab === 'charCount' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Stream Data Input
            </label>
            <input
              type="text"
              value={countInput}
              onChange={e => setCountInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Framed Format Output</span>
            <div className="font-mono text-sm bg-slate-950 p-3 rounded-lg border border-slate-800 text-cyan-300 font-bold tracking-wider">
              {charCountResult.formattedOutput}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
