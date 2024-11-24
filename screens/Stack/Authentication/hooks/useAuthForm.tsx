import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import * as yup from "yup";
import { useState } from "react";

const LOGIN_USER_MUTATION = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginAccount(account: { email: $email, password: $password }) {
      token
      email
      id
    }
  }
`;

const SIGNUP_USER_MUTATION = gql`
  mutation createUser($email: String!, $password: String!) {
    createAccount(account: { email: $email, password: $password }) {
      token
      email
      id
    }
  }
`;

export const validationSchema = (variant: string) =>
  yup.object().shape({
    email: yup.string().email("Email must contain @").required("Email is required").trim(),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required").trim(),

    ...(variant === "register" && {
      confirm_password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required")
        .trim()
        .oneOf([yup.ref("password"), null], "Passwords must match"),
    }),
  });

export default function useAuthForm(variant: "login" | "register") {
  const { saveUser } = useUser();

  const schema = variant === "login" ? LOGIN_USER_MUTATION : SIGNUP_USER_MUTATION;

  const [error, setError] = useState({
    statusCode: 0,
    message: "",
    error: "",
  });

  const [onSubmit, state] = useMutation(schema, {
    onCompleted: async (response) => {
      const result = response[variant === "login" ? "loginAccount" : "createAccount"];

      await saveUser({
        token: result.token,
        user: {
          id: result.id,
          email: result.email,
        },
      });
    },
    onError: (error: any) => {
      setError({
        message: error.graphQLErrors[0].message,
        statusCode: error.graphQLErrors[0]?.extensions?.response?.statusCode || 400,
        error: "Authentication failed",
      });
    },
  });

  // for retrying
  const [credentials, setCredentails] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (variables: { email: string; password: string }) => {
    setCredentails({
      email: variables.email.trim(),
      password: variables.password.trim(),
    });
    return await onSubmit({
      variables: {
        email: variables.email.trim(),
        password: variables.password.trim(),
      },
    });
  };

  return {
    onSubmit: handleSubmit,
    state,
    validationSchema: validationSchema(variant),
    error,
    savedCredentials: credentials,
  };
}
