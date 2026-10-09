import React, { useState } from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { X, HardDrive, UploadCloud, DownloadCloud, FileText, CheckCircle2, Lock } from 'lucide-react';

export function FTPModal() {
  const store = useNetworkStore();
  if (!store.modals.ftp) return null;

  const onClose = () => {
    networkStore.setState({ modals: { ...store.modals, ftp: false } });
  };

  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [files, setFiles] = useState([
    { name: 'syllabus.pdf', size: '2.4 MB' },
    { name: 'cn_lab_report.docx', size: '512 KB' },
    { name: 'dijkstra_spec.txt', size: '42 KB' }
  ]);
  const [newFileName, setNewFileName] = useState('');
  const [transferProgress, setTransferProgress] = useState(null);

  const handleConnect = () => {
    setConnected(true);
    networkStore.addLog('FTP Client connected to FTP Server (Port 21). 220 Service Ready.');
  };

  const handleUpload = () => {
    if (!newFileName.trim()) return;
    setTransferProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setTransferProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setFiles(prev => [...prev, { name: newFileName.trim(), size: '1.2 MB' }]);
        setNewFileName('');
        setTransferProgress(null);
        networkStore.addLog(`FTP File Upload Complete: 226 Transfer Complete. ${newFileName} stored.`);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <HardDrive className="w-5 h-5" />
            Educational FTP Protocol Simulator
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!connected ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
              Connect to Server FTP Service (192.168.3.100:21)
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">FTP Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">FTP Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>

            <button
              onClick={handleConnect}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Connect to FTP Server
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono bg-emerald-950/60 border border-emerald-800/80 p-2.5 rounded-xl text-emerald-400">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" /> 230 User logged in, proceed.
              </span>
              <button
                onClick={() => setConnected(false)}
                className="text-slate-400 hover:text-rose-400 text-[10px]"
              >
                Disconnect
              </button>
            </div>

            {/* Server File Directory */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">FTP Remote File Directory</span>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-3 space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-200">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      {file.name}
                    </div>
                    <span className="text-slate-500 text-[10px]">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload File Input */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">Upload File to Server</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="enter_filename.pdf"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                />
                <button
                  onClick={handleUpload}
                  disabled={!newFileName.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-40"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Transfer Progress */}
            {transferProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                  <span>Transferring data packet stream...</span>
                  <span>{transferProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all duration-200" style={{ width: `${transferProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
