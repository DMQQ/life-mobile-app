import { useDispatch } from "react-redux";
import { useAppSelector } from "../redux/index";
import * as SecureStore from "expo-secure-store";
import { userActions } from "../redux/user/user";

export default function useUser() {
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user);

  async function loadUser() {
    const json = await SecureStore.getItemAsync("user");

    if (json) {
      const user = JSON.parse(json);

      dispatch(userActions.loadUser({ user: user.user, token: user.token }));
    }
  }

  async function removeUser() {
    await SecureStore.deleteItemAsync("user");

    dispatch(userActions.removeUser());
  }

  async function saveUser(input: { user: any; token: string }) {
    await SecureStore.setItemAsync("user", JSON.stringify(input));

    dispatch(userActions.loadUser(input));
  }

  return { ...user, loadUser, saveUser, removeUser };
}
