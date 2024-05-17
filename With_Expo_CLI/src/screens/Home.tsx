import { StyleSheet, View, useWindowDimensions } from "react-native";
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
const ISLAND_DIMENSIONS = { x: 151, y: 10, w: 128, h: 40 };

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

    if (
      nextPos.x < ISLAND_DIMENSIONS.x + ISLAND_DIMENSIONS.w &&
      nextPos.x + BALL_WIDTH > ISLAND_DIMENSIONS.x &&
      nextPos.y < ISLAND_DIMENSIONS.y + ISLAND_DIMENSIONS.h &&
      BALL_WIDTH + nextPos.y > ISLAND_DIMENSIONS.y
    ) {
      if (
        targetPositionX.value < ISLAND_DIMENSIONS.x ||
        targetPositionX.value > ISLAND_DIMENSIONS.x + ISLAND_DIMENSIONS.w
      ) {
        //Hitting from the side
        const newDirection = { x: -direction.value.x, y: direction.value.y };
        direction.value = newDirection;
        nextPos = getNextPos(newDirection);
      } else {
        //Hitting the top/bottom
        const newDirection = { x: direction.value.x, y: -direction.value.y };
        direction.value = newDirection;
        nextPos = getNextPos(newDirection);
      }
    } else {
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
      <View style={styles.dynamicIsland} />
    </>
  );
};

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
  dynamicIsland: {
    height: ISLAND_DIMENSIONS.h,
    width: ISLAND_DIMENSIONS.w,
    backgroundColor: "#000",
    position: "absolute",
    top: ISLAND_DIMENSIONS.y,
    left: ISLAND_DIMENSIONS.x,
    borderRadius: 20,
  },
});

export default Home;
