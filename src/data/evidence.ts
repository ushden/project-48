export type EvidenceData = {
  id: string;
  title: string;
  description: string;
};

export const evidenceIndex: Record<string, EvidenceData> = {
  work_report_draft: {
    id: 'work_report_draft',
    title: 'Черновик отчёта',
    description: 'Отчёт был не завершён...',
  },
  shredded_note: {
    id: 'shredded_note',
    title: 'TEST TITLE',
    description: 'TEST DESCRIPTION',
  },
};