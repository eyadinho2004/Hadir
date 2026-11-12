import { ConferenceIcon, LectureIcon, TrainingIcon, WorkshopIcon } from '../components/Icons';

export const eventCategories = [
  { value: 'ورشة', Icon: WorkshopIcon },
  { value: 'محاضرة', Icon: LectureIcon },
  { value: 'برنامج تدريبي', Icon: TrainingIcon },
  { value: 'مؤتمر', Icon: ConferenceIcon },
] as const;
