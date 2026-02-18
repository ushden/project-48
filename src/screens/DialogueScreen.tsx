import {useState} from "react"
import {Pressable, StyleSheet, Text, View} from "react-native"
import {useCaseStore} from "../store/caseStore"

export default function DialogueScreen() {

  const caseData = useCaseStore(s => s.case)
  const unlockEvidence = useCaseStore(s => s.unlockEvidence)

  const dialogue = caseData?.dialogues[0]

  const [index, setIndex] = useState(0)

  if (!dialogue) {
    return (
      <View style={styles.center}>
        <Text style={{color: "white"}}>No dialogue</Text>
      </View>
    )
  }

  const line = dialogue.lines[index]

  const nextLine = () => {

    // unlock evidence if defined
    line.unlocks?.forEach(unlockEvidence)

    if (index < dialogue.lines.length - 1) {
      setIndex(index + 1)
    }
  }

  return (
    <View style={styles.container}>

      <Text style={styles.npc}>
        {dialogue.npc}
      </Text>

      <Text style={styles.text}>
        {line.text}
      </Text>

      <Pressable style={styles.button} onPress={nextLine}>
        <Text style={styles.buttonText}>
          {index < dialogue.lines.length - 1
            ? "Continue"
            : "End Dialogue"}
        </Text>
      </Pressable>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#121212"
  },
  npc: {
    color: "#aaa",
    fontSize: 14
  },
  text: {
    color: "white",
    fontSize: 18,
    marginVertical: 20
  },
  button: {
    backgroundColor: "#2a2a2a",
    padding: 14,
    borderRadius: 8
  },
  buttonText: {
    color: "white",
    textAlign: "center"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212"
  }
})
