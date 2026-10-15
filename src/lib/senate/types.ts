export type SenateCandidate = { name: string; party: string; votes: number; elected: boolean };

export type SenateConstituency = {
  code: string;
  province: string;
  name: string;
  seats: number;
  census: number;
  candidates: SenateCandidate[];
};

export type SenateElection = { id: string; date: string; constituencies: SenateConstituency[] };
