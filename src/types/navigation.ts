import {ImageSourcePropType} from 'react-native';
import {DialogueBlock} from './case';

export type RootStackParamList = {
  Dialogue: {
    dialogue: DialogueBlock;
    portrait: {
      source: ImageSourcePropType;
      position?: 'left' | 'right' | 'center';
    };
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
  VictimPhone: {};
};