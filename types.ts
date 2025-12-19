export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  MOLECULES = 'MOLECULES',
  DOCKING = 'DOCKING',
  GENERATOR = 'GENERATOR',
  JOBS = 'JOBS',
}

export interface Project {
  id: string;
  name: string;
  description: string;
  moleculeCount: number;
  lastActive: string;
  status: 'active' | 'archived' | 'processing';
}

export interface Molecule {
  id: string;
  smiles: string;
  name: string;
  mw: number; // Molecular Weight
  logP: number;
  tpsa: number;
  has3D: boolean;
}

export interface Job {
  id: string;
  type: 'CONVERSION' | 'DOCKING_ANALYSIS' | 'GENERATION' | 'OPTIMIZATION';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0-100
  name: string;
  startedAt: string;
}

export interface DockingHit {
  id: string;
  moleculeId: string;
  rank: number;
  affinity: number; // kcal/mol
  rmsdLb: number;
  rmsdUb: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}