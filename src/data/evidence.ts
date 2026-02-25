export type EvidenceData = {
  id: string;
  title: string;
  description: string;
};

export const evidenceIndex: Record<string, EvidenceData> = {
  work_report_draft: {
    id: 'work_report_draft',
    title: 'Черновик отчёта',
    description:
      'Отчёт не закончен. Последние строки выглядят поспешными, будто его прервали на середине мысли. ' +
      'Тема сложная, но почерк уверенный - он явно знал, о чём писал. ' +
      'Интересно, что именно не успел дописать и почему.',
  },
  shredded_note: {
    id: 'shredded_note',
    title: 'Измельчённая записка',
    description:
      'Записка была разорвана вручную и выброшена в корзину. ' +
      'Слишком аккуратно для случайности. ' +
      'Значит, он не хотел, чтобы это прочли. ' +
      'Иногда то, что человек пытается скрыть, говорит больше, чем любые слова.',
  },
};