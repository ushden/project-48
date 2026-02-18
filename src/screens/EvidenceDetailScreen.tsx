import { View, Text, ScrollView, StyleSheet } from "react-native"
import { useRoute } from "@react-navigation/native"
import { useCaseStore } from "../store/caseStore"

export default function EvidenceDetailScreen() {
  const route = useRoute<any>()
  const { evidenceId } = route.params

  const caseData = useCaseStore(s => s.case)

  const evidence = caseData?.evidence.find(
    e => e.id === evidenceId
  )

  if (!evidence) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>
          Evidence not found
        </Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        {evidence.title}
      </Text>

      <Text style={styles.type}>
        {evidence.type}
      </Text>

      <Text style={styles.content}>
        {evidence.content}
      </Text>

    </ScrollView>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8
  },
  type: {
    color: "#aaa",
    marginBottom: 16
  },
  content: {
    color: "#ddd",
    fontSize: 16,
    lineHeight: 22
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212"
  }
})
