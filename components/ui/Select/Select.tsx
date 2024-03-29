import {
  View,
  Text,
  TouchableOpacity,
  ListRenderItem,
  StyleProp,
  ViewStyle,
  Pressable,
  LayoutChangeEvent,
  StyleSheet,
} from "react-native";
import Layout from "../../../constants/Layout";
import Colors from "../../../constants/Colors";
import Color from "color";
import { useState, useCallback, ReactNode } from "react";
import Ripple from "react-native-material-ripple";
import { AntDesign } from "@expo/vector-icons";
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FlatList } from "react-native-gesture-handler";

const MIN_TOP_DISTANCE = 65;

interface Props<T> {
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
}

const backgroundColor = Color(Colors.primary).lighten(0.5).hex();
const selectedBackgroundColor = Color(Colors.secondary).darken(0.7).hex();

const styles = StyleSheet.create({
  list: {
    position: "absolute",
    width: Layout.screen.width * 0.95,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 5,
    left: -1,
    zIndex: 1100,
    backgroundColor,
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
    zIndex: 101,
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
    if (closeOnSelect) setIsFocused(false);
  };

  const ABS_LIST_HEIGHT = SINGLE_TILE_HEIGHT * options.length;

  const DefaultRenderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      return (
        <Ripple
          onPress={() => addSelectedItem(item)}
          style={{
            height: ABS_LIST_HEIGHT / options.length,
            paddingHorizontal: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomColor:
              options.length - 1 === index ? "transparent" : Colors.secondary,
            backgroundColor: selected.includes(item)
              ? selectedBackgroundColor
              : undefined,
          }}
        >
          <Text style={{ color: Colors.secondary, fontSize: 18 }}>{item}</Text>
          {selected.includes(item) && (
            <AntDesign name="check" size={25} color={Colors.secondary} />
          )}
        </Ripple>
      ) as any;
    },
    [selected, addSelectedItem]
  );

  const buttonHeight = useSharedValue<number>(0);

  const flatListTransformStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(buttonHeight.value + 10, {
          duration: 100,
        }),
      },
    ],
  }));

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    buttonHeight.value = nativeEvent.layout.height;
  };

  const overlayColor = transparentOverlay ? "transparent" : "rgba(0,0,0,0.8)";

  return (
    <>
      {isFocused && (
        <Pressable
          onPress={() => {
            setIsFocused(false);
            onClose?.();
          }}
          style={[
            styles.overlay,
            {
              backgroundColor: overlayColor,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.container,
          {
            zIndex: isFocused ? 1000 : 100,
            borderColor: isFocused ? Colors.secondary : Colors.primary_light,
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
          <View style={{ flex: 15, justifyContent: "center" }}>
            {!!rest.renderCustomSelected ? (
              rest.renderCustomSelected
            ) : (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 18,
                  color: isFocused ? Colors.secondary : "gray",
                }}
              >
                {selected.length > 0 ? selected.join(", ") : placeholderText}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {isFocused && (
          <AnimatedGesturedFlatList
            entering={FadeIn.duration(100)}
            exiting={FadeOut.duration(100)}
            style={[
              styles.list,
              {
                height: maxSelectHeight || ABS_LIST_HEIGHT,
              },
              flatListTransformStyle,
            ]}
            contentContainerStyle={{
              justifyContent: "center",
            }}
            data={options as any}
            keyExtractor={keyExtractor || ((item, index) => index.toString())}
            //@ts-ignore
            renderItem={renderDefaultItem ? DefaultRenderItem : renderItem}
          />
        )}
      </View>
    </>
  );
}
