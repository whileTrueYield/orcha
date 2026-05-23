import {
  Role,
  MiniRole,
  Feature,
  MiniFeature,
  Workflow,
  MiniWorkflow,
  MiniProduct,
  Product,
  MiniProject,
  Project,
} from "types/graphql";
import { get } from "lodash";

// Allow converter to detect the returned value of convertToMiniRole
export function convertToMiniRole<T extends Role | null | undefined>(
  role: T
): T extends Role ? MiniRole : undefined;

export function convertToMiniRole(role?: Role | null) {
  if (role) {
    return {
      id: role.id,
      name: role.name,
      avatarUrl: role.avatarUrl,
    };
  }

  return;
}

// Allow converter to detect the returned value of convertToMiniFeature
export function convertToMiniFeature<T extends Feature | null | undefined>(
  feature: T
): T extends Feature ? MiniFeature : undefined;

export function convertToMiniFeature(feature?: Feature | null) {
  if (feature) {
    return {
      id: feature.id,
      name: feature.name,
      featureGroupName: get(feature, "featureGroup.name", ""),
      productCode: get(feature, "featureGroup.product.code", ""),
      productName: get(feature, "featureGroup.product.name", ""),
    };
  }

  return;
}

// Allow converter to detect the returned value of convertToMiniWorkflow
export function convertToMiniWorkflow<T extends Workflow | null | undefined>(
  feature: T
): T extends Workflow ? MiniWorkflow : undefined;

export function convertToMiniWorkflow(workflow?: Workflow | null) {
  if (workflow) {
    return {
      id: workflow.id,
      name: workflow.name,
      stage: workflow.stage,
    };
  }

  return;
}

// Allow converter to detect the returned value of convertToMiniProduct
export function convertToMiniProduct<T extends Product | null | undefined>(
  product: T
): T extends Product ? MiniProduct : undefined;

export function convertToMiniProduct(product?: Product | null) {
  if (product) {
    return {
      id: product.id,
      name: product.name,
      stage: product.stage,
    };
  }

  return;
}

// Allow converter to detect the returned value of convertToMiniProject
export function convertToMiniProject<T extends Project | null | undefined>(
  project: T
): T extends Project ? MiniProject : undefined;

export function convertToMiniProject(project?: Project | null) {
  if (project) {
    return {
      id: project.id,
      name: project.name,
      parentId: project.parentId,
      stage: project.stage,
      ancestorIsArchived: project.ancestorIsArchived,
    };
  }

  return;
}
