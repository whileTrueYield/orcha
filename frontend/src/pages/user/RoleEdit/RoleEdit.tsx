import { useEffect, useState } from "react";
import {
  useParams,
  RouteComponentProps,
  Link,
  useHistory,
} from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { roleFormFields } from "../formFields";
import { urlResolver } from "utils/navigation";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import {
  MutationResendInviteArgs,
  MutationUpdateRoleArgs,
  Role,
  RoleStatus,
  MutationUpdateRoleWorkWeekArgs,
  RoleType,
  MutationDeleteRoleArgs,
} from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup, Input } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { FCWithFragments } from "types";
import { filter, map, round, without } from "lodash";
import {
  WeeklySchedule,
  mergeOverlapingCalenderItem,
  toCalendarItem,
  WeeklyCalendarItem,
} from "components/WeeklySchedule";
import { CreateWeeklyCalendarItemForm } from "./CreateWeeklyCalendarItemForm";
import { EditWeeklyCalendarItemForm } from "./EditWeeklyCalendarItemForm";
import { Panel, PanelBody } from "components/views/Panel";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { Avatar } from "components/views/Avatar";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { useNavConfirmation } from "hooks/useNavConfirmation";
import { RadioGroup } from "@headlessui/react";
import { RoleRadioGroup } from "../UserCreate/RoleRadioGroup";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { copyToClipboard, plural } from "utils/string";
import { getWeeklyCalendarHours } from "../helper";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    title: roleFormFields.title,
    roleType: roleFormFields.type,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

type Props = RouteComponentProps<{ roleId: string }>;

interface UrlParams {
  roleId: string;
  orgId: string;
}

