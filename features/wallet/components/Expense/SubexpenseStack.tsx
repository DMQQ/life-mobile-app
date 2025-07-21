import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { Layout, useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import WalletItem from "../Wallet/WalletItem";
import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";

const springConfig = {
  damping: 13,
  mass: 0.8,
  stiffness: 100,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

interface SubExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  [key: string]: any;
}

interface Selected {
  subexpenses: SubExpense[];
  [key: string]: any;
}

interface SubexpenseStackProps {
  selected: Selected;
  handleDeleteSubExpense: (id: string) => void;
}

interface NotificationItemProps {
  item: SubExpense;
  selected: Selected;
  index: number;
  isExpanded: boolean;
  totalCount: number;
  onDelete: () => void;

  expand: () => void;
}

const SubexpenseStack: React.FC<SubexpenseStackProps> = ({ selected, handleDeleteSubExpense }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = (): void => {
    setIsExpanded((prev) => !prev);
  };

  const subexpenses = selected?.subexpenses || [];

  const containerHeight = useSharedValue<number>(Math.min(2, subexpenses.length) * 20 + 60);

  useEffect(() => {
    containerHeight.value = withSpring(
      isExpanded ? Math.min(subexpenses.length, 10) * 82 : Math.min(2, subexpenses.length) * 20 + 60,
      springConfig
    );
  }, [isExpanded, subexpenses.length, containerHeight]);

  const containerStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
    marginBottom: 10,
    overflow: "visible",
    zIndex: 1,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sub expenses ({subexpenses.length})</Text>

        <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
          <Text style={styles.expandButtonText}>{isExpanded ? "Collapse" : "Expand"}</Text>
          <AntDesign name={isExpanded ? "up" : "down"} size={12} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <Animated.View style={containerStyle} layout={Layout.springify()}>
        {subexpenses.map((item, index) => (
          <NotificationItem
            expand={toggleExpand}
            key={item.id}
            item={item}
            selected={selected}
            index={index}
            isExpanded={isExpanded}
            totalCount={subexpenses.length}
            onDelete={() => handleDeleteSubExpense(item.id)}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const NotificationItem: React.FC<NotificationItemProps> = ({ item, selected, index, isExpanded, totalCount, onDelete, expand }) => {
  const translateY = useSharedValue<number>(isExpanded ? index * 82 : index * 20);

  const scale = useSharedValue<number>(isExpanded ? 1 : 1 - index * 0.05);

  const opacity = useSharedValue<number>(isExpanded ? 1 : Math.max(0.7, 1 - index * 0.1));

  const zIndex = totalCount - index;

  useEffect(() => {
    translateY.value = withSpring(isExpanded ? index * 82 : index * 20, springConfig);

    scale.value = withSpring(isExpanded ? 1 : 1 - index * 0.05, springConfig);

    opacity.value = withSpring(isExpanded ? 1 : Math.max(0.7, 1 - index * 0.1), springConfig);
  }, [isExpanded, index, translateY, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!isExpanded && index > 2) {
      return {
        opacity: 0,
        position: "absolute",
        width: "100%",
        top: 0,
        transform: [{ translateY: translateY.value }],
        zIndex,
        pointerEvents: "none" as const,
      };
    }

    return {
      position: "absolute" as const,
      width: "100%",
      top: 0,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: opacity.value,
      zIndex,
    };
  });

  return (
    <Animated.View style={animatedStyle} layout={Layout.springify()}>
      <WalletItem
        {...selected}
        {...(item as any)}
        handlePress={isExpanded ? onDelete : expand}
        subexpenses={[]}
        files={[]}
        containerStyle={{
          backgroundColor: Colors.primary_light,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
          borderRadius: 12,
          height: 70,
        }}
      />
    </Animated.View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    zIndex: 2,
  },
  title: {
    color: Colors.foreground,
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 27.5,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary_light,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 5,
  },
  expandButtonText: {
    color: "rgba(255,255,255,0.7)",
    marginRight: 5,
  },
  countBadge: {
    position: "absolute",
    top: 10,
    right: 15,
    backgroundColor: Colors.secondary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  countBadgeText: {
    color: Colors.foreground,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default SubexpenseStack;
