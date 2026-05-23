import { CreateOrganizationResolver } from "./createOrganization.resolver";
import { UpdateOrganizationResolver } from "./updateOrganization.resolver";
import { OrganizationResolver } from "./organization.resolver";
import { OrganizationsResolver } from "./organizations.resolver";
import { UpdateOrganizationPreferencesResolver } from "./updateOrganizationPreferences.resolver";

export default [
  CreateOrganizationResolver,
  UpdateOrganizationResolver,
  OrganizationResolver,
  OrganizationsResolver,
  UpdateOrganizationPreferencesResolver,
];
