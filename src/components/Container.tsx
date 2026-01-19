import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  withPadding?: boolean;
}

const bgImage = require('../assets/dragonball/bg.png');

const Container = ({ children, style, withPadding = true }: ContainerProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <ImageBackground 
      source={bgImage} 
      style={[styles.container, style]}
      resizeMode="cover"
      imageStyle={{ opacity: 0.2 }} // Low opacity for subtle pattern
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0', // Fallback color
  },
});

export default Container;
