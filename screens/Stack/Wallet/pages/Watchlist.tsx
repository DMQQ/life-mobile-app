import { StyleSheet, Text, View, VirtualizedList } from "react-native";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import Colors from "../../../../constants/Colors";
import { useFormik } from "formik";
import ValidatedInput from "@/components/ui/ValidatedInput";
import Ripple from "react-native-material-ripple";
import { AntDesign } from "@expo/vector-icons";
import Button from "@/components/ui/Button/Button";
import { useState } from "react";
import SheetModal from "@/components/ui/SheetModal/SheetModal";
import Input from "@/components/ui/TextInput/TextInput";
import * as yup from "yup";
import Layout from "@/constants/Layout";

interface ProductsProps {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const styles = StyleSheet.create({
  contentContainerStyle: {
    backgroundColor: Colors.primary_dark,
    padding: 15,
    borderRadius: 15,
  },

  heading: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
    paddingVertical: 5,
  },

  listItem: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: Colors.primary_light,
    marginBottom: 15,
  },

  listItemHeading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  listItemRowContainer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  listItemPrice: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
  },

  listItemButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary_dark,
    borderRadius: 100,
    padding: 10,
  },

  listItemButton: {
    padding: 5,
    backgroundColor: Colors.secondary,
    borderRadius: 100,
  },

  listItemQuantity: { color: "#fff", paddingHorizontal: 15, fontSize: 17 },
});

const ShoppingForm = (props: { onSubmit: (vals: any) => void }) => {
  const [products, setProducts] = useState<ProductsProps[]>([]);

  const handleItemQuantity = (
    itemId: number,
    action: "decrement" | "increment"
  ) => {
    if (action === "increment") {
      setProducts((values) =>
        values.map((product) =>
          product.id === itemId
            ? {
                ...product,
                quantity: product.quantity + 1,
              }
            : product
        )
      );
    } else {
      const product = products.find((product) => product.id === itemId);
      if (product === undefined) return;
      const finalProductValue = product.quantity - 1;
      setProducts((values) =>
        finalProductValue > 0
          ? values.map((prod) =>
              prod.id === itemId
                ? {
                    ...prod,
                    quantity: +prod.quantity - 1,
                  }
                : prod
            )
          : values.filter((prod) => prod.id !== itemId)
      );
    }
  };

  const [isVisble, setIsVisible] = useState(false);

  const handleOpenModal = () => setIsVisible((p) => !p);

  const ListHeaderComponent = () => (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={styles.heading}>List of products</Text>

      <Button
        onPress={handleOpenModal}
        size="xs"
        fontStyle={{
          fontSize: 15,
          color: Colors.secondary,
          textTransform: "none",
        }}
        type="text"
      >
        Add product
      </Button>
    </View>
  );

  const ListFooterComponent = () => (
    <View>
      <Text style={{ color: "#fff", padding: 5, fontWeight: "bold" }}>
        total of {totalExpense}zł
      </Text>
      <Button>Save expenses</Button>
    </View>
  );

  const totalExpense = products.reduce((a, b) => a + b.price * b.quantity, 0);

  return (
    <View style={{ marginTop: 15, flex: 1 }}>
      <Input
        label="How would you like to name it?"
        name="shop"
        value=""
        setValue={() => {}}
      />

      <VirtualizedList
        style={{ marginTop: 15, flex: 1 }}
        contentContainerStyle={styles.contentContainerStyle}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={products.length > 0 ? ListFooterComponent : null}
        data={products}
        keyExtractor={(item) => item.id.toString()}
        getItem={(list, index) => list[index] as ProductsProps}
        getItemCount={(arr) => arr.length}
        renderItem={({ item }: { item: ProductsProps }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemHeading}>{item.name}</Text>
            <View style={styles.listItemRowContainer}>
              <Text style={styles.listItemPrice}>
                {(item.price * item.quantity).toFixed(2)}zł{" "}
                <Text style={{ fontSize: 12 }}>({item.price}zł)</Text>
              </Text>

              <View style={styles.listItemButtonContainer}>
                <Ripple
                  style={styles.listItemButton}
                  onPress={() => handleItemQuantity(item.id, "increment")}
                >
                  <AntDesign name="plus" color={"#fff"} size={16} />
                </Ripple>

                <Text style={styles.listItemQuantity}>{item.quantity}</Text>

                <Ripple
                  style={styles.listItemButton}
                  onPress={() => handleItemQuantity(item.id, "decrement")}
                >
                  <AntDesign name="minus" color="#fff" size={16} />
                </Ripple>
              </View>
            </View>
          </View>
        )}
      />

      <ModalForm
        visible={isVisble}
        onDismiss={() => setIsVisible(false)}
        onSubmit={(product) => {
          setProducts((prev) => [...prev, product]);
          setIsVisible(false);
        }}
      />
    </View>
  );
};

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  price: yup.number().positive().required(),
  quantity: yup.number().positive().required(),
});

const ModalForm = (props: {
  onSubmit: (product: ProductsProps) => void;
  onDismiss: () => void;
  visible: boolean;
}) => {
  const formik = useFormik({
    initialValues: {
      name: "",
      price: 0,
      quantity: 1,
    },

    validationSchema,

    onSubmit: (values, f) => {
      props.onSubmit({
        ...values,
        id: Date.now(),
        price: +values.price,
      });
      f.resetForm();
    },
  });

  return (
    <SheetModal
      dismiss={props.onDismiss}
      visible={props.visible}
      title="Create Expense"
    >
      <View style={{ padding: 5 }}>
        <ValidatedInput
          formik={formik}
          name="name"
          showLabel
          label="Expenses' name"
        />

        <ValidatedInput
          keyboardType="number-pad"
          formik={formik}
          name="price"
          showLabel
          label="Single product price"
        />

        <ValidatedInput
          formik={formik}
          left={(props) => (
            <Ripple
              onPress={() =>
                formik.setValues((vals) => ({
                  ...vals,
                  quantity: vals.quantity + 1,
                }))
              }
            >
              <ValidatedInput.Icon Icon="AntDesign" name="plus" {...props} />
            </Ripple>
          )}
          right={(props) => (
            <Ripple
              onPress={() =>
                formik.setValues((vals) => ({
                  ...vals,
                  quantity: vals.quantity - 1,
                }))
              }
            >
              <ValidatedInput.Icon Icon="AntDesign" name="minus" {...props} />
            </Ripple>
          )}
          textAlign="center"
          name="quantity"
          showLabel
          label="Quantity"
        />

        <Button
          disabled={!(formik.isValid && formik.dirty)}
          onPress={() => formik.handleSubmit()}
          style={{ marginTop: 15 }}
          size="xl"
        >
          Save
        </Button>
      </View>
    </SheetModal>
  );
};

export default function Watchlist() {
  return (
    <ScreenContainer style={{ padding: 15 }}>
      <ShoppingForm onSubmit={() => {}} />
    </ScreenContainer>
  );
}
