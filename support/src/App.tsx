import { useEffect, useRef, useState } from "react";
import { setCachedQuery, setCachedResults } from "./cache";
import { ContactForm } from "./ContactForm";
import { DocumentationPage } from "./DocumentationPage";
import { Header } from "./Header";
import { Home } from "./Home";
import { SearchForm } from "./SearchForm";

const App: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [metaData, setMetaData] = useState("");
  const [url, setUrl] = useState("");
  const [imageData, setImageData] = useState("");
  const [documentationId, setDocumentationId] = useState("");
  const [documentationPageId, setDocumentationPageId] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const AUTHORIZED_ORIGIN = decodeURIComponent(window.location.hash.slice(1));

  // handling message from the parent window through postMessage(...)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Do we trust the sender of this message?  (might be
      // different from what we originally opened, for example).
      if (event.origin !== AUTHORIZED_ORIGIN) {
        return;
      }

      const [action, value] = event.data
        .split(" ")
        .map(window.decodeURIComponent);

      switch (action) {
        case "show":
          // setSuccess(false);
          textareaRef.current?.focus();
          break;
        case "setEmail":
          setEmail(value);
          break;
        case "setName":
          setName(value);
          break;
        case "setProductId":
          setProductId(value);
          break;
        case "setDocumentationId":
          setDocumentationId(value);
          break;
        case "showDocumentationPageId":
          setDocumentationPageId(value);
          break;
        case "setMetaData":
          setMetaData(value);
          break;
        case "setUrl":
          setUrl(value);
          break;
        case "uploadImage":
          setImageData(value);
          break;
        default:
          console.warn("unrecognized action", action);
      }
    };

    window.addEventListener("message", onMessage, false);

    return () => {
      window.removeEventListener("message", onMessage, false);
    };
  }, [
    setEmail,
    setName,
    setProductId,
    setDocumentationId,
    setDocumentationPageId,
    setMetaData,
    setUrl,
    AUTHORIZED_ORIGIN,
  ]);

  // request the host to close the iframe
  const onClose = () => {
    window.parent.postMessage("orcha-support:close", AUTHORIZED_ORIGIN);
    setDocumentationPageId("");
    setCachedResults(documentationId, []);
    setCachedQuery(documentationId, "");
  };

  // request the host to close the iframe
  const onHide = () => {
    window.parent.postMessage("orcha-support:hide", AUTHORIZED_ORIGIN);
    setDocumentationPageId("");
    setCachedResults(documentationId, []);
    setCachedQuery(documentationId, "");
  };

  // Once the component loads, we are ready to receive messages
  useEffect(() => {
    window.parent.postMessage("orcha-support:ready", AUTHORIZED_ORIGIN);
  }, [AUTHORIZED_ORIGIN]);

  if (documentationId) {
    if (documentationPageId) {
      return (
        <>
          <Header
            onClose={onClose}
            onHide={onHide}
            onBackClick={() => setDocumentationPageId("")}
          >
            Documentation
          </Header>
          <DocumentationPage
            documentationPageId={documentationPageId}
            documentationId={documentationId}
          />
        </>
      );
    } else if (showSearchForm) {
      return (
        <>
          <Header
            onClose={onClose}
            onHide={onHide}
            onBackClick={() => setShowSearchForm(false)}
          >
            Search
          </Header>
          <div className="overflow-y-auto flex-1">
            <SearchForm
              setDocumentationPageId={setDocumentationPageId}
              documentationId={documentationId}
            />
          </div>
        </>
      );
    } else if (showContactForm) {
      return (
        <>
          <Header
            onClose={onClose}
            onHide={onHide}
            onBackClick={() => setShowContactForm(false)}
          >
            Contact Support
          </Header>
          <ContactForm
            onClose={() => {
              onClose();
              setShowContactForm(false);
            }}
            onCancel={() => setShowContactForm(false)}
            onClearImageData={() => setImageData("")}
            name={name}
            email={email}
            url={url}
            imageData={imageData}
            metaData={metaData}
            productId={productId}
          />
        </>
      );
    } else {
      return (
        <>
          <Header onClose={onClose} onHide={onHide}>
            Support
          </Header>
          <Home
            onContactClick={() => setShowContactForm(true)}
            onSearchClick={() => setShowSearchForm(true)}
            documentationId={documentationId}
          />
        </>
      );
    }
  } else {
    return (
      <>
        <Header onClose={onClose} onHide={onHide}>
          Contact Support
        </Header>
        <ContactForm
          onClose={onClose}
          onCancel={onClose}
          name={name}
          imageData={imageData}
          onClearImageData={() => setImageData("")}
          email={email}
          url={url}
          metaData={metaData}
          productId={productId}
        />
      </>
    );
  }
};

export default App;
