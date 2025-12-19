import { Project, Molecule, Job, DockingHit, ChartDataPoint } from './types';

export const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Kinase Inhibitor Alpha', description: 'Targeting EGFR mutations in NSCLC', moleculeCount: 1250, lastActive: '2 hrs ago', status: 'active' },
  { id: '2', name: 'Project Chimera', description: 'Macrocyclic peptide discovery', moleculeCount: 430, lastActive: '1 day ago', status: 'processing' },
  { id: '3', name: 'GPCR Allosteric', description: 'Negative allosteric modulators', moleculeCount: 8900, lastActive: '3 days ago', status: 'active' },
  { id: '4', name: 'Ion Channel Blocker', description: 'Nav1.7 selective inhibitors', moleculeCount: 200, lastActive: '1 week ago', status: 'archived' },
];

export const MOCK_MOLECULES: Molecule[] = [
  { id: 'MOL-001', name: 'Ivacaftor-deriv-A', smiles: 'CC1=CC(=C(C=C1)C(=O)NC2=CC3=C(C=C2)C(=CC(=C3)C(C)(C)C)O)C(C)(C)C', mw: 392.5, logP: 4.2, tpsa: 55.1, has3D: true },
  { id: 'MOL-002', name: 'Gefitinib-analog', smiles: 'COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4', mw: 446.9, logP: 3.8, tpsa: 68.4, has3D: true },
  { id: 'MOL-003', name: 'Candidate-X9', smiles: 'CC(C)C1=CC=C(C=C1)C(=O)O', mw: 206.2, logP: 2.1, tpsa: 37.3, has3D: false },
  { id: 'MOL-004', name: 'Ligand-402', smiles: 'C1CC(C1)C(=O)NC2=CC=CC=C2', mw: 250.1, logP: 2.5, tpsa: 45.0, has3D: true },
];

export const MOCK_JOBS: Job[] = [
  { id: 'JOB-8821', type: 'DOCKING_ANALYSIS', status: 'RUNNING', progress: 45, name: 'DolceVita Analysis - Proj Alpha', startedAt: '10 mins ago' },
  { id: 'JOB-8820', type: 'CONVERSION', status: 'COMPLETED', progress: 100, name: 'SDF to PDB (MegaSdf2pdb)', startedAt: '1 hour ago' },
  { id: 'JOB-8819', type: 'GENERATION', status: 'COMPLETED', progress: 100, name: 'Casino Stochastic Gen', startedAt: '2 hours ago' },
  { id: 'JOB-8815', type: 'OPTIMIZATION', status: 'FAILED', progress: 80, name: 'UFF Geometry Opt', startedAt: '1 day ago' },
];

export const DOCKING_STATS: ChartDataPoint[] = [
  { name: '-12.0', value: 5 },
  { name: '-11.5', value: 12 },
  { name: '-11.0', value: 25 },
  { name: '-10.5', value: 45 },
  { name: '-10.0', value: 80 },
  { name: '-9.5', value: 120 },
  { name: '-9.0', value: 150 },
  { name: '-8.5', value: 90 },
  { name: '-8.0', value: 40 },
];

export const TOP_HITS: DockingHit[] = [
  { id: 'HIT-1', moleculeId: 'MOL-001', rank: 1, affinity: -12.4, rmsdLb: 0.0, rmsdUb: 0.0 },
  { id: 'HIT-2', moleculeId: 'MOL-045', rank: 2, affinity: -11.9, rmsdLb: 1.2, rmsdUb: 1.8 },
  { id: 'HIT-3', moleculeId: 'MOL-102', rank: 3, affinity: -11.8, rmsdLb: 2.1, rmsdUb: 3.5 },
  { id: 'HIT-4', moleculeId: 'MOL-002', rank: 4, affinity: -11.5, rmsdLb: 1.5, rmsdUb: 2.0 },
];

// A small mock PDB structure (Aspirin-like) for visualization
export const MOCK_PDB_DATA = `
HEADER    LIGAND                                  01-JAN-21   NONE
ATOM      1  C   LIG     1       2.235   1.034   0.046  1.00  0.00           C  
ATOM      2  C   LIG     1       1.503   2.183   0.281  1.00  0.00           C  
ATOM      3  C   LIG     1       0.117   2.158   0.286  1.00  0.00           C  
ATOM      4  C   LIG     1      -0.536   0.941   0.052  1.00  0.00           C  
ATOM      5  C   LIG     1       0.201  -0.222  -0.198  1.00  0.00           C  
ATOM      6  C   LIG     1       1.583  -0.161  -0.199  1.00  0.00           C  
ATOM      7  O   LIG     1      -1.897   0.999   0.149  1.00  0.00           O  
ATOM      8  C   LIG     1      -2.610  -0.144  -0.155  1.00  0.00           C  
ATOM      9  O   LIG     1      -2.112  -1.229  -0.428  1.00  0.00           O  
ATOM     10  C   LIG     1      -4.086   0.100  -0.116  1.00  0.00           C  
ATOM     11  C   LIG     1      -0.490  -1.503  -0.463  1.00  0.00           C  
ATOM     12  O   LIG     1      -0.005  -2.288  -1.268  1.00  0.00           O  
ATOM     13  O   LIG     1      -1.685  -1.666   0.159  1.00  0.00           O  
CONECT    1    2    6
CONECT    2    1    3
CONECT    3    2    4
CONECT    4    3    5    7
CONECT    5    4    6   11
CONECT    6    1    5
CONECT    7    4    8
CONECT    8    7    9   10
CONECT    9    8
CONECT   10    8
CONECT   11    5   12   13
CONECT   12   11
CONECT   13   11
END
`;
