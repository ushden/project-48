import missing_employee from './cases/case_missing_employee.json';
import {CaseData, CaseMeta} from '../types/case';

export const casesMeta: CaseMeta[] = [
  {
    id: 'missing_employee',
    witness: [
      {
        id: 'colleague',
        listPortrait: {
          source: require('../../assets/case_1/case_1_colleague_portrait.jpg'),
        },
        dialoguePortrait: {
          source: require('../../assets/case_1/case_1_colleague.jpg'),
        },
      },
      {
        id: 'manager',
        listPortrait: {
          source: require('../../assets/case_1/case_1_hr_manager_portrait.jpg'),
        },
        dialoguePortrait: {
          source: require('../../assets/case_1/case_1_hr_manager.jpg'),
        },
      },
    ],
    scenes: [
      {
        id: 'office_scene',
        portrait: {
          source: require('../../assets/case_1/case_1_office_scene.webp'),
        },
      },
    ],
    introDialogue: {
      source: require('../../assets/case_1/case_1_hr_manager.jpg'),
    },
  }
];

export const casesData: Record<string, CaseData> = {
  'missing_employee': missing_employee as CaseData,
};
