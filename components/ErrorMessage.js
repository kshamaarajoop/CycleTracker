import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ErrorMessage = ({ message }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE4E1',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  text: {
    color: '#FF0000',
    textAlign: 'center',
  },
});

export default ErrorMessage;