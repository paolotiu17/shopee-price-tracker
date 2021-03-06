import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { resendConfirmationEmail, signUp } from "utils/api";
import { apiHandler } from "utils/apiHandler";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addUser } from "slices/userSlice";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const ClipLoader = dynamic(() => import("react-spinners/ClipLoader"));

interface Fields {
  email: string;
  password: string;
}
interface Props {}

const SignupForm = ({}: Props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    all: false,
  });

  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: yup
      .string()
      .required("Required")
      .min(8, "length")
      .matches(RegExp("(.*[A-Z].*)"), "uppercase")
      .matches(RegExp("(.*\\d.*)"), "number"),
  });

  const submitHandler = async (
    values: Fields,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    const { error } = await apiHandler(signUp(values.email, values.password));

    if (error) {
      if (error.message === '"email" must be a valid email') {
        error.message = "Email is not valid";
      } else if (error.message === "Email not yet confirmed") {
        // Send to email sent page
        dispatch(addUser(values.email, [], false));
        router.push("/sent");
        resendConfirmationEmail(values.email);
        setSubmitting(false);
        return;
      }

      toast.error(error.message, {
        style: {
          margin: "100px",
        },
      });
      return;
    }

    // Set email in store
    dispatch(addUser(values.email, [], false));
    router.push("/sent");
    setSubmitting(false);
    return;
  };
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={schema}
      validate={(values) => {
        schema
          .validate(values, { abortEarly: false })
          .then(() => {
            // Passed validation
            setValidations({
              length: true,
              uppercase: true,
              number: true,
              all: true,
            });
          })
          .catch((e) => {
            const errors = e.errors as string[];

            setValidations({
              length: !errors.includes("length"),
              uppercase: !errors.includes("uppercase"),
              number: !errors.includes("number"),
              all: false,
            });
          });
      }}
      onSubmit={submitHandler}
    >
      {({ isSubmitting }) => {
        return (
          <Form>
            <div className="p-6 ">
              <div className="flex flex-col mb-2">
                <div className="relative ">
                  <Field
                    type="email"
                    name="email"
                    className="flex-1 w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-transparent border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-2 text-sm text-red-400"
                  />
                </div>
              </div>
              <div className="flex flex-col mt-4 mb-2">
                <div className="relative ">
                  <Field
                    type="password"
                    name="password"
                    autoComplete="on"
                    className="flex-1 w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-transparent border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Password"
                  />
                  <ul className="mt-4 list-disc list-inside">
                    <li
                      className={
                        validations.length
                          ? "text-green-400 dark:text-green-500"
                          : "text-red-400"
                      }
                    >
                      At least 8 characters long
                    </li>
                    <li
                      className={
                        validations.uppercase
                          ? "text-green-400 dark:text-green-500"
                          : "text-red-400"
                      }
                    >
                      At least one uppercase character
                    </li>
                    <li
                      className={
                        validations.number
                          ? "text-green-400 dark:text-green-500"
                          : "text-red-400"
                      }
                    >
                      At least one number
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex w-full mt-6 ">
                <button
                  name="Submit"
                  disabled={isSubmitting || !validations.all}
                  type="submit"
                  className="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in rounded-lg shadow-md disabled:bg-gray-300 bg-primary hover:bg-primary-dark focus:ring-primary focus:ring-offset-white focus:outline-none focus:ring-2 focus:ring-offset-2 "
                >
                  {isSubmitting ? <ClipLoader color="#f2f2f2" /> : "Sign up"}
                </button>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
export default SignupForm;
