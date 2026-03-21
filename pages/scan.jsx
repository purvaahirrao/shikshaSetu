// pages/scan.jsx
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Upload, Camera, X, ArrowRight, Bug } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ocrImage } from '../services/api';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Toast from '../components/ui/Toast';

export default function ScanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState(null);

  // Debug State
  const [logs, setLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(true); // Default to true while we fix this

  const addLog = (msg, data = null) => {
    const logStr = `${new Date().toLocaleTimeString()} - ${msg} ${data ? JSON.stringify(data) : ''}`;
    console.log(`[SCAN] ${msg}`, data || '');
    setLogs(prev => [...prev, logStr]);
  };

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading]);

  const handleFile = (f) => {
    addLog('File selected manually', f?.name);
    if (!f || !f.type.startsWith('image/')) {
      addLog('Error: Invalid file type');
      setToast({ message: 'Please select an image file.', type: 'error' });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    addLog('Image preview generated successfully');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addLog('File dropped via drag-and-drop');
    handleFile(e.dataTransfer.files[0]);
  };

  const clearImage = () => {
    addLog('Image cleared');
    setFile(null);
    setPreview(null);
  };

  const handleScan = async () => {
    if (!file) {
      setToast({ message: 'Please select an image first.', type: 'error' });
      return;
    }

    setScanning(true);
    addLog('--- STARTING OCR SCAN ---');
    addLog(`Sending file: ${file.name} (${Math.round(file.size / 1024)} KB)`);

    try {
      const data = await ocrImage(file);
      addLog('✅ Backend response received:', data);

      const extracted = data.extracted_text || data.text || '';
      addLog(`Extracted Text Length: ${extracted.length} chars`);

      if (!extracted.trim()) {
        addLog('⚠️ Warning: Extracted text is empty!');
        setToast({ message: 'No text found in image. Try a clearer photo.', type: 'error' });
        setScanning(false);
        return; // Don't redirect if empty
      }

      addLog('Redirecting to /result...');
      router.push({ pathname: '/result', query: { text: extracted, autoSolve: 'true' } });
    } catch (e) {
      addLog('❌ API Catch Error:', e.message);
      setToast({ message: '⚠️ OCR failed. Check debug logs.', type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  return (
    <AppShell title="Scan Question" back onBack={() => router.push('/home')}>
      <div className="px-5 pt-6 space-y-5 pb-20">

        {/* Drop zone / preview */}
        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            className="relative border-2 border-dashed border-slate-200 rounded-3xl bg-white flex flex-col items-center justify-center gap-4 py-16 cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition-all duration-200"
          >
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Upload size={28} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="font-display font-800 text-slate-700 text-base">Upload or take a photo</p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden shadow-card">
            <img src={preview} alt="Scanned question" className="w-full object-contain max-h-72 bg-slate-100" />
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 h-9 w-9 bg-slate-900/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />

        {/* CTA */}
        <Button
          variant="primary"
          className="w-full text-base py-4"
          loading={scanning}
          onClick={handleScan}
          disabled={!file}
        >
          {!scanning && <ArrowRight size={18} />}
          {scanning ? 'Extracting text…' : 'Scan & Get Answer'}
        </Button>

        {/* --- LIVE DEBUG CONSOLE --- */}
        <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="w-full flex items-center justify-between p-3 bg-slate-200 text-slate-700 font-bold text-sm"
          >
            <span className="flex items-center gap-2"><Bug size={16} /> Live Debug Logs</span>
            <span>{showDebug ? '▼' : '▲'}</span>
          </button>

          {showDebug && (
            <div className="p-3 max-h-48 overflow-y-auto text-xs font-mono text-slate-800 space-y-1">
              {logs.length === 0 ? <p className="text-slate-400 italic">Waiting for actions...</p> : null}
              {logs.map((l, i) => (
                <div key={i} className="border-b border-slate-200 pb-1">{l}</div>
              ))}
            </div>
          )}
        </div>

      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}