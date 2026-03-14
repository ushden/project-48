import {Animated, Dimensions, Pressable, StyleSheet} from 'react-native';
import {useEffect, useRef} from 'react';

import {CaseData, CaseStatus} from '../types/case';
import {useCaseStore} from '../store/caseStore';

const {width, height} = Dimensions.get('window');

interface CaseDotProps {
  state: CaseStatus;
  caseData: CaseData;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string) => void;
}

export const CaseDot = (props: CaseDotProps) => {
  const {caseData, state, selectedCaseId, setSelectedCaseId} = props;

  const scale = useRef(new Animated.Value(1)).current;

  const addLog = useCaseStore(s => s.addLog);
  const hasFlag = useCaseStore(s => s.hasFlag);
  const setFlag = useCaseStore(s => s.setFlag);

  const isSelected = caseData.id === selectedCaseId;
  const left = caseData.position.x * width;
  const top = caseData.position.y * height;

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
        if (selectedCaseId !== caseData.id) {
          setSelectedCaseId(caseData.id);
        }

        if (state === 'locked' && !hasFlag(`locked_${caseData.id}`)) {
          addLog(
            'system',
            'Ця справа поки що мені не під силу. Потрібно розібратись з іншими питаннями.',
            'hint'
          );
          setFlag(`locked_${caseData.id}`);
        }
      }}
      style={[{left, top}]}
    >
      <Animated.View
        style={[
          styles.casePoint,
          state === 'completed' && styles.completed,
          state === 'active' && styles.active,
          isSelected && styles.selected,
          state === 'locked' && styles.locked,
          {transform: [{scale}]}
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  casePoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: '50%',
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
    backgroundColor: '#555'
    // opacity: 0.8
  },
  selected: {
    borderWidth: 2,
    borderColor: '#ffd700'
  }
});