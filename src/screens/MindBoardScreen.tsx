import {useMemo, useState} from 'react';
import {LayoutChangeEvent, Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import {useCaseStore} from '../store/caseStore';
import CaseStatus from '../components/CaseStatus';
import {StyledText} from '../components/StyledText';

export default function MindBoardScreen() {
  const caseData = useCaseStore(s => s.case);
  const isUnlocked = useCaseStore(s => s.isUnlocked);

  const boardLinks = useCaseStore(s => s.boardLinks);
  const nodePositions = useCaseStore(s => s.nodePositions);
  const setNodePosition = useCaseStore(s => s.setNodePosition);
  const addLink = useCaseStore(s => s.addBoardLink);

  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [linkTo, setLinkTo] = useState<string | null>(null);

  if (!caseData) {
    return (
      <View style={styles.center}>
        <StyledText style={{color: 'white'}}>No active case</StyledText>
      </View>
    );
  }

  const evidence = caseData.evidence.filter(e =>
    isUnlocked(e.id)
  );

  const linkColors = {
    supports: '#4caf50',
    contradicts: '#f44336',
    related: '#2196f3'
  } as const;

  const onCardLayout =
    (id: string) =>
      (event: LayoutChangeEvent) => {
        const {x, y, width, height} =
          event.nativeEvent.layout;

        setNodePosition(
          id,
          x + width / 2,
          y + height / 2
        );
      };

  const onCardPress = (id: string) => {
    if (!linkFrom) {
      setLinkFrom(id);
      return;
    }

    if (linkFrom && !linkTo && id !== linkFrom) {
      setLinkTo(id);
    }
  };

  const resetSelection = () => {
    setLinkFrom(null);
    setLinkTo(null);
  };

  const lines = useMemo(() => {
    return boardLinks
      .map((link, index) => {
        const from = nodePositions[link.fromId];
        const to = nodePositions[link.toId];

        if (!from || !to) return null;

        return (
          <Line
            key={index}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={linkColors[link.type]}
            strokeWidth={2}
          />
        );
      })
      .filter(Boolean);
  }, [boardLinks, nodePositions]);

  return (
    <View style={styles.container}>
      <CaseStatus />

      {/* SVG слой со связями */}
      <Svg
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {lines}
      </Svg>

      <StyledText style={styles.title}>
        Investigation Board
      </StyledText>

      {/* Панель создания связи */}
      {linkFrom && linkTo && (
        <View style={styles.linkPanel}>
          <StyledText style={styles.panelTitle}>
            Create link
          </StyledText>

          <View style={styles.panelButtons}>
            <Pressable
              style={styles.panelButton}
              onPress={() => {
                addLink(linkFrom, linkTo, 'supports');
                resetSelection();
              }}
            >
              <StyledText style={styles.supports}>
                Supports
              </StyledText>
            </Pressable>

            <Pressable
              style={styles.panelButton}
              onPress={() => {
                addLink(linkFrom, linkTo, 'contradicts');
                resetSelection();
              }}
            >
              <StyledText style={styles.contradicts}>
                Contradicts
              </StyledText>
            </Pressable>

            <Pressable
              style={styles.panelButton}
              onPress={() => {
                addLink(linkFrom, linkTo, 'related');
                resetSelection();
              }}
            >
              <StyledText style={styles.related}>
                Related
              </StyledText>
            </Pressable>
          </View>
        </View>
      )}

      {/* Сетка улик */}
      <View style={styles.grid}>
        {evidence.map(e => {
          const isSelected =
            e.id === linkFrom || e.id === linkTo;

          return (
            <Pressable
              key={e.id}
              onPress={() => onCardPress(e.id)}
              onLayout={onCardLayout(e.id)}
              style={[
                styles.card,
                isSelected && styles.selected
              ]}
            >
              <StyledText style={styles.cardTitle}>
                {e.title}
              </StyledText>
            </Pressable>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  },
  title: {
    color: 'white',
    fontSize: 20,
    marginBottom: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  card: {
    width: '48%',
    backgroundColor: '#1f1f1f',
    padding: 12,
    borderRadius: 8
  },
  selected: {
    borderWidth: 2,
    borderColor: "#ffd700",
    shadowColor: "#ffd700",
    shadowOpacity: 0.4,
    shadowRadius: 6
  },
  cardTitle: {
    color: 'white',
    fontSize: 14
  },
  linkPanel: {
    backgroundColor: '#1f1f1f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  panelTitle: {
    color: 'white',
    marginBottom: 8
  },
  panelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  panelButton: {
    padding: 8
  },
  supports: {color: '#4caf50'},
  contradicts: {color: '#f44336'},
  related: {color: '#2196f3'},
});
