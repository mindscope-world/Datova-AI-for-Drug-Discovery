import React, { useState, useEffect, useRef } from 'react';
import { Box, Download, Share2, ZoomIn, Info, RefreshCw, Move3d, Rotate3d, Layers } from 'lucide-react';
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
}

const NGLViewer: React.FC<NGLViewerProps> = ({ moleculeId, style, spin }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize NGL Stage
    useEffect(() => {
        if (!containerRef.current || !window.NGL) {
            console.warn("NGL not loaded or container missing");
            return;
        }

        const stage = new window.NGL.Stage(containerRef.current, { 
            backgroundColor: "#050508", // Matches app background
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

    // Load Data & Update Style
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        setIsLoading(true);
        stage.removeAllComponents();

        // Simulate Async API Fetch for PDB Data
        const fetchData = async () => {
            // Simulate network delay
            await new Promise(r => setTimeout(r, 600)); 
            
            // In a real app, this would be: fetch(`/api/molecules/${moleculeId}/pdb`)
            const pdbBlob = new Blob([MOCK_PDB_DATA], { type: 'text/plain' });
            
            try {
                const component = await stage.loadFile(pdbBlob, { ext: 'pdb', defaultRepresentation: false });
                
                // Add representation based on style prop
                if (style === 'cartoon') {
                     // For small molecules 'cartoon' is often empty, so we check or fallback
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
                console.error("Failed to load PDB in NGL:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [moleculeId, style]);

    // Handle Spin
    useEffect(() => {
        if (stageRef.current) {
            stageRef.current.setSpin(spin);
        }
    }, [spin]);

    return (
        <div className="relative h-full w-full">
            <div ref={containerRef} className="h-full w-full" />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                    <div className="flex flex-col items-center gap-2">
                         <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                         <span className="text-xs font-mono text-primary animate-pulse">Loading Structure...</span>
                    </div>
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
  const [hoveredItem, setHoveredItem] = useState<{ mol: Molecule; y: number; x: number } | null>(null);

  useEffect(() => {
      if (selectedMol.has3D) {
          setViewMode('3D');
      } else {
          setViewMode('2D');
      }
  }, [selectedMol]);

  const toggleSpin = () => setIsSpinning(!isSpinning);

  const handleDownloadPDB = () => {
    if (!selectedMol.has3D) return;

    // Create blob from mock data (in production this would be the actual file data)
    const element = document.createElement("a");
    const file = new Blob([MOCK_PDB_DATA], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedMol.id}.pdb`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Revoke URL after click
    setTimeout(() => URL.revokeObjectURL(element.href), 100);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 lg:flex-row animate-in fade-in duration-500">
      {/* List Panel */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 relative">
        <div className="rounded-2xl border border-white/5 bg-surface p-4 flex-1 overflow-hidden flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Library</h3>
                <span className="text-xs text-slate-500">{MOCK_MOLECULES.length} entries</span>
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
                        className={`w-full rounded-xl border p-3 text-left transition-all ${
                            selectedMol.id === mol.id
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-white/5 bg-surfaceHighlight hover:bg-white/5 hover:border-white/10'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${selectedMol.id === mol.id ? 'text-primary' : 'text-slate-200'}`}>
                                {mol.name}
                            </span>
                            {mol.has3D && <Box className="h-3 w-3 text-accent" />}
                        </div>
                        <p className="truncate text-xs font-mono text-slate-500">{mol.smiles}</p>
                    </button>
                ))}
            </div>
        </div>
        
        {/* Properties Panel */}
        <div className="rounded-2xl border border-white/5 bg-surface p-6">
            <h4 className="mb-4 text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Info className="h-4 w-4" /> Properties
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-surfaceHighlight p-3 border border-white/5">
                    <p className="text-[10px] uppercase text-slate-500">Mol. Weight</p>
                    <p className="text-lg font-mono text-white">{selectedMol.mw}</p>
                </div>
                <div className="rounded-lg bg-surfaceHighlight p-3 border border-white/5">
                    <p className="text-[10px] uppercase text-slate-500">LogP</p>
                    <p className="text-lg font-mono text-white">{selectedMol.logP}</p>
                </div>
                <div className="rounded-lg bg-surfaceHighlight p-3 border border-white/5">
                    <p className="text-[10px] uppercase text-slate-500">TPSA</p>
                    <p className="text-lg font-mono text-white">{selectedMol.tpsa}</p>
                </div>
                <div className="rounded-lg bg-surfaceHighlight p-3 border border-white/5">
                    <p className="text-[10px] uppercase text-slate-500">Status</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className={`h-2 w-2 rounded-full ${selectedMol.has3D ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                        <p className="text-xs text-slate-300">{selectedMol.has3D ? '3D Ready' : '2D Only'}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="relative flex-1 rounded-3xl border border-white/10 bg-black overflow-hidden shadow-2xl flex flex-col group">
         {/* Main Toolbar */}
         <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
            {/* View Toggle */}
            <div className="flex p-1 bg-surface/80 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-max">
                <button
                    onClick={() => setViewMode('2D')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        viewMode === '2D' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    2D
                </button>
                <button
                     onClick={() => setViewMode('3D')}
                     disabled={!selectedMol.has3D}
                     className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                        viewMode === '3D' ? 'bg-primary text-white shadow-lg shadow-purple-500/25' : 'text-slate-400 hover:text-white'
                     } ${!selectedMol.has3D ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Move3d className="h-3 w-3" /> 3D
                </button>
            </div>

            {/* 3D Controls */}
            {viewMode === '3D' && selectedMol.has3D && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-left-2 duration-300">
                    <div className="bg-surface/90 backdrop-blur-md rounded-xl border border-white/10 p-2 shadow-xl w-max">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <Layers className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] uppercase font-bold text-slate-500">Style</span>
                        </div>
                        <div className="flex gap-1">
                            {['ball+stick', 'licorice', 'spacefill', 'cartoon'].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setRenderStyle(style)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors border ${
                                        renderStyle === style 
                                        ? 'bg-primary/20 border-primary text-primary' 
                                        : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface/90 backdrop-blur-md rounded-xl border border-white/10 p-2 shadow-xl w-max">
                        <button
                            onClick={toggleSpin}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full justify-center ${
                                isSpinning 
                                ? 'bg-accent/20 text-accent border border-accent/30' 
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <Rotate3d className={`h-4 w-4 ${isSpinning ? 'animate-spin-slow' : ''}`} />
                            {isSpinning ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}
                        </button>
                    </div>
                </div>
            )}
         </div>

         {/* Right Toolbar - Always Visible */}
         <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button className="p-2 rounded-full bg-surface/80 hover:bg-white/10 text-white backdrop-blur-md border border-white/10 transition-colors">
                <ZoomIn className="h-4 w-4" />
            </button>
            <button 
                onClick={handleDownloadPDB}
                disabled={!selectedMol.has3D}
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 hover:bg-white/10 text-white backdrop-blur-md border border-white/10 transition-colors ${!selectedMol.has3D ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:text-primary'}`}
                title="Download PDB Structure"
            >
                <Download className="h-4 w-4" />
                <span className="text-xs font-medium">Download PDB</span>
            </button>
         </div>

         {/* Visual Content */}
         <div className="flex-1 w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#11131F] to-[#050508] relative">
            {viewMode === '3D' && selectedMol.has3D ? (
                 <NGLViewer moleculeId={selectedMol.id} style={renderStyle} spin={isSpinning} />
            ) : (
                <div className="h-full w-full flex items-center justify-center p-10">
                    <div className="bg-white p-8 rounded-xl shadow-2xl opacity-90 max-w-md w-full aspect-square flex items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden group/image">
                         <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>
                         <img 
                            src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(selectedMol.smiles)}/PNG?record_type=2d&image_size=400x400`} 
                            alt={selectedMol.name}
                            className="w-full h-full object-contain mix-blend-multiply opacity-90 transition-transform duration-700 group-hover/image:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <div className="hidden text-slate-400 flex flex-col items-center">
                            <span className="font-mono text-sm block mb-2">Structure Preview Unavailable</span>
                        </div>
                    </div>
                </div>
            )}
         </div>

         {/* Overlay Stats */}
         <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md z-10 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {selectedMol.name}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-400 border border-white/5">{selectedMol.id}</span>
                    </h2>
                    <p className="text-xs text-slate-400">Project: Kinase Inhibitor Alpha</p>
                </div>
                <div className="flex gap-2">
                     <button className="flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-2 text-sm text-white transition-colors">
                        <RefreshCw className="h-4 w-4" />
                     </button>
                    <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                        <Share2 className="h-4 w-4" /> Export Report
                    </button>
                </div>
            </div>
         </div>
      </div>

      {/* Hover Tooltip (Fixed Position Portal-like) */}
      {hoveredItem && (
        <div 
            className="fixed z-50 w-48 rounded-xl border border-white/10 bg-surface/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
            style={{ 
                top: hoveredItem.y, 
                left: hoveredItem.x + 12,
                transform: 'translateY(-50%)' 
            }}
        >
            <div className="mb-2 overflow-hidden rounded-lg bg-white p-1">
                <img 
                    src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(hoveredItem.mol.smiles)}/PNG?record_type=2d&image_size=200x200`} 
                    alt={hoveredItem.mol.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                />
            </div>
            <div className="text-center">
                <p className="text-xs font-bold text-white">{hoveredItem.mol.name}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{hoveredItem.mol.smiles.slice(0, 15)}...</p>
                <div className="flex justify-center gap-2 mt-2 border-t border-slate-200/20 pt-1">
                    <span className="text-[9px] text-slate-500">MW: {hoveredItem.mol.mw}</span>
                    <span className="text-[9px] text-slate-500">LogP: {hoveredItem.mol.logP}</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MoleculeViewer;