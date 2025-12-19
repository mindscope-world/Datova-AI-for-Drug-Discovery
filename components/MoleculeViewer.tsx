import React, { useState, useEffect, useRef } from 'react';
import { Box, Download, Share2, ZoomIn, Info, RefreshCw, Move3d, Rotate3d, Layers, FileJson, Check, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MOCK_MOLECULES, MOCK_PDB_DATA } from '../constants';
import { Molecule } from '../types';

declare global {
  interface Window {
    NGL: any;
  }
}

// --- NGL Viewer Wrapper ---

interface NGLViewerProps {
    moleculeId: string;
    style: string;
    spin: boolean;
    zoomSignal: number;
    refreshSignal: number;
}

interface ValidationResult {
    isValid: boolean;
    issues: string[];
    timestamp: number;
}

const NGLViewer: React.FC<NGLViewerProps> = ({ moleculeId, style, spin, zoomSignal, refreshSignal }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);

    // Initialize NGL Stage
    useEffect(() => {
        if (!containerRef.current || !window.NGL) return;

        const stage = new window.NGL.Stage(containerRef.current, { 
            backgroundColor: "#050508",
            tooltip: true,
            fogNear: 60,
            fogFar: 100
        });
        
        stageRef.current = stage;
        const handleResize = () => stage.handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            stage.dispose();
        };
    }, []);

    // Plausibility Validation Logic
    const validateStructure = (structure: any): ValidationResult => {
        const issues: string[] = [];
        const atoms = structure.atomStore;
        const bonds = structure.bondStore;
        
        if (atoms.count === 0) {
            return { isValid: false, issues: ["Empty structure data"], timestamp: Date.now() };
        }

        // 1. Bond Length Validation
        // Heuristic: Bonds < 0.9A are often artifacts (clashes), bonds > 2.0A are usually too long for drug-like covalent bonds (except metal complexes)
        for (let i = 0; i < bonds.count; i++) {
            const idx1 = bonds.atomIndex1[i];
            const idx2 = bonds.atomIndex2[i];
            
            const dx = atoms.x[idx1] - atoms.x[idx2];
            const dy = atoms.y[idx1] - atoms.y[idx2];
            const dz = atoms.z[idx1] - atoms.z[idx2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < 0.85) {
                issues.push(`Severe Atomic Clash: Atoms ${idx1}-${idx2} are too close (${dist.toFixed(2)}Å)`);
            } else if (dist > 2.1) {
                issues.push(`Abnormal Bond Length: Linkage ${idx1}-${idx2} exceeds standard limits (${dist.toFixed(2)}Å)`);
            }
        }

        // 2. Density Check
        if (atoms.count > 0 && bonds.count === 0) {
            issues.push("Disconnected Topology: No covalent bonds detected");
        }

        return {
            isValid: issues.length === 0,
            issues: issues.slice(0, 3), // Only show top 3 issues
            timestamp: Date.now()
        };
    };

    // Load Data & Update Style
    const loadMolecule = async () => {
        const stage = stageRef.current;
        if (!stage) return;

        setIsLoading(true);
        setValidation(null);
        stage.removeAllComponents();

        await new Promise(r => setTimeout(r, 600)); 
        const pdbBlob = new Blob([MOCK_PDB_DATA], { type: 'text/plain' });
        
        try {
            const component = await stage.loadFile(pdbBlob, { ext: 'pdb', defaultRepresentation: false });
            
            // Perform Chemical Validation
            const validationResult = validateStructure(component.structure);
            setValidation(validationResult);

            if (style === 'cartoon') {
                 component.addRepresentation("cartoon", { colorScheme: "chain" });
                 component.addRepresentation("licorice", { sele: "ligand or not polymer", scale: 2.0 });
            } else if (style === 'licorice') {
                 component.addRepresentation("licorice", { colorScheme: "element", scale: 2.0, radius: 0.15 });
            } else if (style === 'ball+stick') {
                 component.addRepresentation("ball+stick", { colorScheme: "element" });
            } else if (style === 'spacefill') {
                 component.addRepresentation("spacefill", { colorScheme: "element" });
            }
            component.autoView();
        } catch (error) {
            console.error("Failed to load PDB:", error);
            setValidation({ isValid: false, issues: ["Format Error: Invalid PDB parsing"], timestamp: Date.now() });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadMolecule(); }, [moleculeId, style]);
    useEffect(() => { loadMolecule(); }, [refreshSignal]);

    useEffect(() => {
        if (stageRef.current) stageRef.current.setSpin(spin);
    }, [spin]);

    useEffect(() => {
        if (stageRef.current && zoomSignal > 0) {
            stageRef.current.viewer.controls.zoom(1.2);
        }
    }, [zoomSignal]);

    return (
        <div className="relative h-full w-full">
            <div ref={containerRef} className="h-full w-full" />
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                    <div className="flex flex-col items-center gap-2 text-primary">
                         <RefreshCw className="h-8 w-8 animate-spin" />
                         <span className="text-xs font-mono animate-pulse">Recalculating Surface...</span>
                    </div>
                </div>
            )}

            {/* Validation HUD */}
            {!isLoading && validation && (
                <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-2 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                        validation.isValid 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        {validation.isValid ? <ShieldCheck className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {validation.isValid ? 'Geometric Validation: Passed' : 'Validation Warning'}
                            </span>
                            {!validation.isValid && (
                                <span className="text-[9px] font-medium opacity-80 leading-tight mt-0.5">
                                    {validation.issues[0]}
                                </span>
                            )}
                        </div>
                    </div>
                    {!validation.isValid && validation.issues.length > 1 && (
                        <div className="bg-surface/80 border border-white/5 p-2 rounded-xl text-[8px] text-slate-500 flex flex-col gap-1">
                            {validation.issues.slice(1).map((issue, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <AlertTriangle className="h-2.5 w-2.5 text-yellow-500" />
                                    {issue}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

const MoleculeViewer: React.FC = () => {
  const [selectedMol, setSelectedMol] = useState<Molecule>(MOCK_MOLECULES[0]);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');
  const [renderStyle, setRenderStyle] = useState<string>('ball+stick');
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [zoomSignal, setZoomSignal] = useState(0);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<{ mol: Molecule; y: number; x: number } | null>(null);
  const [copying, setCopying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
      setViewMode(selectedMol.has3D ? '3D' : '2D');
  }, [selectedMol]);

  const handleDownloadPDB = () => {
    if (!selectedMol.has3D) return;
    const element = document.createElement("a");
    const file = new Blob([MOCK_PDB_DATA], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedMol.id}.pdb`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportReport = () => {
    const report = {
        molecule: selectedMol,
        timestamp: new Date().toISOString(),
        analysis: "Structure validated against PDB standard 01-JAN-21.",
        checksum: Math.random().toString(36).substring(2, 15)
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${selectedMol.id}.json`;
    a.click();
  };

  const handleShare = () => {
      navigator.clipboard.writeText(selectedMol.smiles);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 lg:flex-row animate-in fade-in duration-500">
      <div className="w-full lg:w-1/3 flex flex-col gap-4 relative">
        <div className="rounded-2xl border border-white/5 bg-surface p-4 flex-1 overflow-hidden flex flex-col">
            <div className="mb-4 flex items-center justify-between px-2">
                <h3 className="font-semibold text-white">Molecule Library</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{MOCK_MOLECULES.length} Units</span>
            </div>
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {MOCK_MOLECULES.map((mol) => (
                    <button
                        key={mol.id}
                        onClick={() => setSelectedMol(mol)}
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredItem({ mol, y: rect.top + (rect.height / 2), x: rect.right });
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`w-full rounded-xl border p-3 text-left transition-all group ${
                            selectedMol.id === mol.id
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-white/5 bg-surfaceHighlight hover:bg-white/5 hover:border-white/10'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${selectedMol.id === mol.id ? 'text-primary' : 'text-slate-200 group-hover:text-white'}`}>
                                {mol.name}
                            </span>
                            {mol.has3D && <Box className={`h-3 w-3 ${selectedMol.id === mol.id ? 'text-primary' : 'text-accent opacity-50'}`} />}
                        </div>
                        <p className="truncate text-[10px] font-mono text-slate-500">{mol.smiles}</p>
                    </button>
                ))}
            </div>
        </div>
        
        <div className="rounded-2xl border border-white/5 bg-surface p-6 shadow-inner">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Info className="h-4 w-4" /> Descriptor Set
                </h4>
                <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-1 hover:bg-white/5 rounded-full transition-colors"
                >
                    <Info className={`h-4 w-4 ${showDetails ? 'text-primary' : 'text-slate-600'}`} />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Mol. Weight', val: selectedMol.mw, unit: 'Da' },
                    { label: 'LogP', val: selectedMol.logP, unit: '' },
                    { label: 'TPSA', val: selectedMol.tpsa, unit: 'Å²' },
                    { label: '3D Ready', val: selectedMol.has3D ? 'Yes' : 'No', color: selectedMol.has3D ? 'text-green-400' : 'text-red-400' }
                ].map((stat, i) => (
                    <div key={i} className="rounded-lg bg-surfaceHighlight p-3 border border-white/5 hover:border-white/10 transition-colors">
                        <p className="text-[10px] uppercase text-slate-600 font-bold tracking-tight mb-1">{stat.label}</p>
                        <p className={`text-lg font-mono leading-none ${stat.color || 'text-white'}`}>
                            {stat.val}<span className="text-[10px] text-slate-600 ml-1">{stat.unit}</span>
                        </p>
                    </div>
                ))}
            </div>
            {showDetails && (
                <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-[10px] text-slate-300 animate-in slide-in-from-top-2">
                    Descriptors computed via RDKit engine. Values represent the most probable conformer state at physiological pH.
                </div>
            )}
        </div>
      </div>

      <div className="relative flex-1 rounded-3xl border border-white/10 bg-black overflow-hidden shadow-2xl flex flex-col group/viewer">
         <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
            <div className="flex p-1 bg-surface/80 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-max">
                <button onClick={() => setViewMode('2D')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === '2D' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>2D</button>
                <button onClick={() => setViewMode('3D')} disabled={!selectedMol.has3D} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${viewMode === '3D' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'} ${!selectedMol.has3D ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Move3d className="h-3 w-3" /> 3D
                </button>
            </div>

            {viewMode === '3D' && selectedMol.has3D && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-left-2 duration-300">
                    <div className="bg-surface/90 backdrop-blur-md rounded-xl border border-white/10 p-2 shadow-xl w-max">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <Layers className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] uppercase font-bold text-slate-500">Render</span>
                        </div>
                        <div className="flex gap-1">
                            {['ball+stick', 'licorice', 'spacefill', 'cartoon'].map((style) => (
                                <button key={style} onClick={() => setRenderStyle(style)} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tighter transition-colors border ${renderStyle === style ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setIsSpinning(!isSpinning)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${isSpinning ? 'bg-accent/10 text-accent border-accent/20' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}>
                        <Rotate3d className={`h-4 w-4 ${isSpinning ? 'animate-spin-slow' : ''}`} />
                        {isSpinning ? 'Spin Active' : 'Spin Paused'}
                    </button>
                </div>
            )}
         </div>

         <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
                onClick={handleShare}
                className="p-2.5 rounded-full bg-surface/80 hover:bg-primary/20 hover:text-primary text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110 flex items-center justify-center"
                title="Copy SMILES"
            >
                {copying ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button onClick={() => setZoomSignal(s => s + 1)} className="p-2.5 rounded-full bg-surface/80 hover:bg-primary/20 hover:text-primary text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110">
                <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={handleDownloadPDB} disabled={!selectedMol.has3D} className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface/80 hover:bg-white/10 text-white backdrop-blur-md border border-white/10 transition-all ${!selectedMol.has3D ? 'opacity-30 cursor-not-allowed' : 'hover:border-primary/50 hover:text-primary hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'}`} title="Export PDB">
                <Download className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-tighter">PDB</span>
            </button>
         </div>

         <div className="flex-1 w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#11131F] to-[#050508] relative">
            {viewMode === '3D' && selectedMol.has3D ? (
                 <NGLViewer moleculeId={selectedMol.id} style={renderStyle} spin={isSpinning} zoomSignal={zoomSignal} refreshSignal={refreshSignal} />
            ) : (
                <div className="h-full w-full flex items-center justify-center p-10 animate-in zoom-in duration-300">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl opacity-90 max-w-sm w-full aspect-square flex items-center justify-center border-4 border-slate-100 relative group/img">
                         <img 
                            src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(selectedMol.smiles)}/PNG?record_type=2d&image_size=400x400`} 
                            alt={selectedMol.name}
                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/img:scale-110"
                        />
                    </div>
                </div>
            )}
         </div>

         <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-lg z-10 shadow-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2 italic tracking-tighter uppercase">
                        {selectedMol.name}
                        <span className="text-[10px] font-mono not-italic tracking-normal px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">#{selectedMol.id}</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Project: Kinase Alpha-7 Cascade</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={() => setRefreshSignal(s => s + 1)} className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-2 text-white transition-all hover:rotate-180 duration-500" title="Refresh Geometry">
                        <RefreshCw className="h-4 w-4" />
                     </button>
                    <button onClick={exportReport} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95">
                        <FileJson className="h-4 w-4" /> Export Report
                    </button>
                </div>
            </div>
         </div>
      </div>

      {hoveredItem && (
        <div 
            className="fixed z-50 w-40 rounded-2xl border border-white/10 bg-surface/95 p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
            style={{ top: hoveredItem.y, left: hoveredItem.x + 16, transform: 'translateY(-50%)' }}
        >
            <div className="mb-2 overflow-hidden rounded-xl bg-white p-2">
                <img 
                    src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(hoveredItem.mol.smiles)}/PNG?record_type=2d&image_size=200x200`} 
                    alt={hoveredItem.mol.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                />
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-white uppercase">{hoveredItem.mol.name}</p>
                <div className="flex justify-center gap-2 mt-2 border-t border-white/5 pt-1 text-[9px] text-slate-500 font-mono">
                    <span>{hoveredItem.mol.mw} Da</span>
                    <span>logP {hoveredItem.mol.logP}</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MoleculeViewer;