import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { LineChart as LineChartGifted } from "react-native-gifted-charts";

interface LineChartProps {
  onPress: (dt: { label: string; value: number; color: string }) => void;
  data: { label: string; value: number; color: string }[];
}
export default function LineChart(props: LineChartProps) {
  return (
    <LineChartGifted width={Layout.screen.width} height={300} data={props.data || []} color={Colors.foreground} thickness={3} dataPointsColor="blue" />
  );
}
