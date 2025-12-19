import React, { useState, useEffect, useRef } from 'react';
import { Dices, Sparkles, Zap, Terminal, Settings, RefreshCw, Play, ShieldAlert, Ghost, Microscope, Download } from 'lucide-react';

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
  rings: string[]; // Names of rings
  smiles_components: string[]; // SMILES of rings
  chiralMode: number;
  bluffed: boolean;
  timestamp: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'casino';
  timestamp: string;
}

// --- Helper Functions ---

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Main Component ---

const Generator: React.FC = () => {
    // Configuration State
    const [numStructures, setNumStructures] = useState<number>(5);
    const [chiralSwitch, setChiralSwitch] = useState<number>(1); // 0: off, 1: single, 2: double
    const [filterStrategy, setFilterStrategy] = useState<number>(2); // 1, 2, 3
    const [casinoSwitch, setCasinoSwitch] = useState<boolean>(true);
    
    // Execution State
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [results, setResults] = useState<GeneratedMolecule[]>([]);
    const [progress, setProgress] = useState<number>(0);

    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
    };

    // --- Logic ---

    const bluffSpin = (pool: typeof RING_POOL): { item: typeof RING_POOL[0], bluffed: boolean } => {
        const first = pool[Math.floor(Math.random() * pool.length)];
        // 30% chance to bluff
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

        addLog(`👑 Welcome to the Royal Gamble Lite`, 'info');
        await sleep(500);
        addLog(`🔮 Casting ${numStructures} structures, Master!`, 'info');
        await sleep(500);
        
        if (casinoSwitch) {
            addLog(`🎰 The chemical rings will be selected using bluff-spin`, 'casino');
        } else {
            addLog(`🤷‍♂️ The chemical rings will be selected randomly`, 'info');
        }
        await sleep(500);
        addLog(`🔆 LET'S START THE SORCERY 🔆`, 'warning');
        await sleep(800);

        let count = 0;
        let attempts = 0;
        const maxAttempts = 1000;
        const newResults: GeneratedMolecule[] = [];

        while (count < numStructures && attempts < maxAttempts) {
            attempts++;
            
            // 1. Select Rings
            const ringSelections = [];
            let isBluffed = false;

            for (let i = 1; i <= 3; i++) {
                if (casinoSwitch) {
                    const spin = bluffSpin(RING_POOL);
                    ringSelections.push(spin.item);
                    if (spin.bluffed) isBluffed = true;
                    // Visual log for the first few attempts only to save spam
                    if (count < 2) {
                        if (spin.bluffed) addLog(`🎲 Ring ${i} selected via BLUFF: ${spin.item.name}`, 'casino');
                        await sleep(100);
                    }
                } else {
                    const ring = RING_POOL[Math.floor(Math.random() * RING_POOL.length)];
                    ringSelections.push(ring);
                }
            }

            const [r1, r2, r3] = ringSelections;

            // 2. Filter
            let keep = true;
            if (filterStrategy === 1) {
                // Discard if all 3 identical
                if (r1.name === r2.name && r2.name === r3.name) keep = false;
            } else if (filterStrategy === 2) {
                // Discard adjacent duplicates
                if (r1.name === r2.name || r2.name === r3.name) keep = false;
            } else if (filterStrategy === 3) {
                // Keep only unique
                const names = new Set([r1.name, r2.name, r3.name]);
                if (names.size !== 3) keep = false;
            }

            if (!keep) {
                addLog(`🃏 DISCARDED: Attempt ${attempts} failed filter strategy ${filterStrategy}`, 'warning');
                await sleep(50);
                continue;
            }

            // 3. Success
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
            setResults([...newResults]); // Update UI incrementally
            setProgress((count / numStructures) * 100);
            
            addLog(`✨ Molecule ${count} created at attempt ${attempts}`, 'success');
            await sleep(200); // Visual delay
        }

        if (count >= numStructures) {
             addLog(`⚗️ Work completed: crafted ${count} molecules in ${attempts} attempts.`, 'success');
        } else {
             addLog(`💥 Stopped after max attempts (${maxAttempts}).`, 'error');
        }

        setIsGenerating(false);
    };

    const downloadSDF = () => {
        if (results.length === 0) return;
        
        // Construct a mock SDF file content
        let sdfContent = '';
        results.forEach(mol => {
            sdfContent += `${mol.id}\n  Invero  ${mol.timestamp}\n\n  0  0  0  0  0  0  0  0  0  0999 V2000\n`;
            // Mock atom block (empty for lite version representation, typically this would contain coordinates)
            sdfContent += `M  END\n`;
            sdfContent += `>  <ID>\n${mol.id}\n\n`;
            sdfContent += `>  <GENERATED_TIMESTAMP>\n${mol.timestamp}\n\n`;
            sdfContent += `>  <RINGS_USED>\n${mol.rings.join('; ')}\n\n`;
            sdfContent += `>  <SMILES_PARTS>\n${mol.smiles_components.join('.')}\n\n`;
            if (mol.bluffed) {
                 sdfContent += `>  <BLUFF_SPIN>\nTRUE\n\n`;
            }
            sdfContent += `$$$$\n`;
        });
    
        const blob = new Blob([sdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CASINO_${new Date().toISOString().slice(0,10)}.sdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Dices className="h-8 w-8 text-secondary" />
                        Royal Gamble Lite
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full border border-secondary/20 font-mono">v1.07 demo</span>
                    </h2>
                    <p className="mt-2 text-slate-400 max-w-2xl">
                        Design drug-like molecules using combinatorics inspired by casino models. 
                        Unfold novel chemical spaces with controlled stochasticity.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: Configuration */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-2xl border border-white/5 bg-surface p-6 shadow-xl">
                        <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <Settings className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-white">Configuration</h3>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Structures Count */}
                            <div>
                                <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-300">
                                    <span>Structures to Generate</span>
                                    <span className="font-mono text-primary">{numStructures}</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="1" max="50" 
                                    value={numStructures}
                                    onChange={(e) => setNumStructures(parseInt(e.target.value))}
                                    disabled={isGenerating}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surfaceHighlight accent-primary" 
                                />
                            </div>

                            {/* Chiral Switch */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">Chiral Linkers</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[0, 1, 2].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setChiralSwitch(opt)}
                                            disabled={isGenerating}
                                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                                                chiralSwitch === opt
                                                ? 'border-primary bg-primary/20 text-white'
                                                : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {opt === 0 ? 'None' : opt === 1 ? 'Single (1)' : 'Double (2)'}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-[10px] text-slate-500">
                                    {chiralSwitch === 0 ? "Ring1 — Ring2 — Ring3" : 
                                     chiralSwitch === 1 ? "Ring1 — Chiral — Ring2 — Ring3" : 
                                     "Ring1 — Chiral — Ring2 — Chiral — Ring3"}
                                </p>
                            </div>

                            {/* Filtering Strategy */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">Filtering Strategy</label>
                                <select
                                    value={filterStrategy}
                                    onChange={(e) => setFilterStrategy(parseInt(e.target.value))}
                                    disabled={isGenerating}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-white focus:border-primary focus:outline-none"
                                >
                                    <option value={1}>Strategy 1: Discard Identical Triples</option>
                                    <option value={2}>Strategy 2: No Adjacent Duplicates</option>
                                    <option value={3}>Strategy 3: All Unique Rings</option>
                                </select>
                            </div>

                            {/* Casino Switch */}
                            <div className="flex items-center justify-between rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                                <div>
                                    <span className="block text-sm font-bold text-white">Casino Mode</span>
                                    <span className="text-xs text-secondary">Bluff-Spin Logic</span>
                                </div>
                                <button 
                                    onClick={() => setCasinoSwitch(!casinoSwitch)}
                                    disabled={isGenerating}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        casinoSwitch ? 'bg-secondary' : 'bg-slate-700'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        casinoSwitch ? 'translate-x-6' : 'translate-x-1'
                                    }`}/>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button 
                                onClick={runRoyalGamble}
                                disabled={isGenerating}
                                className={`group relative flex w-full items-center justify-center overflow-hidden rounded-xl py-4 font-bold text-white transition-all ${
                                    isGenerating ? 'cursor-not-allowed opacity-80' : 'hover:scale-[1.02] shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                                }`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r from-secondary via-purple-600 to-primary transition-all ${isGenerating ? 'animate-pulse' : ''}`}></div>
                                <span className="relative z-10 flex items-center gap-2">
                                    {isGenerating ? (
                                        <><RefreshCw className="h-5 w-5 animate-spin" /> CASTING...</>
                                    ) : (
                                        <><Zap className="h-5 w-5 fill-white" /> SPIN THE WHEEL</>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Ring Pool Info */}
                    <div className="rounded-2xl border border-white/5 bg-surface p-6">
                         <div className="mb-4 flex items-center gap-2">
                            <Microscope className="h-4 w-4 text-slate-400" />
                            <h4 className="text-sm font-medium text-slate-300">Active Ring Pool</h4>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {RING_POOL.slice(0, 8).map((r, i) => (
                                <span key={i} className="rounded border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                                    {r.name}
                                </span>
                            ))}
                            <span className="rounded border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-slate-500">
                                +{RING_POOL.length - 8} more
                            </span>
                         </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Output & Terminal */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-[calc(100vh-12rem)]">
                    
                    {/* Terminal Window */}
                    <div className="flex-none h-48 rounded-xl border border-white/10 bg-[#0c0c0c] p-4 font-mono text-xs overflow-hidden flex flex-col shadow-inner">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2 text-slate-500">
                            <Terminal className="h-3 w-3" />
                            <span>output.log</span>
                        </div>
                        <div ref={logContainerRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                            {logs.length === 0 && <span className="text-slate-600 italic">Ready to cast structures...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className={`flex gap-2 ${
                                    log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                    log.type === 'warning' ? 'text-yellow-400' :
                                    log.type === 'casino' ? 'text-secondary' : 'text-slate-300'
                                }`}>
                                    <span className="text-slate-600">[{log.timestamp}]</span>
                                    <span>{log.message}</span>
                                </div>
                            ))}
                            {isGenerating && <div className="animate-pulse text-primary">_</div>}
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1 overflow-hidden flex flex-col rounded-2xl border border-white/5 bg-surface">
                         <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surfaceHighlight">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                                Generated Molecules
                            </h3>
                            <div className="flex items-center gap-4 text-xs">
                                {!isGenerating && results.length > 0 && (
                                    <button 
                                        onClick={downloadSDF}
                                        className="flex items-center gap-2 rounded bg-primary/20 px-3 py-1.5 font-bold text-primary hover:bg-primary/30 transition-colors"
                                    >
                                        <Download className="h-3 w-3" />
                                        Download SDF
                                    </button>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">Progress:</span>
                                    <div className="w-32 h-2 bg-black rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="font-mono text-white">{results.length}/{numStructures}</span>
                                </div>
                            </div>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {results.map((mol) => (
                                    <div key={mol.id} className="group relative rounded-xl border border-white/5 bg-black/20 p-4 transition-all hover:bg-white/5 hover:border-primary/30">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-mono text-white">
                                                    {mol.id}
                                                </span>
                                                {mol.bluffed && (
                                                    <span className="flex items-center gap-1 rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-bold text-secondary border border-secondary/20">
                                                        <Ghost className="h-3 w-3" /> BLUFF
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-mono">{mol.timestamp}</span>
                                        </div>
                                        
                                        {/* Structure Visualization (Abstract) */}
                                        <div className="flex items-center justify-center gap-1 mb-4 text-[10px] text-slate-300 font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                                            <span className="truncate max-w-[60px]" title={mol.rings[0]}>{mol.rings[0]}</span>
                                            <span className="text-slate-600">
                                                {mol.chiralMode > 0 ? '—💠—' : '——'}
                                            </span>
                                            <span className="truncate max-w-[60px] text-primary" title={mol.rings[1]}>{mol.rings[1]}</span>
                                            <span className="text-slate-600">
                                                 {mol.chiralMode > 1 ? '—💠—' : '——'}
                                            </span>
                                            <span className="truncate max-w-[60px]" title={mol.rings[2]}>{mol.rings[2]}</span>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 rounded bg-white/10 hover:bg-primary hover:text-white text-slate-400 transition-colors">
                                                <Settings className="h-3 w-3" />
                                            </button>
                                            <button className="p-1.5 rounded bg-white/10 hover:bg-primary hover:text-white text-slate-400 transition-colors">
                                                <Play className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {results.length === 0 && !isGenerating && (
                                    <div className="col-span-full py-20 text-center text-slate-600 border border-dashed border-white/5 rounded-xl">
                                        <Dices className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>Ready to generate. Configure parameters and spin the wheel.</p>
                                    </div>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Generator;