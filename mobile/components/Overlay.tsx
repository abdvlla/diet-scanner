import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type OverlayProps = {
  toggleFlashMode: () => void;
  flashMode: boolean;
};

const { width, height } = Dimensions.get("window");

const innerDimension = 300;

const outer = rrect(rect(0, 0, width, height), 0, 0);
const inner = rrect(
  rect(
    width / 2 - innerDimension / 2,
    height / 2 - innerDimension / 2,
    innerDimension,
    innerDimension,
  ),
  50,
  50,
);

export const Overlay = ({ toggleFlashMode, flashMode }: OverlayProps) => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Canvas
        style={
          Platform.OS === "android"
            ? { flex: 1 }
            : StyleSheet.absoluteFillObject
        }
        pointerEvents="none"
      >
        <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
      </Canvas>

      <TouchableOpacity style={styles.flashButton} onPress={toggleFlashMode}>
        <View style={styles.flashButtonRow}>
          <Ionicons
            name={flashMode ? "flash" : "flash-off"}
            size={16}
            color="white"
          />
          <Text style={styles.flashButtonText}>
            {flashMode ? "Flash On" : "Flash Off"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  flashButton: {
    position: "absolute",
    top: 60,
    right: 24,
    backgroundColor: "rgba(20,20,20,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  flashButtonText: {
    color: "#FAFAF7",
    fontWeight: "600",
    fontSize: 13,
  },
  flashButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
