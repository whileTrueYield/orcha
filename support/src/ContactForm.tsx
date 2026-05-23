import { FormEventHandler, useEffect, useRef, useState } from "react";
import { getCachedDescription, setCachedDescription } from "./cache";
import { getProofOfWork } from "./getProofOfWork";
import { uploadImage } from "./imageUpload";

interface Props {
  productId: string;
  url: string;
  imageData: string;
  metaData: string;
  onClose: () => void;
  onCancel: () => void;
  onClearImageData: () => void;
  email: string;
  name: string;
}

const ImageCapture = (window as any).ImageCapture;

export const ContactForm: React.FC<Props> = (props) => {
  const { productId, metaData, url, onClose, onCancel } = props;
  const [isSubmitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setDescription = (description: string) => {
    setCachedDescription(productId, description);
    _setDescription(description);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
  }, [textareaRef]);

  // Form fields
  const [description, _setDescription] = useState(
    getCachedDescription(productId)
  );

  const [email, setEmail] = useState(props.email);
  const [name, setName] = useState(props.name);

  useEffect(() => {
    setEmail(props.email);
  }, [props.email, setEmail]);

  useEffect(() => {
    setName(props.name);
  }, [props.name, setName]);

  // page behavior post submit
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onScreenShot = async () => {
    const origin = decodeURIComponent(window.location.hash.slice(1));
    window.parent.postMessage("orcha-support:screenshot", origin);
  };

  const renderScreenshotButton = () => {
    if (props.imageData) {
      return (
        <button
          type="button"
          onClick={() => props.onClearImageData()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          disabled={!ImageCapture}
        >
          <img
            src={props.imageData}
            className="h-8 w-8 mr-2 -my-2 rounded -ml-3"
            alt=""
          />
          <span>Remove</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onScreenShot}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        disabled={!ImageCapture}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 -ml-0.5 mr-1 text-gray-500"
        >
          <path
            fillRule="evenodd"
            d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
        <span>Screenshot</span>
      </button>
    );
  };

  const addImageToIssue = async (
    token: string,
    imageUrl: string
  ): Promise<string> => {
    try {
      const uploadedImageUrl = await uploadImage(imageUrl, token);

      const [proof, hash] = await getProofOfWork();
      await fetch(import.meta.env.VITE_API_URI + "/support/add_image", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          imageUrl: uploadedImageUrl,
          proof,
          hash,
        }),
      });

      return uploadedImageUrl;
    } catch {
      return "";
    }
  };

  const onSubmit: FormEventHandler = async (event) => {
    if (isSubmitting) {
      return;
    }
    setSubmitting(true);
    try {
      event.preventDefault();
      const [proof, hash] = await getProofOfWork();
      const response = await fetch(import.meta.env.VITE_API_URI + "/support", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          email,
          name,
          productId,
          origin,
          url,
          metaData,
          proof,
          hash,
        }),
      });

      const jsonResponse = await response.json();

      if (response.status === 200) {
        if (props.imageData) {
          await addImageToIssue(jsonResponse.token, props.imageData);
        }

        setSuccess(true);
        setDescription("");
        props.onClearImageData();
      } else {
        if (jsonResponse.status === "error") {
          setError(jsonResponse.data?.message);
        }
      }
    } catch {}
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="bg-gray-50 flex-col max-w-md px-4 py-6 h-full flex items-center justify-around">
        <div className="px-8">
          <div className="text-lg text-gray-600 text-center">
            Issue Submitted
          </div>
          <div className="text-sm text-gray-500 mt-4 leading-6 text-center">
            Thank you for bringing this to our attention. We'll be looking into
            your issue and will have an answer for you shortly.
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            setDescription("");
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Close
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 flex-col max-w-md px-4 py-6 flex items-center justify-around h-full">
        <div className="px-8">
          <div className="text-lg font-semibold text-red-700 text-center">
            ERROR
          </div>
          <div className="text-lg text-gray-600 text-center mt-4">{error}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("");
            onClose();
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-gray-50 max-w-md p-4 space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Your name
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            required
            type="text"
            maxLength={128}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            autoComplete="name"
            placeholder="e.g. Charlie"
            className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Your email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            required
            type="email"
            maxLength={128}
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            autoComplete="email"
            placeholder="Your email address"
            className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Describe your issue
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            ref={textareaRef}
            autoFocus
            className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border border-gray-300 rounded-md"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            placeholder="Describe how to reproduce the issue and/or what behavior you were expecting."
          />
        </div>
      </div>
      <div className="flex flex-row justify-between">
        {renderScreenshotButton()}

        <div className="flex flex-row justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Cancel
          </button>

          {isSubmitting ? (
            <button
              type="button"
              className="inline-flex items-center px-4 justify-center w-28 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-600 bg-gray-200 cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              disabled
            >
              Sending...
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center px-4 justify-center w-28 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
