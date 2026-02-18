import { View, Text, FlatList, StyleSheet } from "react-native"
import { useCaseStore } from "../store/caseStore"

export default function InvestigationLogScreen() {
  const log = useCaseStore(s => s.log)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Investigation Log
      </Text>

      <FlatList
        data={log}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={styles.type}>
              [{item.type.toUpperCase()}]
            </Text>
            <Text style={styles.text}>
              {item.text}
            </Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212"
  },
  title: {
    color: "white",
    fontSize: 20,
    marginBottom: 16
  },
  entry: {
    marginBottom: 12
  },
  type: {
    color: "#888",
    fontSize: 12
  },
  text: {
    color: "#ddd"
  }
})
