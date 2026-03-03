import {ImageSourcePropType} from 'react-native';
import {DialogueBlock, Messages} from './case';

export type RootStackParamList = {
  Dialogue: {
    dialogue: DialogueBlock;
    caseId: string;
    portrait: 'witness' | 'intro';
    witnessState?: {witnessId: string; key: 'isInterviewed', value: boolean};
    dialogueName?: string;
    onFinishAction?: 'goBack' | 'replace' | 'navigate';
    nextScreen?: any;
    nextParams?: any;
  };
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
  PhoneMessages: {};
  PhoneChat: {
    chat: Messages;
  };
  PhoneNotes: {};
};