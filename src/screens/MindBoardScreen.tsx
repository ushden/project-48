import {Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Line} from 'react-native-svg';

import {useCaseStore} from '../store/caseStore';

const linkColors = {
  supports: '#4caf50',
  contradicts: '#f44336',
  related: '#2196f3'
};

export default function MindBoardScreen() {
  const caseData = useCaseStore(s => s.case);
  const nodePositions = useCaseStore(s => s.nodePositions);
  const boardLinks = useCaseStore(s => s.boardLinks);
  const isUnlocked = useCaseStore(s => s.isUnlocked);
  const addLink = useCaseStore(s => s.addBoardLink);
  const setNodePosition = useCaseStore(s => s.setNodePosition);

  if (!caseData) return null;

  const evidence = caseData.evidence.filter(e =>
    isUnlocked(e.id)
  );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Investigation Board
      </Text>

      <Svg
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {boardLinks.map((link, i) => {
          const from = nodePositions[link.fromId];
          const to = nodePositions[link.toId];

          if (!from || !to) return null;

          return (
            <Line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={linkColors[link.type]}
              strokeWidth={2}
            />
          );
        })}
      </Svg>

      {evidence.map(e => (
        <View
          key={e.id}
          style={styles.card}
          onLayout={event => {
            const {x, y, width, height} = event.nativeEvent.layout;
            setNodePosition(
              e.id,
              x + width / 2,
              y + height / 2
            );
          }}
        >
          <Text style={styles.cardTitle}>
            {e.title}
          </Text>

          <Pressable
            style={styles.linkButton}
            onPress={() =>
              addLink(e.id, evidence[0].id, 'related')
            }
          >
            <Text style={styles.linkText}>
              Link to first evidence
            </Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.subtitle}>
        Links
      </Text>

      {boardLinks.map((l, i) => (
        <Text key={i} style={styles.link}>
          {l.fromId} → {l.toId} ({l.type})
        </Text>
      ))}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212'
  },
  title: {
    color: 'white',
    fontSize: 20,
    marginBottom: 16
  },
  subtitle: {
    color: '#aaa',
    marginTop: 20,
    marginBottom: 8
  },
  card: {
    backgroundColor: '#1f1f1f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 6
  },
  linkButton: {
    backgroundColor: '#2a2a2a',
    padding: 6,
    borderRadius: 6
  },
  linkText: {
    color: '#aaa',
    fontSize: 12
  },
  link: {
    color: '#888',
    fontSize: 12
  }
});
