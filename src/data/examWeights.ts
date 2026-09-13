import type { ChapterId } from './types';

/**
 * Study topic weights for exam prep. Values are percentages and MUST sum to 100.
 * (Approximate Regitra-style emphasis for planning — not an official statute table.)
 */
export const examTopicWeights: {
  chapterId: ChapterId;
  label: string;
  percent: number;
}[] = [
  { chapterId: 'zenklai', label: 'Ženklai ir ženklinimas', percent: 16 },
  { chapterId: 'sankryzos', label: 'Sankryžos ir pirmenybė', percent: 14 },
  { chapterId: 'greitis', label: 'Greitis', percent: 9 },
  { chapterId: 'lenkimas', label: 'Lenkimas', percent: 8 },
  { chapterId: 'manevrai', label: 'Manevrai', percent: 7 },
  { chapterId: 'dalyviai', label: 'Eismo dalyviai / koridorius', percent: 7 },
  { chapterId: 'pestieji', label: 'Pėstieji', percent: 6 },
  { chapterId: 'dviraciai', label: 'Dviračiai', percent: 5 },
  { chapterId: 'mikromobilumas', label: 'Mikromobilumas', percent: 4 },
  { chapterId: 'sustojimas', label: 'Sustojimas ir stovėjimas', percent: 5 },
  { chapterId: 'sauga', label: 'Saugos priemonės', percent: 5 },
  { chapterId: 'signalai', label: 'Signalai ir šviesos', percent: 4 },
  { chapterId: 'gelezinkelis', label: 'Geležinkelio pervažos', percent: 3 },
  { chapterId: 'automagistrale', label: 'Automagistralės', percent: 3 },
  { chapterId: 'ivykis', label: 'Eismo įvykis', percent: 2 },
  { chapterId: 'vairuotojai', label: 'Vairuotojų pareigos', percent: 1 },
  { chapterId: 'savokos', label: 'Sąvokos', percent: 1 },
];

export function examWeightsTotal(): number {
  return examTopicWeights.reduce((n, w) => n + w.percent, 0);
}

/** PDF KET chapters and whether the app currently has study cards / quiz coverage. */
export const pdfCoverage: { pdfChapter: string; covered: boolean; note: string }[] = [
  { pdfChapter: 'I Bendrosios nuostatos', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'II Sąvokos', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'III–IV Dalyviai / vairuotojai', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'V–VI Pėstieji', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'VII Keleiviai', covered: true, note: 'Klausimai yra (sauga / keleiviai)' },
  { pdfChapter: 'VIII–VIII¹ Dviračiai / mikromobilumas', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'IX Vadeliojimai', covered: true, note: 'Bazinis klausimas pridėtas' },
  { pdfChapter: 'X–XII Signalai / šviesos', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XIII Manevravimas', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XIV Išsidėstymas', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XV Greitis', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XVI Lenkimas', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XVII Sustojimas', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XVIII Sankryžos', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XIX Geležinkelis', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XX Automagistralė', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XXI Gyvenamoji zona', covered: true, note: 'Per greičio / ženklų klausimus' },
  { pdfChapter: 'XXI¹ Dviračių gatvė', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XXII–XXIV Maršrutinis / negalia / specialiosios', covered: true, note: 'Per avarinį koridorių / specialiąsias TP' },
  { pdfChapter: 'XXV–XXVI Keleiviai / sauga', covered: true, note: 'Sauga padengta' },
  { pdfChapter: 'XXVII–XXVIII Kroviniai / vilkimas', covered: true, note: 'Bazinis krovinio klausimas' },
  { pdfChapter: 'XXIX Eismo įvykis', covered: true, note: 'Klausimai yra' },
  { pdfChapter: 'XXX–XXXI TP reikalavimai', covered: true, note: 'Techninės būklės klausimas' },
  { pdfChapter: '1–3 priedai Ženklai / ženklinimas', covered: true, note: 'Ženklų skiltis' },
];
