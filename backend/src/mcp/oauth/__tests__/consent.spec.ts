/**
 * Behavior tests for the consent surface. renderConsent names the client, lets the
 * user confirm a Role (a `<select>` only when there's a real choice) and an access
 * level (a radio per offered scope, the requested one checked), carries the opaque
 * request token in a hidden field, and never inlines unescaped values (XSS guard).
 */
import expect from "expect";
import { renderConsent } from "../consent";

const baseParams = {
  clientName: "Claude",
  requestToken: "req-123",
  decisionPath: "/oauth/consent/decision",
};

const role = (value: number, label: string, selected = false) => ({
  value,
  label,
  selected,
});

describe("oauth consent", () => {
  it("names the client, carries the request token, and posts to the decision path", () => {
    const html = renderConsent({
      ...baseParams,
      roles: [role(1, "Acme / Maker", true)],
      scopeChoices: [{ value: "read write", label: "Read + write", selected: true }],
    });
    expect(html).toContain("Claude");
    expect(html).toContain('value="req-123"');
    expect(html).toContain('action="/oauth/consent/decision"');
  });

  it("renders a single Role as static text with a hidden input, not a chooser", () => {
    const html = renderConsent({
      ...baseParams,
      roles: [role(7, "Acme / Maker", true)],
      scopeChoices: [{ value: "read", label: "Read only", selected: true }],
    });
    expect(html).toContain("Acme / Maker");
    expect(html).toContain('type="hidden" name="roleId" value="7"');
    expect(html).not.toContain("<select");
  });

  it("renders a <select> with every Role when the user holds more than one", () => {
    const html = renderConsent({
      ...baseParams,
      roles: [role(1, "Acme / Maker", true), role(2, "Beta / Admin")],
      scopeChoices: [{ value: "read write", label: "Read + write", selected: true }],
    });
    expect(html).toContain('<select id="roleId" name="roleId"');
    expect(html).toContain('<option value="1" selected>Acme / Maker</option>');
    expect(html).toContain('<option value="2">Beta / Admin</option>');
  });

  it("renders a radio per offered scope with the selected one checked", () => {
    const html = renderConsent({
      ...baseParams,
      roles: [role(1, "Acme / Maker", true)],
      scopeChoices: [
        { value: "read", label: "Read only", selected: false },
        { value: "read write", label: "Read + write", selected: true },
      ],
    });
    expect(html).toContain('name="scope" value="read"');
    expect(html).toContain('name="scope" value="read write" checked');
    // The unselected radio is present but not checked.
    expect(html).toContain('name="scope" value="read"> Read only');
  });

  it("escapes angle brackets in client-supplied names", () => {
    const html = renderConsent({
      ...baseParams,
      clientName: "<script>x</script>",
      roles: [role(1, "Acme / Maker", true)],
      scopeChoices: [{ value: "read", label: "Read only", selected: true }],
    });
    expect(html).not.toContain("<script>x</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
