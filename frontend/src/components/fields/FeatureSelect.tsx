import React, { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { MiniFeature, QueryMiniFeaturesArgs } from "types/graphql";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { ObjectSelectSearch } from "components/fields/ObjectSelectSearch";
import { Tag } from "components/tags/Tag";
import { HighlightMatch } from "./HighlightMatch";
import cn from "classnames";
import fuzzysort from "fuzzysort";
import { QueryReturnValue } from "types/queryTypes";

const GET_MINI_FEATURES = gql`
  query GetMiniFeatures($productId: Int) {
    miniFeatures(productId: $productId) {
      id
      name
      featureGroupName
      productCode
      productName
    }
  }
`;

interface Props {
  value?: MiniFeature;
  onChange: (feature?: MiniFeature) => void;
  label?: string;
  tabIndex?: number;
  placeholder?: string;
  productId?: number;
  renderButton?: (value: MiniFeature | null) => React.ReactNode;
  isDisabled?: (value: MiniFeature) => boolean;
  isSelected?: (value: MiniFeature) => boolean;
}

const getLabelForMiniFeature = (mf: MiniFeature) =>
  `${mf.featureGroupName} / ${mf.name}`;

export const FeatureSelect: React.FC<Props> = (props) => {
  const { productId } = props;
  const [search, setSearch] = useState("");

  const variables = useMemo((): QueryMiniFeaturesArgs => {
    if (productId) {
      return { productId };
    } else {
      return {};
    }
  }, [productId]);

  const { data, error } = useQuery<
    QueryReturnValue["miniFeatures"],
    QueryMiniFeaturesArgs
  >(GET_MINI_FEATURES, { fetchPolicy: "cache-and-network", variables });

  const features = useMemo((): MiniFeature[] => {
    if (!data?.miniFeatures) {
      return [];
    }

    let allFeatures = data.miniFeatures.map((f) => ({
      ...f,
      label: `${f.featureGroupName}/${f.name}`,
    }));

    if (search) {
      const results = fuzzysort.go(search, allFeatures, {
        key: "label",
        limit: 10,
        threshold: -Infinity,
      });
      return results.map((r) => r.obj);
    } else {
      return allFeatures;
    }
  }, [data, search]);

  if (error) {
    return null;
  }

  const searchHeader = () => {
    if (search || features.length > 4) {
      return <ObjectSelectSearch onChange={setSearch} query={search} />;
    }
  };

  const renderOptionLabel = (
    feature?: MiniFeature,
    isActive?: boolean,
    isSelected?: boolean,
    isDisabled?: boolean
  ) => {
    if (feature) {
      const tagClass = cn({
        "bg-gray-200 text-gray-800": !isActive && !isSelected,
        "bg-brand-200 text-brand-900": isSelected,
        "bg-brand-800 text-brand-50": isActive,
      });
      return (
        <div className="flex items-center justify-between">
          <div className="flex flex-row items-center">
            <div>
              <HighlightMatch
                value={getLabelForMiniFeature(feature)}
                query={search}
              />
            </div>
          </div>
          <Tag className={tagClass}>{feature.productCode}</Tag>
        </div>
      );
    } else {
      return "";
    }
  };

  return (
    <ObjectSelect<MiniFeature>
      tabIndex={props.tabIndex}
      label={props.label}
      header={searchHeader()}
      items={features}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      identityMethod={(feature) => (feature ? feature.id : null)}
      renderOptionLabel={renderOptionLabel}
      renderButton={props.renderButton}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
    />
  );
};
