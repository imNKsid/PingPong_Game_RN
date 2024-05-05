import { StyleSheet, useWindowDimensions } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const FPS = 60;
const DELTA = 1000 / FPS;
const SPEED = 30; //0.3;

const Home = () => {
  const targetPositionX = useSharedValue(200);
  const targetPositionY = useSharedValue(200);
  const direction = useSharedValue(
    normalizeVector({ x: Math.random(), y: Math.random() })
  );

  const { height, width } = useWindowDimensions();

  useEffect(() => {
    const interval = setInterval(update, DELTA);

    return () => clearInterval(interval);
  }, []);

  const update = () => {
    const nextX = targetPositionX.value + direction.value.x * SPEED;
    const nextY = targetPositionY.value + direction.value.y * SPEED;

    if (nextY < 0 || nextY > height) {
      console.log("Ball hits the vertical wall");
      direction.value = { x: direction.value.x, y: -direction.value.y };
    }
    if (nextX < 0 || nextX > width) {
      console.log("Ball hits the horizontal wall");
      direction.value = { x: -direction.value.x, y: direction.value.y };
    }

    targetPositionX.value = withTiming(
      targetPositionX.value + direction.value.x * SPEED,
      {
        duration: DELTA,
        easing: Easing.linear,
      }
    );
    targetPositionY.value = withTiming(
      targetPositionY.value + direction.value.y * SPEED,
      {
        duration: DELTA,
        easing: Easing.linear,
      }
    );
  };

  const ballAnimatedStyles = useAnimatedStyle(() => {
    return {
      top: targetPositionY.value,
      left: targetPositionX.value,
    };
  });

  return (
    <>
      <Animated.View style={[styles.ball, ballAnimatedStyles]} />
    </>
  );
};

export default Home;

const normalizeVector = (vector) => {
  console.log("vector =>", vector);
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  console.log("magnitude =>", magnitude);
  console.log("direction =>", {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  });
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
};

const styles = StyleSheet.create({
  ball: {
    backgroundColor: "#000",
    width: 25,
    aspectRatio: 1,
    borderRadius: 25,
    position: "absolute",
  },
});
