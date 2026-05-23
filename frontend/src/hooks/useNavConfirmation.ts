import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";

export function useNavConfirmation(enabled: boolean = false) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEnabled, setEnabled] = useState(enabled);
  const history = useHistory();
  const unblockHandle = useRef<any>();
  const [targetLocation, setTargetLocation] = useState<any>();

  const onNavAccept = () => {
    unblockHandle.current();
    if (targetLocation) {
      history.push(targetLocation);
    }
  };

  useEffect(() => {
    unblockHandle.current = history.block((targetLocation) => {
      if (isEnabled) {
        setTargetLocation(targetLocation);
        setShowConfirm(true);
        return false;
      }
    });

    return unblockHandle.current;
  });

  return {
    onNavCancel: () => setShowConfirm(false),
    isConfirmNavVisible: showConfirm,
    onNavAccept,
    activateNavConfirmation: setEnabled,
  };
}
