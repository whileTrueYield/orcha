import { CreateFeatureGroupResolver } from "./createFeatureGroup.resolver";
import { DeleteFeatureGroupResolver } from "./deleteFeatureGroup.resolver";
import { FeatureGroupResolver } from "./featureGroup.resolver";
import { FeatureGroupsResolver } from "./featureGroups.resolver";
import { FeatureResolver } from "./feature.resolver";
import { FeaturesResolver } from "./features.resolver";
import { MiniFeatureResolver } from "./miniFeature.resolver";
import { UpdateFeatureResolver } from "./updateFeatureGroup.resolver";

export default [
  CreateFeatureGroupResolver,
  DeleteFeatureGroupResolver,
  FeatureGroupResolver,
  FeatureGroupsResolver,
  FeatureResolver,
  FeaturesResolver,
  MiniFeatureResolver,
  UpdateFeatureResolver,
];
