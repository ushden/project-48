import {useMemo, useState} from 'react';
import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Line} from 'react-native-svg';

import {useCaseStore} from '../store/caseStore';
import {evidenceIndex} from '../data/evidence';

type EvidenceNode = {
  id: string;
  title: string;
};

export default function MindBoardScreen() {
  const {
    unlockedEvidence,
    boardLinks,
    addBoardLink,
    removeBoardLink
  } = useCaseStore();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const evidence: EvidenceNode[] = useMemo(() => {
    return Array.from(unlockedEvidence)
      .map(id => evidenceIndex[id])
      .filter(Boolean)
      .map(e => ({
        id: e.id,
        title: e.title
      }));
  }, [unlockedEvidence]);

  const positions = useMemo(() => {
    const {width} = Dimensions.get('window');
    const spacing = 120;

    return Object.fromEntries(
      evidence.map((e, i) => [
        e.id,
        {
          x: width / 2 + Math.cos(i) * spacing,
          y: 200 + Math.sin(i) * spacing
        }
      ])
    );
  }, [evidence]);

  const handleNodePress = (id: string) => {
    if (!selectedNode) {
      setSelectedNode(id);
      return;
    }

    if (selectedNode === id) {
      setSelectedNode(null);
      return;
    }

    addBoardLink(
      selectedNode,
      id,
      'related'
    );

    setSelectedNode(null);
  };

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill}>
        {boardLinks.map(link => {
          const from = positions[link.fromId];
          const to = positions[link.toId];

          if (!from || !to) return null;

          return (
            <Line
              key={`${link.fromId}-${link.toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#555"
              strokeWidth={2}
              onPress={() => removeBoardLink(link.fromId, link.toId)}
            />
          );
        })}
      </Svg>

      {evidence.map(node => {
        const pos = positions[node.id];
        const selected = selectedNode === node.id;

        return (
          <Pressable
            key={node.id}
            onPress={() => handleNodePress(node.id)}
            style={[
              styles.node,
              {
                left: pos.x - 60,
                top: pos.y - 30
              },
              selected && styles.nodeSelected
            ]}
          >
            <Text style={styles.nodeText}>
              {node.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },

  node: {
    position: 'absolute',
    width: 120,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1c1c1c',
    borderWidth: 1,
    borderColor: '#333'
  },

  nodeSelected: {
    borderColor: '#777',
    backgroundColor: '#222'
  },

  nodeText: {
    color: '#ddd',
    fontSize: 13,
    textAlign: 'center'
  }
});
