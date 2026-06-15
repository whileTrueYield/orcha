/**
 * Behavior tests for the consent surface. renderConsent names the client, org,
 * and Role and carries the opaque request token in a hidden field; it never
 * inlines unescaped values (XSS guard).
 */
import expect from "expect";
import { renderConsent } from "../consent";

describe("oauth consent", () => {
  it("names the client, organization, and role and embeds the request token", () => {
    const html = renderConsent({
      clientName: "Claude",
      organizationName: "Acme",
      roleName: "Maker",
      requestToken: "req-123",
      decisionPath: "/oauth/consent/decision",
    });
    expect(html).toContain("Claude");
    expect(html).toContain("Acme");
    expect(html).toContain("Maker");
    expect(html).toContain('value="req-123"');
    expect(html).toContain('action="/oauth/consent/decision"');
  });

  it("escapes angle brackets in client-supplied names", () => {
    const html = renderConsent({
      clientName: "<script>x</script>",
      organizationName: "Acme",
      roleName: "Maker",
      requestToken: "t",
      decisionPath: "/d",
    });
    expect(html).not.toContain("<script>x</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
