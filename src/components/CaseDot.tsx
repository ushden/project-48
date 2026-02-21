import {Animated, Dimensions, Pressable, StyleSheet, View} from 'react-native';
import {useEffect, useRef} from 'react';

import {CaseMeta, CaseStatus} from '../types/case';
import {useCaseStore} from '../store/caseStore';

const {width, height} = Dimensions.get('window');

interface CaseDotProps {
  state: CaseStatus;
  caseMeta: CaseMeta;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string) => void;
}

export const CaseDot = (props: CaseDotProps) => {
  const {caseMeta, state, selectedCaseId, setSelectedCaseId} = props;

  const scale = useRef(new Animated.Value(1)).current;

  const addLog = useCaseStore(s => s.addLog);
  const hasLogFlag = useCaseStore(s => s.hasLogFlag);
  const setLogFlag = useCaseStore(s => s.setLogFlag);

  const isSelected = caseMeta.id === selectedCaseId;
  const left = caseMeta.position.x * width;
  const top = caseMeta.position.y * height;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.3 : 1,
      useNativeDriver: true,
      friction: 6
    }).start();
  }, [isSelected]);

  return (
    <Pressable
      onPress={() => {
        if (selectedCaseId !== caseMeta.id) {
          setSelectedCaseId(caseMeta.id);
        }

        if (state === 'locked' && !hasLogFlag(`locked_${caseMeta.id}`)) {
          addLog(
            'system',
            'Это дело пока мне не по силам. Нужно разобраться с другими вопросами.',
            'hint',
          );
          setLogFlag(`locked_${caseMeta.id}`);
        }
      }}
      style={[{left, top}]}
    >
      <View
        style={[
          styles.casePoint,
          {transform: [{scale}]},
          state === 'completed' && styles.completed,
          state === 'active' && styles.active,
          isSelected && styles.selected,
          state === 'locked' && styles.locked
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  casePoint: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e0e0e0'
  },
  completed: {
    backgroundColor: '#4caf50'
  },
  active: {
    shadowColor: '#6fa8ff',
    shadowOpacity: 0.9,
    shadowRadius: 10
  },
  locked: {
    backgroundColor: '#555',
    opacity: 0.5
  },
  selected: {
    borderWidth: 2,
    borderColor: '#ffd700'
  }
});