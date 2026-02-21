import case_missing_employee from './case_missing_employee.json';
import {CaseData, CaseMeta} from '../types/case';

export const casesIndex: CaseMeta[] = [
  {
    id: 'case_missing_employee',
    title: 'Missing Employee',
    description: 'An employee vanished after a late-night shift.',
    region: 'test',
    position: {x: 0.2, y: 0.3},
    difficulty: 1,
    unlockConditions: [],
  },
  {
    id: 'case_warehouse_incident',
    title: 'Warehouse Incident',
    description: 'A suspicious accident at a logistics hub.',
    region: 'test 2',
    position: {x: 0.5, y: 0.25},
    difficulty: 1,
    unlockConditions: [
      {type: 'caseCompleted', caseId: 'case_01'},
      {type: 'minRating', rating: 'B'}
    ]
  }
];

export const caseMapping: Record<string, CaseData> = {
  'case_missing_employee': case_missing_employee as CaseData
};
