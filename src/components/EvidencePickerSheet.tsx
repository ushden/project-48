import React from 'react';
import {Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

type Props = {
  visible: boolean;
  evidenceIds: string[];
  evidenceMap: Record<string, any>;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export default function EvidencePickerSheet(props: Props) {
  const {visible, evidenceIds, evidenceMap, onSelect, onClose} = props;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Доступні докази
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>
                Закрити
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {evidenceIds.map(id => {
              const evidence = evidenceMap[id];
              if (!evidence) return null;

              return (
                <TouchableOpacity
                  key={id}
                  style={styles.item}
                  onPress={() => onSelect(id)}
                >
                  <Text style={styles.itemTitle}>
                    {evidence.title}
                  </Text>

                  <Text style={styles.itemDesc}>
                    {evidence.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent'
  },
  sheet: {
    height: '60%',
    backgroundColor: '#f4f1e8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600'
  },
  close: {
    fontSize: 16,
    color: '#666'
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  itemDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4
  }
});