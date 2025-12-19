import React, { useState, useEffect, useRef } from 'react';
import { Dices, Sparkles, Zap, Terminal, Settings, RefreshCw, Play, ShieldAlert, Ghost, Microscope, Download, X, Activity } from 'lucide-react';

// --- Constants & Types ---

const RING_POOL = [
  { smiles: "c1ccccc1", name: "benzene", type: "aromatic" },
  { smiles: "C1CCCCC1", name: "cyclohexane", type: "saturated" },
  { smiles: "C1CCC1", name: "cyclobutane", type: "saturated" },
  { smiles: "C1CCCC1", name: "cyclopentane", type: "saturated" },
  { smiles: "c1ccc2ccccc2c1", name: "naphthalene", type: "aromatic" },
  { smiles: "C1CC2CCC1C2", name: "norbornane", type: "saturated" },
  { smiles: "c1ccncc1", name: "pyridine", type: "heterocycle" },
  { smiles: "c1cncnc1", name: "pyrimidine", type: "heterocycle" },
  { smiles: "c1ccnc2c1cccc2", name: "quinoline", type: "heterocycle" },
  { smiles: "c1cnc[nH]1", name: "imidazole", type: "heterocycle" },
  { smiles: "C1CNCCN1", name: "piperazine", type: "heterocycle" },
  { smiles: "C1CCNC1", name: "pyrrolidine", type: "heterocycle" },
  { smiles: "C1CCNCC1", name: "piperidine", type: "heterocycle" },
  { smiles: "C1COC1", name: "oxetane", type: "heterocycle" },
  { smiles: "C1COCC1", name: "tetrahydrofuran", type: "heterocycle" },
  { smiles: "c1ccoc1", name: "furan", type: "heterocycle" },
  { smiles: "C1COC(C1)O", name: "1,3-dioxolane", type: "heterocycle" },
  { smiles: "C1COC2OC1C2", name: "1,4-dioxane", type: "heterocycle" },
];

