import ScreenContainer from "@/components/ui/ScreenContainer";

import IconPickerComponent from "../components/IconPicker";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

export default function IconPicker() {
  const { selectedIcon, onSelectIcon } = useLocalSearchParams<{ selectedIcon: string; onSelectIcon: any }>();
  const [icon, setIcon] = useState(selectedIcon);

  const onChange = (icon: string) => {
    onSelectIcon(icon);

    setIcon(icon);

    router.back();
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <IconPickerComponent value={icon} onChange={onChange} />
    </ScreenContainer>
  );
}
