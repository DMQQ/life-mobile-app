import { withSpring, WithSpringConfig } from 'react-native-reanimated';

export const springConfig: WithSpringConfig = {
  damping: 20,
  stiffness: 300,
  mass: 1,
  overshootClamping: false,
};

export const lessBouncySpring = (value: number) => withSpring(value, springConfig);