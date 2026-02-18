import {FlatList, Pressable, StyleSheet, Text, View} from "react-native"
import {useNavigation} from "@react-navigation/native"

import {useCaseStore} from "../store/caseStore"
import EvidenceCard from "../components/EvidenceCard"

export default function EvidenceListScreen() {
  const navigation = useNavigation<any>()

  const caseData = useCaseStore(s => s.case)
  const isUnlocked = useCaseStore(s => s.isUnlocked)

  if (!caseData) {
    return (
      <View style={styles.center}>
        <Text style={{color: "white"}}>Loading case...</Text>
      </View>
    )
  }

  const unlockedEvidence = caseData.evidence.filter(e =>
    isUnlocked(e.id)
  )

  return (
    <View style={styles.container}>

      <Text style={styles.header}>
        {caseData.title}
      </Text>

      <Pressable
        style={{
          backgroundColor: "#2a2a2a",
          padding: 10,
          marginBottom: 10,
          borderRadius: 8
        }}
        onPress={() => navigation.navigate("Log")}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Investigation Log
        </Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: "#2a2a2a",
          padding: 12,
          marginBottom: 16,
          borderRadius: 8
        }}
        onPress={() => navigation.navigate("Dialogue")}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Talk to Manager
        </Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: "#2a2a2a",
          padding: 12,
          marginBottom: 10,
          borderRadius: 8
        }}
        onPress={() => navigation.navigate("Deduction")}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Deduction Board
        </Text>
      </Pressable>

      <Pressable
        style={{ marginBottom: 10 }}
        onPress={() => navigation.navigate("Board")}
      >
        <Text style={{ color: "white" }}>
          Investigation Board
        </Text>
      </Pressable>

      <FlatList
        data={unlockedEvidence}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <EvidenceCard
            evidence={item}
            onPress={() =>
              navigation.navigate("EvidenceDetail", {
                evidenceId: item.id
              })
            }
          />
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
  header: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212"
  }
})
