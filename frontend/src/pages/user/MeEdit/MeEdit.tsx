import { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import * as yup from "yup";
import { UploadButton } from "components/fields/UploadButton";
import { UploadZone } from "components/fields/UploadZone";
import { roleFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { MutationUpdateMyRoleArgs, Role } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Label } from "components/fields/Label";
import { FormInputGroup, Input } from "components/fields/Input";
import { Button } from "components/fields/Button";
import { useAppDispatch } from "store";
import { PhotoAddIcon } from "components/assets/PhotoAddIcon";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { ExclamationIcon } from "@heroicons/react/solid";
import { FCWithFragments } from "types";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { EmailChangeForm } from "./EmailChangeForm";
import {
  toCalendarItem,
  transformToTime,
  WeeklyCalendarItem,
  WeeklySchedule,
} from "components/WeeklySchedule";
import { useNavConfirmation } from "hooks/useNavConfirmation";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { RoleEmailPreferenceForm } from "./RoleEmailPreferenceForm";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { urlResolver } from "utils/navigation";
import { getRoleWorkWeekHours } from "../helper";
import { plural } from "utils/string";
import { round } from "lodash";
import { RoleStartReminderPreferenceForm } from "./RoleStartReminderPreferenceForm";
import { RoleAutoResumePreferenceForm } from "./RoleAutoResumePreferenceForm";
import { QueryReturnValue } from "types/queryTypes";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: roleFormFields.name,
    description: roleFormFields.description.nullable(),
    timeZone: roleFormFields.timeZone,
    avatarUrl: roleFormFields.avatarUrl,
    coverUrl: roleFormFields.coverUrl,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const MeEdit: FCWithFragments = () => {
  const history = useHistory();
  const [workTimes, setWorkTimes] = useState<WeeklyCalendarItem[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | null | undefined>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>("");
  const isAdmin = useSelector(isAdminLevel);
  const { orgId } = useParams<{ orgId: string }>();
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });
  const { reset, control } = formMethods;
  usePageTitle("Edit Profile");

  const {
    isConfirmNavVisible,
    onNavAccept,
    onNavCancel,
    activateNavConfirmation,
  } = useNavConfirmation(false);

  useEffect(() => {
    activateNavConfirmation(formMethods.formState.isDirty);
  }, [formMethods.formState.isDirty, activateNavConfirmation]);

  const { loading, data } = useQuery<QueryReturnValue["me"]>(GET_ME, {
    onCompleted: (data) => {
      const { role } = data.me;
      if (role) {
        const { workWeek } = role;
        reset(role);
        setCoverUrl(role.coverUrl);
        setAvatarUrl(role.avatarUrl);
        setWorkTimes([
          ...workWeek["monday"].map((i) => toCalendarItem("monday", i)),
          ...workWeek["tuesday"].map((i) => toCalendarItem("tuesday", i)),
          ...workWeek["wednesday"].map((i) => toCalendarItem("wednesday", i)),
          ...workWeek["thursday"].map((i) => toCalendarItem("thursday", i)),
          ...workWeek["friday"].map((i) => toCalendarItem("friday", i)),
          ...workWeek["saturday"].map((i) => toCalendarItem("saturday", i)),
          ...workWeek["sunday"].map((i) => toCalendarItem("sunday", i)),
        ]);
      }
    },
  });

  const dispatch = useAppDispatch();

  const formTimeZone = useWatch({ control, name: "timeZone" });

  const [updateMe] = useBlockingMutation<
    { updateMe: Role },
    MutationUpdateMyRoleArgs
  >(UPDATE_MY_ROLE_MUTATION, {
    onError: onGraphQLError({ title: "Could not update role" }),
    onCompleted: onMutationComplete({
      title: "Role has been updated",
      callback: ({ updateMe }) => {
        dispatch({ type: "SET_ME_ROLE", payload: updateMe });
      },
    }),
  });

  const clearCover = () => {
    setCoverUrl(null);
    formMethods.setValue("coverUrl", null, { shouldDirty: true });
  };

  const clearAvatar = () => {
    setAvatarUrl(null);
    formMethods.setValue("avatarUrl", null, { shouldDirty: true });
  };

  if (loading) {
    return null;
  }

  if (!data) {
    return null;
  }

  const { role, user } = data.me;

  if (!role || !user) {
    return null;
  }

  const onSubmit = (formData: FormSchema) => {
    if (role) {
      updateMe({ variables: { input: formData } });
    }
  };

  const renderTimeZoneDescription = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone !== formTimeZone) {
      return (
        <span>
          <ExclamationIcon className="mr-1 inline h-5 w-5 text-orange-400" />
          Change to
          <button
            type="button"
            onClick={() =>
              formMethods.setValue("timeZone", timeZone, { shouldDirty: true })
            }
            className="ml-1 cursor-pointer font-semibold text-brand-600 hover:underline"
          >
            {timeZone.replace("_", " ")}
          </button>
        </span>
      );
    }

    return null;
  };

  const renderItemDetails = (item: WeeklyCalendarItem) => (
    <div className="w-40 rounded-md border bg-white px-4 py-2 text-sm text-gray-600 shadow-lg">
      <p className="pb-2 text-center font-semibold capitalize">
        {item.dayOfTheWeek}
      </p>
      <p>
        from
        <span className="ml-2 font-semibold">
          {transformToTime(item.startTime)}
        </span>
      </p>
      <p>
        until
        <span className="ml-2 font-semibold">
          {transformToTime(item.stopTime)}
        </span>
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <WarningConfirm
        title="Discard Profile Changes"
        description={
          "Are you sure you wish to discard the changes you made " +
          "to your profile? Once discarded changes are permanently lost."
        }
        onClose={onNavCancel}
        cta="Yes, discard changes"
        onConfirm={onNavAccept}
        visible={isConfirmNavVisible}
      />
      <div className="pt-4 sm:mb-8 md:py-4">
        <div className="space-y-6 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-2 md:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Your Profile
              </h3>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                This information will be visible by other members of the team so
                be careful what you share.
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <FormProvider {...formMethods}>
              <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                <div className="bg-white shadow sm:overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:p-6">
                    <div>
                      <Label htmlFor="name" className="mb-1">
                        Name
                      </Label>
                      <FormInputGroup name="name" placeholder="e.g. John Doe" />
                    </div>
                    <div className="mt-6 grid grid-cols-4 gap-6">
                      <div className="col-span-4 sm:col-span-2">
                        <Label htmlFor="email" className="mb-1" readOnly>
                          Email Address
                        </Label>
                        <Input
                          type="text"
                          readOnly
                          value={user.email}
                          placeholder="e.g. john.doe@company.com"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Label htmlFor="timeZone" className="mb-1" readOnly>
                          Time zone
                        </Label>
                        <FormInputGroup
                          type="text"
                          name="timeZone"
                          readOnly
                          description={renderTimeZoneDescription()}
                        />
                      </div>
                    </div>

                    {/* <div className="mt-6">
                      <Label htmlFor="description" className="mb-1">
                        Role Description
                      </Label>
                      <FormTextareaGroup
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="Brief description for your role inside the company."
                        description="URLs are hyperlinked."
                      />
                    </div> */}

                    <div className="mt-6">
                      <Label htmlFor="photo" className="mb-1">
                        Photo
                      </Label>
                      <div className="mt-2 flex items-center">
                        <span className="inline-block h-20 w-20 overflow-hidden rounded-md border bg-gray-100">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              className="h-full w-full object-cover"
                              alt=""
                            />
                          ) : null}
                        </span>
                        <span className="ml-5">
                          <UploadButton
                            onUpload={setAvatarUrl}
                            name="avatarUrl"
                            className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 font-title text-sm font-medium leading-4 text-gray-700 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:outline-none focus:ring active:bg-gray-50 active:text-gray-800"
                            accept="image/*"
                            label="Change"
                            category="user"
                          />
                        </span>
                        {avatarUrl ? (
                          <span className="ml-2">
                            <Button
                              type="button"
                              btnType="secondaryWhite"
                              onClick={clearAvatar}
                            >
                              Remove Avatar
                            </Button>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6">
                      <Label htmlFor="cover_photo" className="mb-1">
                        Cover photo
                      </Label>
                      <div className="mt-2">
                        {coverUrl ? (
                          <div className="relative">
                            <img
                              src={coverUrl}
                              className="h-36 w-full overflow-hidden rounded-lg object-cover"
                              alt="profile cover"
                            />
                            <div
                              onClick={clearCover}
                              className="absolute inset-0 flex animate-pulse-once cursor-pointer items-center justify-center bg-white text-lg opacity-0 transition-all duration-200 hover:opacity-75"
                            >
                              Click to change your profile cover
                            </div>
                          </div>
                        ) : null}
                        <UploadZone
                          onUpload={setCoverUrl}
                          name="coverUrl"
                          className="mt-2 flex h-36 items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 "
                          accept="image/*"
                          info="PNG, JPG, GIF up to 10MB"
                          icon={
                            <PhotoAddIcon className="mx-auto h-12 w-12 text-gray-400" />
                          }
                          isVisible={Boolean(coverUrl)}
                          category="user"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end px-4 py-3 text-right sm:px-6">
                    <Button
                      type="button"
                      btnType="secondaryWhite"
                      className="mr-2"
                      onClick={() => history.goBack()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" btnType="primary">
                      Update Profile
                    </Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>

          <div className="mt-4 md:col-span-1">
            <div className="px-4 sm:px-2 md:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Your Preferences
              </h3>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Customize your personal experience with Orcha
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-4 md:col-span-2 md:mt-0">
            <div className="shadow sm:overflow-hidden sm:rounded-md">
              <div className="divide-y bg-white p-2 sm:px-6">
                <RoleEmailPreferenceForm role={role} />
                <RoleStartReminderPreferenceForm role={role} />
                <RoleAutoResumePreferenceForm role={role} />
              </div>
            </div>
          </div>

          <div className="mt-4 md:col-span-1">
            <div className="px-4 sm:px-2 md:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Your Work Schedule
              </h3>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                This is your weekly schedule hours. It is set in your currently
                set timezone ({role.timeZone})
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-4 md:col-span-2 md:mt-0">
            <div className="shadow sm:overflow-hidden sm:rounded-md">
              <div className="bg-white px-4 py-5 sm:p-6">
                <div className="flex flex-row justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-700">
                    {plural(
                      "{} Hour / Week",
                      "{} Hours / Week",
                      round(getRoleWorkWeekHours(role))
                    )}
                  </h3>
                  <div className="text-base text-gray-500">
                    {isAdmin ? (
                      <div>
                        Modify this schedule in
                        <Link
                          className="mx-1 font-medium text-brand-600 hover:underline"
                          to={urlResolver.role.edit(orgId, role.id)}
                        >
                          the admin
                        </Link>
                      </div>
                    ) : (
                      <div>Schedule modification requires admin level</div>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <WeeklySchedule
                    timeZone={role.timeZone}
                    height={600}
                    workTimes={workTimes}
                    viewItem={renderItemDetails}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 md:col-span-1">
            <div className="px-4 sm:px-2 md:px-0">
              <h3 className="text-lg font-medium leading-6 text-orange-700">
                Authentication
              </h3>
              <p className="mt-1 text-base leading-5 text-orange-600">
                In this section you may change your password and email address.
                Changes made in this section may{" "}
                <span className="font-semibold">
                  prevent you from accessing your account irrevocably
                </span>
                .
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-4 md:col-span-2 md:mt-0">
            <div className="border-2 border-yellow-500 shadow sm:overflow-hidden sm:rounded-md">
              <div className="bg-yellow-50 px-4 py-5 sm:p-6">
                <h2 className="mb-2 text-xl font-medium text-yellow-700">
                  Change Your Password
                </h2>
                <p className="mb-6 text-sm leading-6 text-yellow-700">
                  Please note that changing your password will not disconnect
                  you or any other device already connected to this account.
                </p>
                <PasswordChangeForm />
              </div>
            </div>
            <div className="border-2 border-red-500 shadow sm:overflow-hidden sm:rounded-md">
              <div className="bg-red-50 px-4 py-5 sm:p-6">
                <h2 className="mb-4 space-x-1 text-xl font-medium text-red-700">
                  <ExclamationIcon className="relative -mt-1 mr-1 inline h-6 w-6 text-red-500" />
                  DANGER ZONE
                  <ExclamationIcon className="relative -mt-1 ml-1 inline h-6 w-6 text-red-500" />
                  : Change Your Email
                </h2>
                <p className="mb-6 text-sm leading-6 text-red-700">
                  Warning: this can potentially revoke all access to this
                  account. Make sure you have access to the email you submit.
                  For added safety,{" "}
                  <span className="font-semibold">
                    we highly recommend you to use the copy-paste functionality
                  </span>{" "}
                  instead of typing your new email in the form below.
                </p>
                <EmailChangeForm user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MeEdit.fragments = {
  MeRoleFragments: gql`
    fragment MeRoleFragments on Role {
      id
      name
      description
      timeZone
      avatarUrl
      coverUrl
      createdAt
      roleEmail {
        id
        ...roleEmailPreferenceFormFragment
      }
      roleStartReminder {
        id
        ...roleStartReminderPreferenceFormFragment
      }
      roleAutoResume {
        id
        ...RoleAutoResumePreferenceFormFragment
      }
      workWeek {
        monday {
          startTime
          stopTime
        }
        tuesday {
          startTime
          stopTime
        }
        wednesday {
          startTime
          stopTime
        }
        thursday {
          startTime
          stopTime
        }
        friday {
          startTime
          stopTime
        }
        saturday {
          startTime
          stopTime
        }
        sunday {
          startTime
          stopTime
        }
      }
    }
    ${RoleEmailPreferenceForm.fragments.roleEmailPreferenceFormFragment}
    ${RoleStartReminderPreferenceForm.fragments
      .roleStartReminderPreferenceFormFragment}
    ${RoleAutoResumePreferenceForm.fragments
      .RoleAutoResumePreferenceFormFragment}
  `,

  MeUserFragments: gql`
    fragment MeUserFragments on User {
      id
      email
    }
  `,
};

MeEdit.fragments.MeEditFragments = gql`
  fragment MeEditFragments on Me {
    role {
      id
      ...MeRoleFragments
    }
    user {
      id
      ...MeUserFragments
    }
  }
  ${MeEdit.fragments.MeRoleFragments}
  ${MeEdit.fragments.MeUserFragments}
`;

const GET_ME = gql`
  query getMeForEdit {
    me {
      ...MeEditFragments
    }
  }
  ${MeEdit.fragments.MeEditFragments}
`;

const UPDATE_MY_ROLE_MUTATION = gql`
  mutation UpdateMyRole($input: UpdateMyRoleInput!) {
    updateMyRole(input: $input) {
      ...MeRoleFragments
    }
  }
  ${MeEdit.fragments.MeRoleFragments}
`;
