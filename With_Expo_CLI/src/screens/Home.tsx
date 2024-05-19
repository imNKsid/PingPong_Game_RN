import { Button, Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  Easing,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

const { height, width } = Dimensions.get("window");

const FPS = 60;
const DELTA = 1000 / FPS;
const SPEED = 10; //0.3;
const BALL_WIDTH = 25;
const ISLAND_DIMENSIONS = { x: 151, y: 10, w: 128, h: 40 };
const PLAYER_DIMENSIONS = {
  w: width / 2,
  h: 40,
};

const Home = () => {
  const targetPositionX = useSharedValue(200);
  const targetPositionY = useSharedValue(200);
  const direction = useSharedValue(
    normalizeVector({ x: Math.random(), y: Math.random() })
  );
  const playerPos = useSharedValue({ x: width / 4, y: height - 100 });

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        update();
      }
    }, DELTA);

    return () => clearInterval(interval);
  }, [gameOver]);

  const update = () => {
    let nextPos = getNextPos(direction.value);
    let newDirection = direction.value;

    //Wall hit detection
    if (nextPos.y > height - BALL_WIDTH) {
      // Ball hits the bottom wall
      setGameOver(true);
    }
    if (nextPos.y < 0) {
      // Ball hits the top wall
      newDirection = { x: direction.value.x, y: -direction.value.y };
    }
    if (nextPos.x < 0 || nextPos.x > width - BALL_WIDTH) {
      // Ball hits the horizontal wall
      newDirection = { x: -direction.value.x, y: direction.value.y };
    }

    //Dynamic Island hit detection
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
        newDirection = { x: -direction.value.x, y: direction.value.y };
      } else {
        //Hitting the top/bottom
        newDirection = { x: direction.value.x, y: -direction.value.y };
      }
      setScore((prev) => prev + 1);
    }

    //Player hit detection
    if (
      nextPos.x < playerPos.value.x + PLAYER_DIMENSIONS.w &&
      nextPos.x + BALL_WIDTH > playerPos.value.x &&
      nextPos.y < playerPos.value.y + PLAYER_DIMENSIONS.h &&
      BALL_WIDTH + nextPos.y > playerPos.value.y
    ) {
      if (
        targetPositionX.value < playerPos.value.x ||
        targetPositionX.value > playerPos.value.x + PLAYER_DIMENSIONS.w
      ) {
        //Hitting from the side
        newDirection = { x: -direction.value.x, y: direction.value.y };
      } else {
        //Hitting the top/bottom
        newDirection = { x: direction.value.x, y: -direction.value.y };
      }
    }
    direction.value = newDirection;
    nextPos = getNextPos(newDirection);

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

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: (event) => {
      playerPos.value = {
        ...playerPos.value,
        x: event.absoluteX - PLAYER_DIMENSIONS.w / 2,
      };
    },
  });

  const playerAnimatedStyles = useAnimatedStyle(() => {
    return {
      left: playerPos.value.x,
    };
  });

  const islandAnimatedStyles = useAnimatedStyle(
    () => ({
      width: withSequence(
        withTiming(ISLAND_DIMENSIONS.w * 1.2, { duration: 100 }),
        withTiming(ISLAND_DIMENSIONS.w, { duration: 100 })
      ),
      height: withSequence(
        withTiming(ISLAND_DIMENSIONS.h * 1.2, { duration: 100 }),
        withTiming(ISLAND_DIMENSIONS.h, { duration: 100 })
      ),
      opacity: withSequence(
        withTiming(0, { duration: 100 }),
        withTiming(1, { duration: 100 })
      ),
    }),
    [score]
  );

  const restartGame = () => {
    targetPositionX.value = 200;
    targetPositionY.value = 200;
    setScore(0);
    setGameOver(false);
  };

  return (
    <>
      <Text style={styles.scoreStyle}>{score}</Text>
      {gameOver ? (
        <Text style={styles.gameOverStyle}>{"Game Over!"}</Text>
      ) : null}
      {gameOver ? null : (
        <Animated.View style={[styles.ball, ballAnimatedStyles]} />
      )}
      {gameOver ? (
        <>
          {/* <Text style={styles.gameOverStyle}>{"Game Over!"}</Text> */}
          <Button title="Restart" onPress={restartGame} />
        </>
      ) : null}

      {/* Dynamic Island */}
      <View style={styles.dynamicIsland} />
      <View style={styles.dynamicIslandAnimation}>
        <Animated.View
          style={[
            { borderRadius: 50, backgroundColor: "#000" },
            islandAnimatedStyles,
          ]}
        />
      </View>
      {/* Player */}
      <Animated.View
        style={[
          styles.player,
          { top: playerPos.value.y, left: playerPos.value.x },
          playerAnimatedStyles,
        ]}
      />
      {/* Gesture Area */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={{
            width: "100%",
            height: 100,
            // backgroundColor: "red",
            position: "absolute",
            bottom: 0,
          }}
        />
      </PanGestureHandler>
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
  dynamicIslandAnimation: {
    position: "absolute",
    top: 0,
    width: ISLAND_DIMENSIONS.w + 50,
    height: ISLAND_DIMENSIONS.h + 20,
    alignItems: "center",
    justifyContent: "center",
  },
  player: {
    height: PLAYER_DIMENSIONS.h,
    width: PLAYER_DIMENSIONS.w,
    backgroundColor: "#000",
    position: "absolute",
    borderRadius: 20,
  },
  scoreStyle: {
    fontSize: 120,
    fontWeight: "500",
    position: "absolute",
    top: 300,
    color: "lightgray",
  },
  gameOverStyle: {
    fontSize: 50,
    fontWeight: "500",
    position: "absolute",
    top: 230,
    color: "red",
  },
});

export default Home;
