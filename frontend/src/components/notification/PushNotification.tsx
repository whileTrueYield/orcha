import { ApiUri, AppUri } from "config";
import { useUrlQuery } from "hooks/useUrlQuery";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { EstimateModal } from "./EstimateModal";
import { ResumeWorkModal } from "./ResumeWorkModal";
import { StillWorkingModal } from "./StillWorkingModal";
import { useAppDispatch } from "store";
import { showTicketEditModal } from "actions";

const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

async function registerWebPush(): Promise<[ServiceWorkerRegistration, string]> {
  // when update the notification worker script, remember to update the version here
  // use `new Date().getTime()` value to help track the age of the worker
  const register = await navigator.serviceWorker.register(
    "/script/notification-worker.js?version=1686327235965",
  );

  // Register Push
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey as string),
  });

  // Send Push Notification
  await fetch(`${ApiUri}/subscribe`, {
    credentials: "include",
    mode: "cors",
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json",
    },
  });
  return [register, subscription.endpoint];
}

export const PushNotification: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const [showResumeWorkModal, setShowResumeWorkModal] = useState(false);
  const [showStillWorkingModal, setShowStillWorkingModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);

  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const urlSearchParams = useUrlQuery();
  const notificationCategory = urlSearchParams.get("notification_category");
  const [targetId, setTargetId] = useState(urlSearchParams.get("target_id"));
  const history = useHistory();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (notificationCategory === "WORK_START") {
      setShowResumeWorkModal(true);
      history.replace(urlResolver.dashboard.home(orgId));
    } else if (notificationCategory === "WORK_STOP") {
      setShowStillWorkingModal(true);
      history.replace(urlResolver.dashboard.home(orgId));
    } else if (notificationCategory === "ESTIMATE_REQUESTED") {
      setShowEstimateModal(true);
      history.replace(urlResolver.dashboard.home(orgId));
    }
  }, [
    notificationCategory,
    setShowResumeWorkModal,
    setShowStillWorkingModal,
    setShowEstimateModal,
    history,
    orgId,
  ]);

  useEffect(() => {
    const onMessage = ({ data }: any) => {
      if (data.category === "WORK_START") {
        setShowResumeWorkModal(true);
      } else if (data.category === "WORK_STOP") {
        setShowStillWorkingModal(true);
      } else if (data.category === "ESTIMATE_REQUESTED") {
        setShowEstimateModal(true);
        setTargetId(data.targetId);
      } else if (data.category === "READY_TO_SCHEDULE") {
        dispatch(showTicketEditModal(data.targetId));
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", onMessage);

      return () => {
        navigator.serviceWorker.removeEventListener("message", onMessage);
      };
    }
  }, [dispatch]);

  useEffect(() => {
    if (registration?.active) {
      registration.active.postMessage({
        type: "setApiUrl",
        payload: { ApiUri },
      });
      registration.active.postMessage({
        type: "setAppUrl",
        payload: { AppUri },
      });
    }
  }, [registration]);

  useEffect(() => {
    // Check for service worker
    if ("serviceWorker" in navigator) {
      registerWebPush()
        .then(([registration]) => {
          setRegistration(registration);
        })
        .catch((err) => console.error(err));
    }
  }, []);

  // The following unsubscribe when this component
  // unmount which creates an issue on dev when the page refresh
  // Not sure if this could also be an issue in prod so we'll test
  // without it for now.
  // useEffect(() => {
  //   return () => {
  //     if (endpoint) {
  //       fetch(`${ApiUri}/unsubscribe`, {
  //         credentials: "include",
  //         mode: "cors",
  //         method: "POST",
  //         body: JSON.stringify({ endpoint }),
  //         headers: {
  //           "content-type": "application/json",
  //         },
  //       });
  //     }
  //   };
  // }, [endpoint]);

  const renderWhatRequiresTargetId = () => {
    if (targetId) {
      return (
        <>
          <EstimateModal
            visible={showEstimateModal}
            onClose={() => setShowEstimateModal(false)}
            ticketWorkflowStateId={targetId}
          />
        </>
      );
    }
    return null;
  };

  return (
    <>
      <ResumeWorkModal
        visible={showResumeWorkModal}
        onClose={() => setShowResumeWorkModal(false)}
      />
      <StillWorkingModal
        visible={showStillWorkingModal}
        onClose={() => setShowStillWorkingModal(false)}
      />
      {renderWhatRequiresTargetId()}
    </>
  );
};

// TS 5.7+ made the typed arrays generic over their backing buffer. A bare
// `Uint8Array` now widens to `Uint8Array<ArrayBufferLike>`, which `BufferSource`
// (and thus `applicationServerKey`) rejects because it may be `SharedArrayBuffer`.
// We allocate a plain `ArrayBuffer`-backed array, so pin the type to match.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
