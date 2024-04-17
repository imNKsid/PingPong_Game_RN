import { StyleSheet, Text, View } from "react-native";
import React from "react";

const Home = () => {
  return (
    <View>
      <View style={styles.ball} />
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
