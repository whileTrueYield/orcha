import "mocha";
import expect from "expect";
import {
  getHeadersFromTipTapDoc,
  getMentions,
  getPlainTextFromTipTapDoc,
  htmlSerializer,
} from "../tiptap";

const doc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "Design and develop RESTful APIs to handle user requests, data retrieval, and modification. Implement proper authentication and authorization mechanisms to secure API endpoints. ",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "and maybe ",
        },
        {
          type: "mentionRole",
          attrs: {
            id: {
              id: "1",
              label: "Amos Gregory",
            },
            label: null,
          },
        },
        {
          type: "text",
          text: " can check it out",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "Ensure consistent and intuitive API documentation ",
        },
        {
          type: "mentionRole",
          attrs: {
            id: {
              id: "123",
              label: "Bob Foo",
            },
            label: null,
          },
        },
        {
          type: "text",
          text: " to facilitate integration with frontend and third-party systems.",
        },
      ],
    },
  ],
};

describe("getMentions", () => {
  it("should return an array of mentions from a tiptap JSON doc", () => {
    expect(getMentions(doc)).toEqual([1, 123]);
  });

  it("should return an array of mentions a stringified JSON doc", () => {
    expect(getMentions(JSON.stringify(doc))).toEqual([1, 123]);
  });

  it("should fallback to an empty set when doc is invalid", () => {
    expect(getMentions(JSON.stringify("foo"))).toEqual([]);
  });
});

const documentation = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "Design and develop RESTful APIs to handle ",
        },
        {
          type: "mentionEmoji",
          attrs: {
            id: {
              id: "👅",
              label: "👅 tongue",
            },
            label: null,
          },
        },
        {
          type: "text",
          text: " user requests, data retrieval, and modification. Implement proper authentication and authorization mechanisms to secure API endpoints. ",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "and maybe Amos Gregory can check it out",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "Ensure consistent and intuitive API documentation to facilitate integration with frontend and third-party systems.",
        },
      ],
    },
  ],
};

describe("htmlSerializer", () => {
  it("serialize tiptap document into HTML", () => {
    debugger;
    expect(htmlSerializer(documentation)).toEqual(
      `<p>Design and develop RESTful APIs to handle <span class=\"emoji\">👅</span> user requests, data retrieval, and modification. Implement proper authentication and authorization mechanisms to secure API endpoints. </p><p>and maybe Amos Gregory can check it out</p><p>Ensure consistent and intuitive API documentation to facilitate integration with frontend and third-party systems.</p>`,
    );
  });
});

const docWithHeaders = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: {
        textAlign: "left",
        level: 1,
      },
      content: [
        {
          type: "text",
          text: "We have bins",
        },
        {
          type: "text",
          text: "and boxes ",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "of holiday decorations that are in various stages of disrepair. Please figure out which light strings still work and toss the ",
        },
      ],
    },
    {
      type: "heading",
      attrs: {
        textAlign: "left",
        level: 2,
      },
      content: [
        {
          type: "text",
          text: "broken ones",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: ". I think we have more non-op stuff than stuff that works. Also, if you come across an inflatable santa with a bottle of grog, let Amos know. He's been looking for that.",
        },
      ],
    },
  ],
};

describe("getPlainText", () => {
  it("extract plain text from a node", () => {
    expect(getPlainTextFromTipTapDoc(docWithHeaders.content[0])).toEqual(
      "We have bins and boxes",
    );
  });
});

describe("getHeaders", () => {
  it("extract header from a document", () => {
    expect(getHeadersFromTipTapDoc(docWithHeaders)).toEqual([
      {
        hash: "we-have-bins-and-boxes",
        level: 1,
        text: "We have bins and boxes",
      },
      { hash: "broken-ones", level: 2, text: "broken ones" },
    ]);
  });
});
