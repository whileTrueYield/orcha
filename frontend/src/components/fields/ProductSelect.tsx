import React, { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { MiniProduct, ModelStage } from "types/graphql";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { ObjectSelectSearch } from "components/fields/ObjectSelectSearch";
import { Tag } from "components/tags/Tag";
import { FCWithFragments } from "types";
import { HighlightMatch } from "./HighlightMatch";
import cn from "classnames";
import fuzzysort from "fuzzysort";
import { find } from "lodash";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  value?: MiniProduct | null;
  defaultId?: number;
  onChange: (product?: MiniProduct) => void;
  onDelete?: () => void;
  label?: string;
  tabIndex?: number;
  placeholder?: string;
  includeDraft?: boolean;
  includeArchived?: boolean;
}

const GET_MINI_PRODUCTS = gql`
  query GetMiniProducts {
    miniProducts {
      id
      name
      stage
    }
  }
`;

export const ProductSelect: FCWithFragments<Props> = (props) => {
  const { includeDraft, includeArchived } = props;
  const [search, setSearch] = useState("");

  const { data, error } = useQuery<QueryReturnValue["miniProducts"]>(
    GET_MINI_PRODUCTS,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: ({ miniProducts }) => {
        if (props.defaultId) {
          const product = find(miniProducts, { id: props.defaultId });
          if (product) {
            props.onChange(product);
          }
        }
      },
    }
  );

  const products = useMemo((): MiniProduct[] => {
    if (!data?.miniProducts) {
      return [];
    }

    let allProducts = data.miniProducts;

    if (!includeDraft) {
      allProducts = allProducts.filter(
        (product) => product.stage !== ModelStage.Draft
      );
    }

    if (!includeArchived) {
      allProducts = allProducts.filter(
        (product) => product.stage !== ModelStage.Archived
      );
    }

    if (search) {
      const results = fuzzysort.go(search, allProducts, {
        key: "name",
        limit: 10,
        threshold: -Infinity,
      });
      return results.map((r) => r.obj);
    } else {
      return allProducts;
    }
  }, [data, search, includeDraft, includeArchived]);

  if (error) {
    return null;
  }

  const searchHeader = () => {
    if (search || products.length > 4) {
      return <ObjectSelectSearch onChange={setSearch} query={search} />;
    }
  };

  const renderOptionLabel = (
    product?: MiniProduct,
    isActive?: boolean,
    isSelected?: boolean
  ) => {
    if (product) {
      const tagClass = cn({
        "bg-gray-200 text-gray-800": !isActive && !isSelected,
        "bg-brand-200 text-brand-900": isSelected,
        "bg-brand-800 text-brand-50": isActive,
      });

      if (product.stage === ModelStage.Published) {
        return <HighlightMatch value={product.name} query={search} />;
      }

      return (
        <div className="flex items-center justify-between">
          <div className="flex flex-row items-center">
            <div>
              <HighlightMatch value={product.name} query={search} />
            </div>
          </div>
          <Tag className={tagClass}>{product.stage}</Tag>
        </div>
      );
    } else {
      return "";
    }
  };
  return (
    <ObjectSelect<MiniProduct>
      tabIndex={props.tabIndex}
      label={props.label}
      header={searchHeader()}
      items={products}
      value={props.value}
      onChange={props.onChange}
      onDelete={props.onDelete}
      identityMethod={(product) => (product ? product.id : null)}
      renderOptionLabel={renderOptionLabel}
      placeholder={props.placeholder}
    />
  );
};

ProductSelect.fragments = {
  ProductSelectFragment: gql`
    fragment ProductSelectFragment on Product {
      id
      name
      code
      stage
    }
  `,
};
