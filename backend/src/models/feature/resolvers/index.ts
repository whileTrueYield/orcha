/**
 * Feature resolver registrations — side-effect imports.
 *
 * Each resolver file registers its queries/mutations on the builder
 * at import time. This barrel just ensures they all get loaded.
 */

import "./feature.resolver";
import "./features.resolver";
import "./featureGroup.resolver";
import "./featureGroups.resolver";
import "./createFeatureGroup.resolver";
import "./deleteFeatureGroup.resolver";
import "./miniFeature.resolver";
import "./updateFeatureGroup.resolver";
