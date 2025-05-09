import ScreenContainer from "@/components/ui/ScreenContainer";

import IconPickerComponent from "../components/IconPicker";
import { useState } from "react";

export default function IconPicker({ route, navigation }: any) {
  const [icon, setIcon] = useState(route.params.selectedIcon);

  const onChange = (icon: string) => {
    route.params.onSelectIcon(icon);

    setIcon(icon);

    navigation.goBack();
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <IconPickerComponent value={icon} onChange={onChange} />
    </ScreenContainer>
  );
}
