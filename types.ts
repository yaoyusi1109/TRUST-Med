export type RubricItem = {
  id: string;
  criterion: string;
  weight: number;
  isSafetyCritical: boolean;
};

export type Scenario = {
  id: string;
  title: string;
  category: string;
  difficulty: "Routine" | "High-Stakes";
  language: "EN" | "中文";
  vignette: string;
  query: string;
  modelA: {
    trueName: string;
    response: string;
  };
  modelB: {
    trueName: string;
    response: string;
  };
  rubric: RubricItem[];
  mockAggregate: {
    totalEvaluations: number;
    preferenceB: number;
  };
};

export type LeaderboardRow = {
  rank: number;
  model: string;
  score: number;
  evaluations: number;
  safetyFailures: number;
};

export type LeaderboardData = {
  routine: LeaderboardRow[];
  highStakes: LeaderboardRow[];
};
