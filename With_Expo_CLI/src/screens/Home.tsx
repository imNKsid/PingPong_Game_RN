import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const Home = () => {
  const targetPositionX = useSharedValue(0);
  const targetPositionY = useSharedValue(0);

  const ballAnimatedStyles = useAnimatedStyle(() => {
    return {
      top: targetPositionY.value,
      left: targetPositionX.value,
    };
  });

  return (
    <View>
      <Animated.View style={[styles.ball, ballAnimatedStyles]} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  ball: {
    backgroundColor: "#000",
    width: 25,
    aspectRatio: 1,
    borderRadius: 25,
    position: "absolute",
  },
});
