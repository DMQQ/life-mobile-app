import { View, Text, TouchableOpacity, ListRenderItem, StyleProp, ViewStyle, Pressable, LayoutChangeEvent, StyleSheet } from "react-native";
import Layout from "../../../constants/Layout";
import Colors from "../../../constants/Colors";
import Color from "color";
import { useState, useCallback, ReactNode, useLayoutEffect } from "react";
import Ripple from "react-native-material-ripple";
import { AntDesign, Entypo } from "@expo/vector-icons";
import Reanimated, { FadeIn, FadeInDown, FadeInUp, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { FlatList } from "react-native-gesture-handler";
import lowOpacity from "@/utils/functions/lowOpacity";
import Animated from "react-native-reanimated";

const MIN_TOP_DISTANCE = 65;

export interface Props<T> {
  options: T[];

  multiSelect?: boolean;

  closeOnSelect?: boolean;

  selected: T[];

  renderDefaultItem?: boolean;

  singleTileHeight?: number;

  containerStyle?: StyleProp<ViewStyle>;

  maxSelectHeight?: number;

  onClose?: () => void;

  setSelected: (selected: T[]) => void;

  keyExtractor?: (item: T, index: number) => string;

  transparentOverlay?: boolean;

  renderItem?: (props: { item: T; index: number }) => ListRenderItem<T>;

  placeholderText?: string;

  renderCustomSelected?: ReactNode;

  onFocusChange?: (focus: boolean) => void;

  anchor?: "top" | "bottom";
}

const backgroundColor = Color(Colors.primary).lighten(0.25).hex();

const styles = StyleSheet.create({
  list: {
    position: "absolute",
    width: Layout.screen.width * 0.95,
    borderWidth: 2,
    borderColor: Colors.secondary,
    // borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    left: -1,
    zIndex: 1,
    backgroundColor,
    padding: 5,
  },
  container: {
    width: "100%",
    backgroundColor,
    borderWidth: 2,
    borderRadius: 5,
    position: "relative",
  },
  overlay: {
    position: "absolute",
    width: Layout.screen.width,
    height: Layout.screen.height,
    zIndex: 1,
  },
});

const AnimatedGesturedFlatList = Reanimated.createAnimatedComponent(FlatList);

export default function Select({
  options = [],
  multiSelect = false,
  selected,
  setSelected,
  keyExtractor,
  renderItem,
  renderDefaultItem = true,
  singleTileHeight = 50,
  onClose,
  containerStyle,
  maxSelectHeight,
  transparentOverlay = true,
  placeholderText = "Select option",
  closeOnSelect = false,
  ...rest
}: Props<any>) {
  const [isFocused, setIsFocused] = useState(false);

  const SINGLE_TILE_HEIGHT = singleTileHeight;

  const addSelectedItem = (item: (typeof options)[0]) => {
    if (multiSelect) {
      if (selected.includes(item)) {
        setSelected(selected.filter((i) => i !== item));
      } else {
        setSelected([...selected, item]);
      }

      if (closeOnSelect) setIsFocused(false);

      return;
    }
    setSelected([item]);
    if (closeOnSelect) {
      setIsFocused(false);
    }
  };

  const ABS_LIST_HEIGHT = SINGLE_TILE_HEIGHT * options.length;

  const DefaultRenderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const isSelected = selected.includes(item);
      return (
        <Ripple
          onPress={() => addSelectedItem(item)}
          style={{
            height: ABS_LIST_HEIGHT / options.length,
            paddingHorizontal: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomColor: options.length - 1 === index ? "transparent" : Colors.secondary,
            backgroundColor: isSelected ? lowOpacity(Colors.secondary, 20) : undefined,
          }}
        >
          <Text
            style={{
              color: isSelected ? "#fff" : Colors.secondary,
              fontSize: 18,
            }}
          >
            {item}
          </Text>
          {selected.includes(item) && <AntDesign name="check" size={25} color={Colors.secondary} />}
        </Ripple>
      ) as any;
    },
    [selected, addSelectedItem]
  );

  const buttonHeight = useSharedValue<number>(0);
  const buttonWidth = useSharedValue<number>(0);

  const flatListTransformStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(buttonHeight.value, {
          duration: 100,
        }),
      },
    ],
    width: buttonWidth.value + styles.container.borderWidth * 2,
  }));

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    buttonHeight.value = nativeEvent.layout.height;
    buttonWidth.value = nativeEvent.layout.width;
  };

  const overlayColor = transparentOverlay ? "transparent" : "rgba(0,0,0,0.8)";

  useLayoutEffect(() => {
    rest.onFocusChange?.(isFocused);
  }, [isFocused]);

  const handleDismiss = () => {
    setIsFocused(false);
    onClose?.();
  };

  return (
    <>
      {isFocused && (
        <Pressable
          onPress={handleDismiss}
          style={[
            styles.overlay,
            {
              backgroundColor: overlayColor,
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.container,
          {
            zIndex: isFocused ? 1101 : 1,
            borderColor: isFocused ? Colors.secondary : Color(Colors.primary_light).lighten(0.5).hex(),
            backgroundColor: isFocused ? Colors.primary_lighter : backgroundColor,
            borderBottomRightRadius: isFocused ? 0 : 10,
            borderBottomLeftRadius: isFocused ? 0 : 10,
            borderBottomColor: isFocused ? Colors.secondary : Color(Colors.primary_light).lighten(0.5).hex(),
          },
          containerStyle,
        ]}
      >
        <TouchableOpacity
          onLayout={onLayout}
          activeOpacity={0.9}
          onPress={() => setIsFocused(!isFocused)}
          style={{
            padding: !!rest.renderCustomSelected ? 0 : 15,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 15, justifyContent: "center", flexDirection: "row" }}>
            <View>
              <Entypo
                name="chevron-down"
                color={isFocused ? Colors.secondary : "#fff"}
                size={25}
                style={{
                  transform: [{ rotate: isFocused ? "180deg" : "0deg" }],
                }}
              />
            </View>
            {!!rest.renderCustomSelected ? (
              rest.renderCustomSelected
            ) : (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 18,
                  color: isFocused ? Colors.secondary : selected.some((v) => v.trim().length > 0) ? "#fff" : "gray",
                  flex: 1,
                  paddingHorizontal: 20,
                }}
              >
                {selected.length > 0 && selected.some((v) => v.trim().length > 0) ? selected.join(", ") : placeholderText}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {isFocused && (
          <AnimatedGesturedFlatList
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={[
              styles.list,
              {
                height: maxSelectHeight || ABS_LIST_HEIGHT,
                left: -2,
                top: rest.anchor === "top" ? -1 * buttonHeight.value - (maxSelectHeight || ABS_LIST_HEIGHT) : 0,
              },
              flatListTransformStyle,
            ]}
            contentContainerStyle={{
              justifyContent: "center",
            }}
            data={options as any}
            keyExtractor={keyExtractor || ((item, index) => index.toString())}
            //@ts-ignore
            renderItem={
              renderDefaultItem
                ? DefaultRenderItem
                : (props) => <Ripple onPress={() => addSelectedItem(props.item)}>{renderItem?.(props)}</Ripple>
            }
          />
        )}
      </Animated.View>
    </>
  );
}
