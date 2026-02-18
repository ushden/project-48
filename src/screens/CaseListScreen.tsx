import { View, Text, Pressable, StyleSheet } from "react-native"
import { casesIndex } from "../data/cases"
import { useCaseStore } from "../store/caseStore"
import { useNavigation } from "@react-navigation/native"

export default function CaseListScreen() {
  const navigation = useNavigation<any>()
  const loadCase = useCaseStore(s => s.loadCase)
  const progress = useCaseStore(s => s.casesProgress)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Cases
      </Text>

      {casesIndex.map(c => {
        const state = progress[c.id]

        return (
          <Pressable
            key={c.id}
            style={styles.card}
            onPress={() => {
              loadCase(c.id)
              navigation.navigate("EvidenceList")
            }}
          >
            <Text style={styles.caseTitle}>
              {c.title}
            </Text>

            <Text style={styles.desc}>
              {c.description}
            </Text>

            {state?.status === "completed" && (
              <Text style={styles.rating}>
                Rating: {state.rating}
              </Text>
            )}
          </Pressable>
        )
      })}

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
    fontSize: 22,
    marginBottom: 16
  },
  card: {
    backgroundColor: "#1f1f1f",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  caseTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },
  desc: {
    color: "#aaa",
    marginTop: 6
  },
  rating: {
    color: "#ffd700",
    marginTop: 8
  }
})