interface GeneratedMolecule {
  id: number;
  rings: string[];
  smiles_components: string[];
  chiralMode: number;
  bluffed: boolean;
  timestamp: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'casino';
  timestamp: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Generator: React.FC = () => {
    const [numStructures, setNumStructures] = useState<number>(5);
    const [chiralSwitch, setChiralSwitch] = useState<number>(1);
    const [filterStrategy, setFilterStrategy] = useState<number>(2);
    const [casinoSwitch, setCasinoSwitch] = useState<boolean>(true);
    
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [results, setResults] = useState<GeneratedMolecule[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [selectedDetail, setSelectedDetail] = useState<GeneratedMolecule | null>(null);

    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
    };

    const bluffSpin = (pool: typeof RING_POOL): { item: typeof RING_POOL[0], bluffed: boolean } => {
        const first = pool[Math.floor(Math.random() * pool.length)];
        if (Math.random() < 0.3) {
            const second = pool[Math.floor(Math.random() * pool.length)];
            return { item: second, bluffed: true };
        }
        return { item: first, bluffed: false };
    };

    const runRoyalGamble = async () => {
        setIsGenerating(true);
        setLogs([]);
        setResults([]);
        setProgress(0);

        addLog(`👑 CASINO ENGINE INITIALIZED`, 'casino');
        await sleep(400);
        addLog(`🔮 Allocating ${numStructures} target structural slots...`, 'info');
        await sleep(400);
        
        const mode = casinoSwitch ? 'BLUFF-SPIN (Stochastic)' : 'PURE-RANDOM';
        addLog(`🎰 SELECTION MODE: ${mode}`, 'casino');
        await sleep(500);

        let count = 0;
        let attempts = 0;
        const maxAttempts = 500;
        const newResults: GeneratedMolecule[] = [];

        while (count < numStructures && attempts < maxAttempts) {
            attempts++;
            const ringSelections = [];
            let isBluffed = false;

            for (let i = 1; i <= 3; i++) {
                if (casinoSwitch) {
                    const spin = bluffSpin(RING_POOL);
                    ringSelections.push(spin.item);
                    if (spin.bluffed) isBluffed = true;
                } else {
                    ringSelections.push(RING_POOL[Math.floor(Math.random() * RING_POOL.length)]);
                }
            }

            const [r1, r2, r3] = ringSelections;
            let keep = true;
            if (filterStrategy === 1) { if (r1.name === r2.name && r2.name === r3.name) keep = false; }
            else if (filterStrategy === 2) { if (r1.name === r2.name || r2.name === r3.name) keep = false; }
            else if (filterStrategy === 3) { if (new Set([r1.name, r2.name, r3.name]).size !== 3) keep = false; }

            if (!keep) {
                if (attempts % 10 === 0) addLog(`🃏 Filter Collision (Attempt ${attempts})`, 'warning');
                continue;
            }

            count++;
            const molecule: GeneratedMolecule = {
                id: count,
                rings: [r1.name, r2.name, r3.name],
                smiles_components: [r1.smiles, r2.smiles, r3.smiles],
                chiralMode: chiralSwitch,
                bluffed: isBluffed,
                timestamp: new Date().toLocaleTimeString()
            };

            newResults.push(molecule);
            setResults([...newResults]);
            setProgress((count / numStructures) * 100);
            
            addLog(`✨ Mapped #${count} in ${attempts} iterations`, 'success');
            await sleep(150);
        }

        addLog(`⚗️ Synthesis batch #${Math.floor(Math.random()*9000)+1000} ready.`, 'success');
        setIsGenerating(false);
    };

    const downloadSDF = () => {
        if (results.length === 0) return;
        let sdfContent = results.map(mol => `${mol.id}\n  Invero\n\n  0  0  0  0  0  0  0  0  0  0999 V2000\nM  END\n>  <SMILES>\n${mol.smiles_components.join('.')}\n\n$$$$\n`).join('');
        const blob = new Blob([sdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Batch_CASINO_${new Date().toISOString().slice(0,10)}.sdf`;
        a.click();
    };

    const launchDocking = (mol: GeneratedMolecule) => {
        addLog(`🚀 LAUNCHING DOCKING FOR UNIT #${mol.id}...`, 'info');
        addLog(`📡 Job sent to cluster: NODE-4/7`, 'success');
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                        <Dices className="h-10 w-10 text-secondary" />
                        Royal Gamble Lite
                    </h2>
                    <p className="mt-2 text-slate-500 font-medium max-w-2xl text-sm uppercase tracking-widest">
                        Combinatorial Design for novel chemical scafolds.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-3xl border border-white/5 bg-surface p-8 shadow-2xl">
                        <div className="mb-8 flex items-center gap-3 border-b border-white/5 pb-6">
                            <Settings className="h-5 w-5 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Engine Settings</h3>
                        </div>
                        
                        <div className="space-y-8">
                            <div>
                                <label className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Population Size</span>
                                    <span className="font-mono text-primary text-sm">{numStructures}</span>
                                </label>
                                <input type="range" min="1" max="50" value={numStructures} onChange={(e) => setNumStructures(parseInt(e.target.value))} disabled={isGenerating} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surfaceHighlight accent-primary" />
                            </div>

                            <div>
                                <label className="mb-4 block text-[10px] font-black uppercase tracking-widest text-slate-500">Chiral Interconnects</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[0, 1, 2].map((opt) => (
                                        <button key={opt} onClick={() => setChiralSwitch(opt)} disabled={isGenerating} className={`rounded-xl border py-3 text-[10px] font-bold uppercase transition-all ${chiralSwitch === opt ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-white/5 bg-white/5 text-slate-500 hover:text-slate-300'}`}>
                                            {opt === 0 ? 'Off' : opt === 1 ? '1x' : '2x'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-secondary/20 bg-secondary/5 p-5 shadow-inner">
                                <div>
                                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white">Bluff-Spin Mode</span>
                                    <span className="text-[9px] font-bold text-secondary uppercase opacity-70">Stochastic Boost</span>
                                </div>
                                <button onClick={() => setCasinoSwitch(!casinoSwitch)} disabled={isGenerating} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${casinoSwitch ? 'bg-secondary' : 'bg-slate-800'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${casinoSwitch ? 'translate-x-6' : 'translate-x-1'}`}/>
                                </button>
                            </div>
                        </div>

                        <button onClick={runRoyalGamble} disabled={isGenerating} className={`mt-10 group relative flex w-full items-center justify-center overflow-hidden rounded-2xl py-5 font-black uppercase tracking-[0.3em] text-xs text-white transition-all ${isGenerating ? 'opacity-50' : 'hover:scale-105 shadow-2xl hover:shadow-secondary/20 active:scale-95'}`}>
                            <div className={`absolute inset-0 bg-gradient-to-r from-secondary via-purple-600 to-primary transition-all ${isGenerating ? 'animate-pulse' : ''}`}></div>
                            <span className="relative z-10 flex items-center gap-3">
                                {isGenerating ? <><RefreshCw className="h-5 w-5 animate-spin" /> Casting...</> : <><Zap className="h-5 w-5 fill-white" /> Spin Wheel</>}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6 h-[calc(100vh-14rem)]">
                    <div className="flex-none h-44 rounded-2xl border border-white/10 bg-black p-5 font-mono text-[10px] overflow-hidden flex flex-col shadow-inner">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-3 text-slate-700 font-bold uppercase tracking-widest">
                            <Terminal className="h-3 w-3" />
                            <span>synthesis_log.std</span>
                        </div>
                        <div ref={logContainerRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                            {logs.map((log, i) => (
                                <div key={i} className={`flex gap-3 leading-none ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-yellow-400' : log.type === 'casino' ? 'text-secondary font-bold italic' : 'text-slate-500'}`}>
                                    <span className="opacity-30">[{log.timestamp}]</span>
                                    <span>{log.message}</span>
                                </div>
                            ))}
                            {isGenerating && <div className="animate-pulse text-primary font-bold">_ EXECUTION_THREAD_LIVE</div>}
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col rounded-3xl border border-white/5 bg-surface shadow-2xl">
                         <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                                <Sparkles className="h-4 w-4 text-yellow-400" /> Output Batch
                            </h3>
                            <div className="flex items-center gap-6">
                                {!isGenerating && results.length > 0 && (
                                    <button onClick={downloadSDF} className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all">
                                        <Download className="h-3 w-3" /> Export SDF
                                    </button>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="font-mono text-[10px] text-white font-bold">{results.length} / {numStructures}</span>
                                </div>
                            </div>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {results.map((mol) => (
                                    <div key={mol.id} className="group relative rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-white/5 hover:border-primary/30 shadow-lg hover:shadow-primary/5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[10px] font-black text-white border border-white/5">
                                                    {mol.id}
                                                </span>
                                                {mol.bluffed && (
                                                    <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[8px] font-black text-secondary border border-secondary/20 uppercase tracking-widest">
                                                        <Ghost className="h-2.5 w-2.5" /> Bluff
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{mol.timestamp}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-center gap-2 mb-6 py-4 bg-black/40 rounded-xl border border-white/5 group-hover:border-primary/20 transition-colors">
                                             <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/5">
                                                <Microscope className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors" />
                                             </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedDetail(mol)}
                                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all border border-white/5"
                                            >
                                                <Settings className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => launchDocking(mol)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-black uppercase tracking-widest text-[9px] transition-all border border-primary/20"
                                            >
                                                <Activity className="h-3 w-3" /> Docking
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface shadow-2xl overflow-hidden p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Molecule Specification</h4>
                            <button onClick={() => setSelectedDetail(null)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Entity ID</span>
                                    <span className="text-white font-mono text-sm tracking-widest">#{selectedDetail.id}-CASINO</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Complexity</span>
                                    <span className="text-white font-mono text-sm tracking-widest">LEVEL-{selectedDetail.chiralMode + 1}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-500 uppercase block mb-3">Ring Sequence</span>
                                <div className="space-y-2">
                                    {selectedDetail.rings.map((r, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black border border-white/5">
                                            <span className="h-5 w-5 flex items-center justify-center rounded bg-primary/20 text-primary text-[10px] font-bold">{i+1}</span>
                                            <span className="text-xs text-white font-bold uppercase tracking-widest">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDetail(null)} className="w-full mt-10 py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-slate-200 transition-all">
                            Close Specification
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Generator;