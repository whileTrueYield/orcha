import React, { useState } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Team } from "types/graphql";

import { UploadZone } from "components/fields/UploadZone";
import { teamFormFields } from "../formFields";
import { urlResolver } from "utils/navigation";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { MutationUpdateTeamArgs } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import { FCWithFragments } from "types";
import { FormInputGroup } from "components/fields/Input";
import { FormTextareaGroup } from "components/fields/Textarea";
import { Label } from "components/fields/Label";
import { TeamMemberList } from "./TeamMemberList";
import { Button } from "components/fields/Button";
import { PhotoAddIcon } from "components/assets/PhotoAddIcon";
import { Panel, PanelBody } from "components/views/Panel";
import { useBlockingMutation } from "utils/graphql";
import { QueryReturnValue } from "types/queryTypes";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: teamFormFields.name,
    code: teamFormFields.code,
    description: teamFormFields.description,
    coverUrl: teamFormFields.coverUrl,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface UrlParams {
  teamId: string;
  orgId: string;
}

export const TeamEdit: FCWithFragments = () => {
  const params = useParams<UrlParams>();
  const teamId = parseInt(params.teamId);
  const history = useHistory();

  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const { reset, setValue } = formMethods;
  const [coverUrl, setCoverUrl] = useState<string | null | undefined>("");

  const { data, loading } = useQuery<QueryReturnValue["team"]>(GET_TEAM, {
    variables: {
      id: teamId,
    },
    onError: onGraphQLError({ title: "Retrieve team error" }),
    onCompleted: ({ team }) => {
      reset({
        name: team.name,
        code: team.code,
        description: team.description || "",
      });
      setCoverUrl(team.coverUrl);
    },
  });

  const team = data?.team;

  const onTeamUpdated = (team: Team) => {
    history.push(urlResolver.team.view(params.orgId, team!.id));
  };

  const [updateTeam] = useBlockingMutation<
    { updateTeam: Team },
    MutationUpdateTeamArgs
  >(MUTATE_UPDATE_TEAM, {
    onError: onGraphQLError({ title: "Could not update team" }),
    onCompleted: onMutationComplete({
      title: "Team Updated",
      callback: (data) => onTeamUpdated(data.updateTeam),
    }),
  });

  if (loading) {
    return null;
  }

  if (!team) {
    return null;
  }

  const onSubmit = (formData: FormSchema) => {
    if (team) {
      updateTeam({
        variables: {
          input: formData,
          teamId: team.id,
        },
      });
    }
  };

  const clearCover = () => {
    setCoverUrl(null);
    setValue("coverUrl", null);
  };

  return (
    <div className="flex flex-col space-y-6 pb-6">
      <Panel className="mx-2 sm:mx-0">
        <PanelBody>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Team</h3>
          <p className="mt-1 text-sm leading-5 text-gray-500">
            You may describe your team using Markdown. The team code will be
            used to label ticket.
          </p>
          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)}>
              <div className="mt-6 grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <FormInputGroup
                    type="text"
                    name="name"
                    id="team-name"
                    placeholder="e.g. fou-du-roi"
                    className="mt-1"
                  />
                </div>

                <div className="col-span-3 sm:col-span-1">
                  <Label htmlFor="team-code">Team Code</Label>
                  <FormInputGroup
                    type="text"
                    id="team-code"
                    name="code"
                    placeholder="e.g. FDR"
                    className="mt-1 w-32 sm:w-auto"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2 md:col-span-3">
                  <Label htmlFor="team-description">Description</Label>
                  <FormTextareaGroup
                    id="team-description"
                    name="description"
                    description="Brief description for your team. URLs are hyperlinked."
                    rows={6}
                    placeholder="Team description... (optional)"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="cover_photo">Team Cover</Label>
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
                        className="absolute inset-0 flex animate-pulse-once cursor-pointer items-center justify-center bg-white text-lg text-black opacity-0 transition-opacity duration-200 hover:opacity-75"
                      >
                        Click to change the team cover
                      </div>
                    </div>
                  ) : null}
                  <UploadZone
                    onUpload={setCoverUrl}
                    name="coverUrl"
                    className="mt-2 flex h-36 items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 "
                    accept="image/*"
                    info="PNG, JPG, GIF up to 10MB"
                    icon={
                      <PhotoAddIcon className="mx-auto h-12 w-12 text-gray-400" />
                    }
                    isVisible={Boolean(coverUrl)}
                    category="organization"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    btnType="secondaryWhite"
                    asElement={(className) => (
                      <Link
                        className={className}
                        to={urlResolver.team.view(params.orgId, team.id)}
                      >
                        Cancel
                      </Link>
                    )}
                  />
                  <Button btnType="primary" type="submit" className="ml-4">
                    Update Team
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </PanelBody>
      </Panel>

      <TeamMemberList team={team} />
    </div>
  );
};

TeamEdit.fragments = {
  TeamEdit_TeamFragment: gql`
    fragment TeamEdit_TeamFragment on Team {
      id
      name
      code
      description
      coverUrl
    }
  `,
};

const GET_TEAM = gql`
  query getTeamForEdit($id: Int!) {
    team(id: $id) {
      ...TeamEdit_TeamFragment
    }
  }
  ${TeamEdit.fragments.TeamEdit_TeamFragment}
`;

const MUTATE_UPDATE_TEAM = gql`
  mutation UpdateTeam($input: UpdateTeamInput!, $teamId: Int!) {
    updateTeam(input: $input, teamId: $teamId) {
      ...TeamEdit_TeamFragment
    }
  }
  ${TeamEdit.fragments.TeamEdit_TeamFragment}
`;