export const RoleEdit: FCWithFragments<Props> = (props) => {
  usePageTitle("Role Edit");
  const urlParams = useParams<UrlParams>();
  const roleId = parseInt(urlParams.roleId);
  const history = useHistory();

  const isAdmin = useSelector(isAdminLevel);

  const [reactivateModalVisible, setReactivateModalVisibility] =
    useState(false);
  const [deactivateModalVisible, setDeactivateModalVisibility] =
    useState(false);

  const [workTimes, setWorkTimes] = useState<WeeklyCalendarItem[]>([]);
  const [copyCta, setCopyCta] = useState("Copy");

  const addWorkTime = (item: WeeklyCalendarItem) => {
    activateNavConfirmation(true);
    setWorkTimes(mergeOverlapingCalenderItem([item, ...workTimes]));
  };

  const updateWorkTime = (
    previousItem: WeeklyCalendarItem,
    updatedItem: WeeklyCalendarItem | null
  ) => {
    if (updatedItem) {
      setWorkTimes(
        mergeOverlapingCalenderItem([
          updatedItem,
          ...without(workTimes, previousItem),
        ])
      );
    } else if (updatedItem === null) {
      setWorkTimes(without(workTimes, previousItem));
    }
    activateNavConfirmation(true);
  };

  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const { reset, register, setValue, watch } = formMethods;

  const {
    isConfirmNavVisible,
    onNavAccept,
    onNavCancel,
    activateNavConfirmation,
  } = useNavConfirmation(false);

  useEffect(() => {
    if (formMethods.formState.isDirty) {
      activateNavConfirmation(true);
    }
  }, [formMethods.formState.isDirty, activateNavConfirmation]);

  useEffect(() => {
    register("roleType");
  }, [register]);
  const roleType = watch("roleType");

  const { data, loading, error } = useQuery<QueryReturnValue["role"]>(
    GET_ROLE,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        if (data.role) {
          const { workWeek } = data.role;
          setWorkTimes([
            ...workWeek["monday"].map((i) => toCalendarItem("monday", i)),
            ...workWeek["tuesday"].map((i) => toCalendarItem("tuesday", i)),
            ...workWeek["wednesday"].map((i) => toCalendarItem("wednesday", i)),
            ...workWeek["thursday"].map((i) => toCalendarItem("thursday", i)),
            ...workWeek["friday"].map((i) => toCalendarItem("friday", i)),
            ...workWeek["saturday"].map((i) => toCalendarItem("saturday", i)),
            ...workWeek["sunday"].map((i) => toCalendarItem("sunday", i)),
          ]);

          reset({
            ...data.role,
            title: data.role.title,
            roleType: data.role.type,
          });
        }
      },
      variables: {
        id: roleId,
      },
    }
  );

  const [resendInvite] = useBlockingMutation<
    { resendInvite: Role },
    MutationResendInviteArgs
  >(MUTATE_RESEND_INVITE, {
    onCompleted: onMutationComplete({ title: "Invitation sent" }),
    onError: onGraphQLError({ title: "Could not send invite" }),
  });

  const [deleteRole] = useBlockingMutation<
    MutationReturnValue["deleteRole"],
    MutationDeleteRoleArgs
  >(DELETE_ROLE_MUTATION, {
    onError: onGraphQLError({ title: "Deactivation failed" }),
    onCompleted: onMutationComplete({
      title: "User has been deactivated",
      callback: () => history.push(urlResolver.role.listing(urlParams.orgId)),
    }),
  });

  const [reactivateRole] = useBlockingMutation<
    MutationReturnValue["reactivateRole"],
    MutationDeleteRoleArgs
  >(REACTIVATE_ROLE_MUTATION, {
    onError: onGraphQLError({ title: "Activation failed" }),
    onCompleted: onMutationComplete({ title: "User has been reactivated" }),
  });

  const onDeactivate = () => {
    deleteRole({ variables: { roleId } });
  };

  const onReactivate = () => {
    reactivateRole({ variables: { roleId } });
  };

  const [updateRole] = useBlockingMutation<
    { updateRole: Role },
    MutationUpdateRoleArgs
  >(MUTATE_UPDATE_ROLE, {
    onError: onGraphQLError({ title: "Could not update role" }),
    onCompleted: onMutationComplete({
      title: "Role has been updated",
      callback: () => activateNavConfirmation(false),
    }),
  });

  const [updateRoleWorkWeek] = useBlockingMutation<
    { updateRoleWorkWeek: Role },
    MutationUpdateRoleWorkWeekArgs
  >(MUTATE_UPDATE_ROLE_WORK_WEEK, {
    onError: onGraphQLError({ title: "Could not update work hours" }),
    onCompleted: onMutationComplete({
      title: "Work hours have been updated",
      callback: () => activateNavConfirmation(false),
    }),
  });

  if (loading || error) {
    return null;
  }

  const role = data?.role;
  if (!role) {
    return null;
  }

  const timeZone = role.timeZone.replaceAll("/", " / ").replaceAll("_", " ");

  const updateHours = () => {
    if (workTimes) {
      updateRoleWorkWeek({
        variables: {
          roleId: role.id,
          input: {
            monday: map(
              filter(workTimes, { dayOfTheWeek: "monday" }),
              ({ startTime, stopTime }) => ({
                startTime,
                stopTime,
              })
            ),
            tuesday: map(
              filter(workTimes, { dayOfTheWeek: "tuesday" }),
              ({ startTime, stopTime }) => ({
                startTime,
                stopTime,
              })
            ),
            wednesday: map(
              filter(workTimes, { dayOfTheWeek: "wednesday" }),
              ({ startTime, stopTime }) => ({
                startTime,
                stopTime,
              })
            ),
            thursday: map(
              filter(workTimes, { dayOfTheWeek: "thursday" }),
              ({ startTime, stopTime }) => ({
                startTime,
                stopTime,
              })
            ),
            friday: map(
              filter(workTimes, { dayOfTheWeek: "friday" }),
              ({ startTime, stopTime }) => ({
                startTime,
                stopTime,
              })
            ),
            saturday: map(
              filter(workTimes, { dayOfTheWeek: "saturday" }),
              ({ startTime, stopTime }) => ({
                startTime,
                stopTime,
              })
            ),
            sunday: map(
              filter(workTimes, { dayOfTheWeek: "sunday" }),
              ({ startTime, stopTime }) => ({
                startTime,
                stopTime,
              })
            ),
          },
        },
      });
    }
  };

  const onSubmit = (formData: FormSchema) => {
    if (role) {
      updateRole({
        variables: {
          input: { title: formData.title, type: formData.roleType },
          roleId: role.id,
        },
      });
    }
  };

  const renderStatus = () => (
    <div className="col-span-3 lg:col-span-1">
      <Label htmlFor="role_status" className="mb-1">
        Status
      </Label>
      <Input type="text" id="role_status" value={role.status} readOnly>
        <Button
          onClick={() =>
            resendInvite({
              variables: { email: role.user.email },
            })
          }
          btnGroup="end"
          type="button"
          btnType="gray"
        >
          Resend
          <span className="ml-1 hidden sm:inline">invite</span>
        </Button>
      </Input>
    </div>
  );

  return (
    <div className="flex flex-col space-y-6 px-2 pb-6 sm:px-0">
      <DangerConfirm
        title="Deactivate Account"
        description="Are you sure you want to deactivate this account? This user will
        lose access to this organization."
        onClose={() => setDeactivateModalVisibility(false)}
        onConfirm={onDeactivate}
        cta="Deactivate Account"
        visible={deactivateModalVisible}
      />

      <WarningConfirm
        title="Reactivate Account"
        description="Are you sure you want to reactivate this account?"
        onClose={() => setReactivateModalVisibility(false)}
        onConfirm={onReactivate}
        cta="Reactivate Account"
        visible={reactivateModalVisible}
      />

      <WarningConfirm
        title="Discard Role Changes"
        description={
          "Are you sure you wish to discard the changes you made " +
          "to this role? Once discarded changes are permanently lost."
        }
        onClose={onNavCancel}
        cta="Yes, discard changes"
        onConfirm={onNavAccept}
        visible={isConfirmNavVisible}
      />
      <Panel>
        <PanelBody>
          <div className="flex flex-row space-x-4">
            <Avatar
              src={role.avatarUrl}
              className="h-24 w-24 shrink-0 rounded-md shadow"
              name={role.name}
            />
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {role.name}
              </h3>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Define the role of <strong>{role.name}</strong> within the
                organization <strong>{role.organization.name}</strong>.
              </p>
            </div>
          </div>
          <FormProvider {...formMethods}>
            <form
              onSubmit={formMethods.handleSubmit(onSubmit)}
              className="mt-6"
            >
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 lg:col-span-2">
                  <Label htmlFor="role_title" className="mb-1">
                    Title
                  </Label>
                  <FormInputGroup
                    type="text"
                    id="role_title"
                    name="title"
                    placeholder="e.g. Lead Software Engineer"
                  />
                </div>
                <div className="col-span-3 lg:col-span-1">
                  <Label htmlFor="role_timeZone" className="mb-1" readOnly>
                    Time zone
                  </Label>
                  <Input
                    type="text"
                    id="role_timeZone"
                    defaultValue={timeZone}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                  />
                </div>

                <div className="col-span-3 lg:col-span-2">
                  <Label htmlFor="role_email" className="mb-1" readOnly>
                    Email
                  </Label>
                  <Input
                    type="text"
                    id="role_email"
                    defaultValue={role.user.email}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                  >
                    <Button
                      onClick={() => {
                        copyToClipboard(role.user.email);
                        setCopyCta("Copied!");
                        setTimeout(() => setCopyCta("Copy"), 2000);
                      }}
                      btnGroup="end"
                      type="button"
                      btnType="gray"
                    >
                      {copyCta}
                    </Button>
                  </Input>
                </div>

                {role.status === RoleStatus.Invited ? renderStatus() : null}

                <div className="col-span-3 text-left">
                  <RadioGroup
                    value={roleType}
                    onChange={(roleType: RoleType) => {
                      isAdmin &&
                        setValue("roleType", roleType, { shouldDirty: true });
                    }}
                    disabled={!isAdmin}
                  >
                    <RadioGroup.Label className="mb-1 block text-sm font-medium leading-5 text-gray-700">
                      Role
                    </RadioGroup.Label>
                    <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:flex-row sm:gap-4">
                      <RoleRadioGroup
                        title="Member"
                        description="Member can access all public items"
                        value={RoleType.Member}
                      />
                      <RoleRadioGroup
                        title="Admin"
                        description="Admin can configure Orcha and invite new members"
                        value={RoleType.Admin}
                        warning
                      />
                      <RoleRadioGroup
                        title="Owner"
                        description="Owner can add and remove admins and other owners"
                        value={RoleType.Owner}
                        danger
                      />
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                {role.status === RoleStatus.Deactivated ? (
                  <Button
                    type="button"
                    btnType="secondaryWhite"
                    fullInMobile
                    onClick={() => setReactivateModalVisibility(true)}
                  >
                    Reactivate Account
                  </Button>
                ) : (
                  <Button
                    type="button"
                    btnType="secondaryDanger"
                    fullInMobile
                    onClick={() => setDeactivateModalVisibility(true)}
                  >
                    Deactivate Account
                  </Button>
                )}
                <div className="flex flex-1 flex-col justify-end space-y-2 sm:flex-row sm:space-y-0">
                  <Button
                    type="button"
                    btnType="secondaryWhite"
                    fullInMobile
                    className="mr-2"
                    asElement={(classNames) => (
                      <Link
                        to={urlResolver.role.listing(urlParams.orgId)}
                        className={classNames}
                      >
                        Cancel
                      </Link>
                    )}
                  />
                  <Button type="submit" btnType="primary" fullInMobile>
                    Update Role
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelBody>
          <h3 className="flex flex-row justify-between text-lg font-medium leading-6 text-gray-900 md:justify-start">
            <span>Work Hours</span>
            <span className="ml-4 text-gray-500">
              {plural(
                "{} Hour / Week ",
                "{} Hours  / Week",
                round(getWeeklyCalendarHours(workTimes))
              )}
            </span>
          </h3>
          <p className="mt-1 text-sm leading-5 text-gray-500">
            Provide the weekly schedule for {role.name}. We will only schedule
            work within these hours.
          </p>

          <div className="mt-6">
            <WeeklySchedule
              height={1000}
              timeZone={role.timeZone}
              workTimes={workTimes}
              editForm={(item, onClose) => (
                <EditWeeklyCalendarItemForm
                  onClose={onClose}
                  item={item}
                  onSubmit={updateWorkTime}
                />
              )}
              createForm={(item, onClose) => (
                <CreateWeeklyCalendarItemForm
                  onClose={onClose}
                  item={item}
                  onSubmit={addWorkTime}
                />
              )}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              btnType="secondaryWhite"
              className="mr-2"
              asElement={(classNames) => (
                <Link
                  to={urlResolver.role.listing(urlParams.orgId)}
                  className={classNames}
                >
                  Cancel
                </Link>
              )}
            />
            <Button type="button" onClick={updateHours} btnType="primary">
              Update Work Hours
            </Button>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
};

