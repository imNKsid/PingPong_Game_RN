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
const SPEED = 10; //0.3;
const BALL_WIDTH = 25;

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
    let nextPos = getNextPos(direction.value);

    if (nextPos.y < 0 || nextPos.y > height - BALL_WIDTH) {
      // Ball hits the vertical wall
      const newDirection = { x: direction.value.x, y: -direction.value.y };
      direction.value = newDirection;
      nextPos = getNextPos(newDirection);
    }
    if (nextPos.x < 0 || nextPos.x > width - BALL_WIDTH) {
      // Ball hits the horizontal wall
      const newDirection = { x: -direction.value.x, y: direction.value.y };
      direction.value = newDirection;
      nextPos = getNextPos(newDirection);
    }

    targetPositionX.value = withTiming(nextPos.x, {
      duration: DELTA,
      easing: Easing.linear,
    });
    targetPositionY.value = withTiming(nextPos.y, {
      duration: DELTA,
      easing: Easing.linear,
    });
  };

  const getNextPos = (dir: { x: any; y: any }) => {
    return {
      x: targetPositionX.value + dir.x * SPEED,
      y: targetPositionY.value + dir.y * SPEED,
    };
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
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
};

const styles = StyleSheet.create({
  ball: {
    backgroundColor: "#000",
    width: BALL_WIDTH,
    aspectRatio: 1,
    borderRadius: 25,
    position: "absolute",
  },
});
