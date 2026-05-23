import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getAuthStatus } from "reducers/selector";
import { AuthStatus } from "types/graphql";

interface Props {
  forceDisplay?: boolean;
}

/**
 * Manage the integration with orcha support:
 *
 * - Update the URL in the support component when location changes
 * - Hides the support button until logged-in
 */
export const SupportIntegration: React.FC<Props> = (props) => {
  const { forceDisplay } = props;
  const history = useHistory();
  const authStatus = useSelector(getAuthStatus);
  const isLinked = authStatus === AuthStatus.Linked;

  // add the URL when the path changes
  useEffect(() => {
    (window as any).OrchaSupport.push(["setUrl", window.location.href]);
    history.listen(() =>
      (window as any).OrchaSupport.push(["setUrl", window.location.href])
    );
  });

  // only display the support button when logged in
  useEffect(() => {
    if (isLinked || forceDisplay) {
      (window as any).OrchaSupport.push(["showButton"]);
    } else {
      (window as any).OrchaSupport.push(["hideButton"]);
    }
  }, [isLinked, forceDisplay]);

  return null;
};
