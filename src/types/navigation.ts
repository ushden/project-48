import {ImageSourcePropType} from 'react-native';
import {DialogueBlock, Messages} from './case';

export type RootStackParamList = {
  Dialogue: {
    dialogue: DialogueBlock;
    caseId: string;
    portrait: 'witness' | 'intro';
    witnessState?: {witnessId: string};
    dialogueName?: string;
    onFinishAction?: 'goBack' | 'replace' | 'navigate';
    nextScreen?: any;
    nextParams?: any;
  };
  Questions: {
    isIntro?: boolean;
  },
  CaseHub?: {};
  CrimeScene: {
    crimeSceneId: string;
    caseId: string;
  };
  Witnesses: {
    caseId: string;
  };
  MindBoard: {};
  PhoneHome: {};
  PhoneMessages?: {};
  PhoneChat: {
    chat: Messages;
  };
  PhoneNotes?: {};
};