RoleEdit.fragments = {
  roleDetails: gql`
    fragment RoleDetails on Role {
      id
      title
      name
      avatarUrl
      coverUrl
      description
      timeZone
      status
      type
      createdAt
      updatedAt
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
      organization {
        id
        name
      }
      user {
        id
        email
        createdAt
      }
    }
  `,
};

const GET_ROLE = gql`
  query getRoleForEdit($id: Int!) {
    role(id: $id) {
      ...RoleDetails
    }
  }
  ${RoleEdit.fragments.roleDetails}
`;

const MUTATE_UPDATE_ROLE = gql`
  mutation UpdateRole($input: UpdateRoleInput!, $roleId: Int!) {
    updateRole(input: $input, roleId: $roleId) {
      ...RoleDetails
    }
  }
  ${RoleEdit.fragments.roleDetails}
`;

const MUTATE_UPDATE_ROLE_WORK_WEEK = gql`
  mutation UpdateRoleWorkWeek($input: UpdateRoleWorkWeekInput!, $roleId: Int!) {
    updateRoleWorkWeek(input: $input, roleId: $roleId) {
      ...RoleDetails
    }
  }
  ${RoleEdit.fragments.roleDetails}
`;

const MUTATE_RESEND_INVITE = gql`
  mutation ResendInvite($email: String!) {
    resendInvite(email: $email) {
      ...RoleDetails
    }
  }
  ${RoleEdit.fragments.roleDetails}
`;

const DELETE_ROLE_MUTATION = gql`
  mutation DeleteRole($roleId: Int!) {
    deleteRole(roleId: $roleId) {
      id
      status
      organization {
        id
        scheduleStatus
      }
    }
  }
`;

const REACTIVATE_ROLE_MUTATION = gql`
  mutation reactivateRole($roleId: Int!) {
    reactivateRole(roleId: $roleId) {
      id
      status
      organization {
        id
        scheduleStatus
      }
    }
  }
`;
